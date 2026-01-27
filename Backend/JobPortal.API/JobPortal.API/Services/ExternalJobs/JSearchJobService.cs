using JobPortal.API.DTOs;
using System.Text.Json;

namespace JobPortal.API.Services.ExternalJobs
{
    /// <summary>
    /// Service to fetch jobs from JSearch API (via RapidAPI)
    /// JSearch aggregates jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter, etc.
    /// 
    /// API Docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
    /// Free Tier: 200 requests/month
    /// 
    /// To get API key:
    /// 1. Sign up at https://rapidapi.com
    /// 2. Subscribe to JSearch API (free plan)
    /// 3. Add your API key to appsettings.json under "JSearch:ApiKey"
    /// </summary>
    public class JSearchJobService : IExternalJobProvider
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string? _apiKey;

        public JSearchJobService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _apiKey = Environment.GetEnvironmentVariable("JSEARCH_API_KEY");
        }

        public async Task<List<ExternalJobDto>> FetchJobs(string keyword, string location)
        {
            // Check if API key is configured
            if (string.IsNullOrEmpty(_apiKey))
            {
                Console.WriteLine("JSearch API key not configured. Add 'JSearch:ApiKey' to appsettings.json");
                return new List<ExternalJobDto>();
            }

            try
            {
                // Build the request URL
                var query = Uri.EscapeDataString(keyword ?? "software developer");
                var loc = Uri.EscapeDataString(location ?? "India");
                var url = $"https://jsearch.p.rapidapi.com/search?query={query}%20in%20{loc}&page=1&num_pages=1";

                // Create request with RapidAPI headers
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("X-RapidAPI-Key", _apiKey);
                request.Headers.Add("X-RapidAPI-Host", "jsearch.p.rapidapi.com");

                var response = await _httpClient.SendAsync(request);
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"JSearch API error: {response.StatusCode}");
                    return new List<ExternalJobDto>();
                }

                var content = await response.Content.ReadAsStringAsync();
                var json = JsonDocument.Parse(content);

                // Check if data exists
                if (!json.RootElement.TryGetProperty("data", out var dataElement))
                {
                    return new List<ExternalJobDto>();
                }

                return dataElement
                    .EnumerateArray()
                    .Take(30) // Limit results
                    .Select(j => MapToExternalJobDto(j))
                    .Where(j => j != null)
                    .ToList()!;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching JSearch jobs: {ex.Message}");
                return new List<ExternalJobDto>();
            }
        }

        private ExternalJobDto? MapToExternalJobDto(JsonElement job)
        {
            try
            {
                // Determine the source platform
                var employer = GetStringProperty(job, "employer_name") ?? "Unknown";
                var jobPublisher = GetStringProperty(job, "job_publisher") ?? "JSearch";

                return new ExternalJobDto
                {
                    Source = jobPublisher, // LinkedIn, Indeed, Glassdoor, etc.
                    SourceLogo = GetEmployerLogo(job),
                    Title = GetStringProperty(job, "job_title"),
                    Company = employer,
                    CompanyLogo = GetStringProperty(job, "employer_logo"),
                    Location = BuildLocationString(job),
                    Description = GetStringProperty(job, "job_description"),
                    JobType = GetStringProperty(job, "job_employment_type"),
                    SalaryRange = BuildSalaryString(job),
                    Category = GetStringProperty(job, "job_job_title"), // Job category
                    Tags = GetHighlights(job),
                    PostedAt = GetDateProperty(job, "job_posted_at_datetime_utc"),
                    ApplyUrl = GetApplyLink(job)
                };
            }
            catch
            {
                return null;
            }
        }

        private string? GetStringProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind != JsonValueKind.Null
                ? prop.GetString()
                : null;
        }

        private bool GetBoolProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && 
                   prop.ValueKind == JsonValueKind.True;
        }

        private double? GetDoubleProperty(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Number)
            {
                return prop.GetDouble();
            }
            return null;
        }

        private DateTime? GetDateProperty(JsonElement element, string propertyName)
        {
            var dateStr = GetStringProperty(element, propertyName);
            if (!string.IsNullOrEmpty(dateStr) && DateTime.TryParse(dateStr, out var date))
            {
                return date;
            }
            return null;
        }

        private string? GetEmployerLogo(JsonElement job)
        {
            // Try to get employer logo, fallback to a default based on publisher
            var logo = GetStringProperty(job, "employer_logo");
            if (!string.IsNullOrEmpty(logo)) return logo;

            var publisher = GetStringProperty(job, "job_publisher")?.ToLower();
            return publisher switch
            {
                "linkedin" => "https://cdn-icons-png.flaticon.com/512/174/174857.png",
                "indeed" => "https://cdn-icons-png.flaticon.com/512/5968/5968858.png",
                "glassdoor" => "https://www.glassdoor.com/favicon.ico",
                "naukri" => "https://static.naukimg.com/s/4/100/i/naukri_Logo.png",
                _ => null
            };
        }

        private string BuildLocationString(JsonElement job)
        {
            var city = GetStringProperty(job, "job_city");
            var state = GetStringProperty(job, "job_state");
            var country = GetStringProperty(job, "job_country");
            var isRemote = GetBoolProperty(job, "job_is_remote");

            var parts = new List<string>();
            if (!string.IsNullOrEmpty(city)) parts.Add(city);
            if (!string.IsNullOrEmpty(state)) parts.Add(state);
            if (!string.IsNullOrEmpty(country)) parts.Add(country);

            var location = string.Join(", ", parts);
            
            if (isRemote)
            {
                location = string.IsNullOrEmpty(location) ? "Remote" : $"{location} (Remote)";
            }

            return string.IsNullOrEmpty(location) ? "Not specified" : location;
        }

        private string? BuildSalaryString(JsonElement job)
        {
            var minSalary = GetDoubleProperty(job, "job_min_salary");
            var maxSalary = GetDoubleProperty(job, "job_max_salary");
            var currency = GetStringProperty(job, "job_salary_currency") ?? "INR";
            var period = GetStringProperty(job, "job_salary_period") ?? "YEAR";

            if (minSalary.HasValue || maxSalary.HasValue)
            {
                var periodLabel = period.ToUpper() switch
                {
                    "YEAR" => "/year",
                    "MONTH" => "/month",
                    "HOUR" => "/hour",
                    _ => ""
                };

                if (minSalary.HasValue && maxSalary.HasValue)
                {
                    return $"{currency} {minSalary:N0} - {maxSalary:N0}{periodLabel}";
                }
                else if (minSalary.HasValue)
                {
                    return $"{currency} {minSalary:N0}+{periodLabel}";
                }
                else
                {
                    return $"Up to {currency} {maxSalary:N0}{periodLabel}";
                }
            }

            return null;
        }

        private string[]? GetHighlights(JsonElement job)
        {
            var highlights = new List<string>();

            // Add employment type as tag
            var empType = GetStringProperty(job, "job_employment_type");
            if (!string.IsNullOrEmpty(empType))
            {
                highlights.Add(empType.Replace("_", " "));
            }

            // Add remote tag
            if (GetBoolProperty(job, "job_is_remote"))
            {
                highlights.Add("Remote");
            }

            // Try to get qualifications/highlights from job_highlights
            if (job.TryGetProperty("job_highlights", out var highlightsObj) && 
                highlightsObj.ValueKind == JsonValueKind.Object)
            {
                if (highlightsObj.TryGetProperty("Qualifications", out var quals) && 
                    quals.ValueKind == JsonValueKind.Array)
                {
                    foreach (var qual in quals.EnumerateArray().Take(3))
                    {
                        var qualStr = qual.GetString();
                        if (!string.IsNullOrEmpty(qualStr) && qualStr.Length < 50)
                        {
                            highlights.Add(qualStr);
                        }
                    }
                }
            }

            // Get required skills if available
            if (job.TryGetProperty("job_required_skills", out var skills) && 
                skills.ValueKind == JsonValueKind.Array)
            {
                foreach (var skill in skills.EnumerateArray().Take(5))
                {
                    var skillStr = skill.GetString();
                    if (!string.IsNullOrEmpty(skillStr))
                    {
                        highlights.Add(skillStr);
                    }
                }
            }

            return highlights.Count > 0 ? highlights.Distinct().Take(6).ToArray() : null;
        }

        private string? GetApplyLink(JsonElement job)
        {
            // Priority: direct apply link > job apply link > google jobs link
            var applyLink = GetStringProperty(job, "job_apply_link");
            if (!string.IsNullOrEmpty(applyLink)) return applyLink;

            // Try apply options
            if (job.TryGetProperty("apply_options", out var options) && 
                options.ValueKind == JsonValueKind.Array)
            {
                foreach (var option in options.EnumerateArray())
                {
                    var link = GetStringProperty(option, "apply_link");
                    if (!string.IsNullOrEmpty(link)) return link;
                }
            }

            // Fallback to Google Jobs link
            return GetStringProperty(job, "job_google_link");
        }
    }
}
