using JobPortal.API.DTOs;
using JobPortal.API.Services.ExternalJobs;
using System.Text.Json;

namespace JobPortal.API.Services
{
    public class RemotiveJobService : IExternalJobProvider
    {
        private readonly HttpClient _httpClient;

        public RemotiveJobService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<ExternalJobDto>> FetchJobs(string keyword, string location)
        {
            var response = await _httpClient.GetStringAsync(
                $"https://remotive.com/api/remote-jobs?search={keyword}"
            );

            var json = JsonDocument.Parse(response);

            return json.RootElement
                .GetProperty("jobs")
                .EnumerateArray()
                .Select(j => new ExternalJobDto
                {
                    Source = "Remotive",
                    Title = j.GetProperty("title").GetString(),
                    Company = j.GetProperty("company_name").GetString(),
                    Location = j.GetProperty("candidate_required_location").GetString(),
                    Description = j.GetProperty("description").GetString(),
                    ApplyUrl = j.GetProperty("url").GetString()
                })
                .ToList();
        }
    }
}
