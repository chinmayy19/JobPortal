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

        // 🔐 EMPLOYER ONLY: GET MY JOBS
        [HttpGet("my-jobs")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> GetMyJobs()
        {
            var employerIdClaim = User.FindFirst("userId")?.Value;

            if (employerIdClaim == null)
                return Unauthorized("Employer ID missing in token");

            var employerId = int.Parse(employerIdClaim);

            var jobs = await _context.Jobs
                .Where(j => j.EmployerId == employerId)
                .OrderByDescending(j => j.PostedAt)
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Description,
                    j.Requirements,
                    j.WorkLocation,
                    j.SalaryRange,
                    j.PostedAt
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

        // 🔐 EMPLOYER ONLY: UPDATE JOB
        [HttpPut("{id}")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> UpdateJob(int id, [FromBody] CreateJobDto dto)
        {
            try
            {
                var employerIdClaim = User.FindFirst("userId")?.Value;

                if (employerIdClaim == null)
                    return Unauthorized(new { message = "Employer ID missing in token" });

                var employerId = int.Parse(employerIdClaim);

                var job = await _context.Jobs.FindAsync(id);

                if (job == null)
                    return NotFound(new { message = "Job not found" });

                if (job.EmployerId != employerId)
                    return StatusCode(403, new { message = "You can only edit your own jobs" });

                job.Title = dto.Title;
                job.Description = dto.Description;
                job.Requirements = dto.Requirements;
                job.WorkLocation = dto.WorkLocation;
                job.SalaryRange = dto.SalaryRange;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Job updated successfully",
                    job.Id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the job", error = ex.Message });
            }
        }

        // 🔐 EMPLOYER ONLY: DELETE JOB
        [HttpDelete("{id}")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var employerIdClaim = User.FindFirst("userId")?.Value;

            if (employerIdClaim == null)
                return Unauthorized("Employer ID missing in token");

            var employerId = int.Parse(employerIdClaim);

            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound("Job not found");

            if (job.EmployerId != employerId)
                return Forbid("You can only delete your own jobs");

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job deleted successfully" });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchJobs(
    [FromQuery] string? keyword,
    [FromQuery] string? location,
    [FromQuery] string? skill,
    [FromQuery] int? minSalary)
        {
            var query = _context.Jobs.AsQueryable();

            // 🔍 Keyword search (Title / Description / Requirements)
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(j =>
                    j.Title.Contains(keyword) ||
                    j.Description.Contains(keyword) ||
                    j.Requirements.Contains(keyword)
                );
            }

            // 📍 Location filter
            if (!string.IsNullOrWhiteSpace(location))
            {
                query = query.Where(j =>
                    j.WorkLocation.Contains(location)
                );
            }

            // 🧠 Skill-based filter (CORE FEATURE)
            if (!string.IsNullOrWhiteSpace(skill))
            {
                query = query.Where(j =>
                    j.Requirements.Contains(skill)
                );
            }

            // 💰 Minimum salary (basic numeric handling)
            if (minSalary.HasValue)
            {
                query = query.Where(j =>
                    j.SalaryRange.Contains(minSalary.Value.ToString())
                );
            }

            var results = await query
                .OrderByDescending(j => j.PostedAt)
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.WorkLocation,
                    j.SalaryRange,
                    j.PostedAt
                })
                .ToListAsync();

            return Ok(results);
        }
    }
}
