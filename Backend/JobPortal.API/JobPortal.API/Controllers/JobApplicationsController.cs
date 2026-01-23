using JobPortal.API.Data;
using JobPortal.API.DTOs;
using JobPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers
{
    [ApiController]
    [Route("api/applications")]
    public class JobApplicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public JobApplicationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // APPLY JOB
        [HttpPost("apply")]
        [Authorize(Roles = "jobseeker")] // 🔐 ONLY JOBSEEKERS
        public async Task<IActionResult> ApplyJob(ApplyJobDto dto)
        {
            var applicantIdClaim = User.FindFirst("userId")?.Value;

            if (applicantIdClaim == null)
                return Unauthorized();

            int applicantId = int.Parse(applicantIdClaim);

            // Check job exists
            var jobExists = await _context.Jobs.AnyAsync(j => j.Id == dto.JobId);
            if (!jobExists)
                return NotFound("Job not found");

            // Prevent duplicate application
            var alreadyApplied = await _context.JobApplications.AnyAsync(
                a => a.JobId == dto.JobId && a.ApplicantId == applicantId
            );

            if (alreadyApplied)
                return BadRequest("You have already applied for this job");

            var application = new JobApplication
            {
                JobId = dto.JobId,
                ApplicantId = applicantId

            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Job applied successfully",
                application.Id
            });
        }

        // 👔 EMPLOYER: VIEW APPLICANTS FOR A JOB
        [HttpGet("job/{jobId}")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> GetApplicantsForJob(int jobId)
        {
            // Get employerId from JWT
            var employerIdClaim = User.FindFirst("userId")?.Value;
            if (employerIdClaim == null)
                return Unauthorized();

            int employerId = int.Parse(employerIdClaim);

            // Verify job belongs to this employer
            var jobOwned = await _context.Jobs
                .AnyAsync(j => j.Id == jobId && j.EmployerId == employerId);

            if (!jobOwned)
                return Forbid("You are not authorized to view applicants for this job");

            // Fetch applicants
            var applicants = await _context.JobApplications
                .Where(a => a.JobId == jobId)
                .Include(a => a.Applicant)
                .Select(a => new JobApplicantDto
                {
                    ApplicationId = a.Id,
                    ApplicantId = a.ApplicantId,
                    ApplicantName = a.Applicant.FullName,
                    ApplicantEmail = a.Applicant.Email,
                    Status = a.Status,
                    AppliedAt = a.AppliedAt
                })
                .ToListAsync();

            return Ok(applicants);
        }

        // 🧑‍💼 JOBSEEKER: VIEW APPLIED JOBS
        [HttpGet("my")]
        [Authorize(Roles = "jobseeker")]
        public async Task<IActionResult> GetMyAppliedJobs()
        {
            var applicantIdClaim = User.FindFirst("userId")?.Value;
            if (applicantIdClaim == null)
                return Unauthorized();

            int applicantId = int.Parse(applicantIdClaim);

            var appliedJobs = await _context.JobApplications
                .Where(a => a.ApplicantId == applicantId)
                .Include(a => a.Job)
                .ThenInclude(j => j.Employer)
                .OrderByDescending(a => a.AppliedAt)
                .Select(a => new AppliedJobDto
                {
                    ApplicationId = a.Id,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    CompanyOrEmployer = a.Job.Employer.FullName,
                    WorkLocation = a.Job.WorkLocation,
                    SalaryRange = a.Job.SalaryRange,
                    Status = a.Status,
                    AppliedAt = a.AppliedAt
                })
                .ToListAsync();

            return Ok(appliedJobs);
        }

    }
}
