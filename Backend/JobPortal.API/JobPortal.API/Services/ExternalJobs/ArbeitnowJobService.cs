using JobPortal.API.DTOs;
using System.Text.Json;

namespace JobPortal.API.Services.ExternalJobs
{
    /// <summary>
    /// Service to fetch jobs from Arbeitnow API (Free, no API key required)
    /// API Docs: https://www.arbeitnow.com/api
    /// Provides European job listings
    /// </summary>
    public class ArbeitnowJobService : IExternalJobProvider
    {
        private readonly HttpClient _httpClient;

        public ArbeitnowJobService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<ExternalJobDto>> FetchJobs(string keyword, string location)
        {
            try
            {
                // Arbeitnow API endpoint
                var url = "https://www.arbeitnow.com/api/job-board-api";
                
                var response = await _httpClient.GetStringAsync(url);
                var json = JsonDocument.Parse(response);

                var jobs = json.RootElement
                    .GetProperty("data")
                    .EnumerateArray()
                    .Select(j => new ExternalJobDto
                    {
                        Source = "Arbeitnow",
                        SourceLogo = "https://www.arbeitnow.com/favicon.ico",
                        Title = GetStringProperty(j, "title"),
                        Company = GetStringProperty(j, "company_name"),
                        CompanyLogo = GetStringProperty(j, "company_logo"),
                        Location = GetStringProperty(j, "location") ?? "Remote",
                        Description = GetStringProperty(j, "description"),
                        JobType = GetJobType(j),
                        Tags = GetTagsArray(j, "tags"),
                        PostedAt = GetDateFromTimestamp(j, "created_at"),
                        ApplyUrl = GetStringProperty(j, "url")
                    })
                    .ToList();

                // Filter by keyword if provided
                if (!string.IsNullOrEmpty(keyword))
                {
                    keyword = keyword.ToLower();
                    jobs = jobs.Where(j => 
                        (j.Title?.ToLower().Contains(keyword) ?? false) ||
                        (j.Company?.ToLower().Contains(keyword) ?? false) ||
                        (j.Description?.ToLower().Contains(keyword) ?? false) ||
                        (j.Tags?.Any(t => t.ToLower().Contains(keyword)) ?? false)
                    ).ToList();
                }

                // Filter by location if provided
                if (!string.IsNullOrEmpty(location))
                {
                    location = location.ToLower();
                    jobs = jobs.Where(j => 
                        j.Location?.ToLower().Contains(location) ?? false
                    ).ToList();
                }

                return jobs.Take(30).ToList(); // Limit results
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching Arbeitnow jobs: {ex.Message}");
                return new List<ExternalJobDto>();
            }
        }

        private string? GetStringProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind != JsonValueKind.Null
                ? prop.GetString()
                : null;
        }

        private string? GetJobType(JsonElement element)
        {
            var remote = element.TryGetProperty("remote", out var prop) && prop.GetBoolean();
            return remote ? "Remote" : "On-site";
        }

        private DateTime? GetDateFromTimestamp(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Number)
            {
                var timestamp = prop.GetInt64();
                return DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime;
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
