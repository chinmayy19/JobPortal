using JobPortal.API.DTOs;

namespace JobPortal.API.Services.ExternalJobs
{
    public interface IExternalJobProvider
    {
        Task<List<ExternalJobDto>> FetchJobs(string keyword, string location);
    }
}
