using JobPortal.API.Data;
using JobPortal.API.DTOs;
using JobPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers
{
    [ApiController]
    [Route("api/jobs")]
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🌍 PUBLIC: GET ALL JOBS (NO AUTH)
        [HttpGet]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _context.Jobs
                .OrderByDescending(j => j.PostedAt)
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Description,
                    j.Requirements,
                    j.WorkLocation,
                    j.SalaryRange,
                    j.PostedAt,
                    j.EmployerId
                })
                .ToListAsync();

            return Ok(jobs);
        }

        // 🔐 EMPLOYER ONLY: POST JOB
        [HttpPost]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> PostJob(CreateJobDto dto)
        {
            var employerIdClaim = User.FindFirst("userId")?.Value;

            if (employerIdClaim == null)
                return Unauthorized("Employer ID missing in token");

            var job = new Job
            {
                Title = dto.Title,
                Description = dto.Description,
                Requirements = dto.Requirements,
                WorkLocation = dto.WorkLocation,
                SalaryRange = dto.SalaryRange,
                EmployerId = int.Parse(employerIdClaim)
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Job posted successfully",
                job.Id
            });
        }
    }
}
