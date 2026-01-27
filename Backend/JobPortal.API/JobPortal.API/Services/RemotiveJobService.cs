using JobPortal.API.DTOs;
using JobPortal.API.Services.ExternalJobs;
using System.Text.Json;

namespace JobPortal.API.Services
{
    /// <summary>
    /// Service to fetch remote jobs from Remotive.com API
    /// CHANGE: Enhanced to include more job details
    /// API Docs: https://remotive.com/api-documentation
    /// </summary>
    public class RemotiveJobService : IExternalJobProvider
    {
        private readonly HttpClient _httpClient;

        public RemotiveJobService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<ExternalJobDto>> FetchJobs(string keyword, string location)
        {
            try
            {
                // Build URL with optional category filter
                var url = "https://remotive.com/api/remote-jobs";
                if (!string.IsNullOrEmpty(keyword))
                {
                    url += $"?search={Uri.EscapeDataString(keyword)}";
                }

                var response = await _httpClient.GetStringAsync(url);
                var json = JsonDocument.Parse(response);

                return json.RootElement
                    .GetProperty("jobs")
                    .EnumerateArray()
                    .Take(50) // Limit to 50 jobs for performance
                    .Select(j => new ExternalJobDto
                    {
                        Source = "Remotive",
                        SourceLogo = "https://remotive.com/favicon.ico",
                        Title = GetStringProperty(j, "title"),
                        Company = GetStringProperty(j, "company_name"),
                        CompanyLogo = GetStringProperty(j, "company_logo"),
                        Location = GetStringProperty(j, "candidate_required_location") ?? "Remote",
                        Description = GetStringProperty(j, "description"),
                        JobType = GetStringProperty(j, "job_type"),
                        SalaryRange = GetStringProperty(j, "salary"),
                        Category = GetStringProperty(j, "category"),
                        Tags = GetTagsArray(j, "tags"),
                        PostedAt = GetDateProperty(j, "publication_date"),
                        ApplyUrl = GetStringProperty(j, "url")
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching Remotive jobs: {ex.Message}");
                return new List<ExternalJobDto>();
            }
        }

        private string? GetStringProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind != JsonValueKind.Null
                ? prop.GetString()
                : null;
        }

        private DateTime? GetDateProperty(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind != JsonValueKind.Null)
            {
                if (DateTime.TryParse(prop.GetString(), out var date))
                    return date;
            }
            return null;
        }

        private string[]? GetTagsArray(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                return prop.EnumerateArray()
                    .Select(t => t.GetString())
                    .Where(t => t != null)
                    .ToArray()!;
            }
            return null;
        }
    }
}
