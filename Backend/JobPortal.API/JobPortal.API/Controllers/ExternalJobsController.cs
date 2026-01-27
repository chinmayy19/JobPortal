using JobPortal.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers
{
    [ApiController]
    [Route("api/external-jobs")]
    public class ExternalJobsController : ControllerBase
    {
        private readonly RemotiveJobService _remotive;

        public ExternalJobsController(RemotiveJobService remotive)
        {
            _remotive = remotive;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchExternalJobs(
            [FromQuery] string keyword,
            [FromQuery] string location)
        {
            var jobs = await _remotive.FetchJobs(keyword, location);
            return Ok(jobs);
        }
    }
}
