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
        // CHANGE: Updated to accept and save additional applicant details
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

            // CHANGE: Update user's phone if provided
            if (!string.IsNullOrEmpty(dto.Phone))
            {
                var user = await _context.Users.FindAsync(applicantId);
                if (user != null)
                {
                    user.Phone = dto.Phone;
                }
            }

            // CHANGE: Update or create JobSeekerProfile with location preference and skills
            var profile = await _context.JobSeekerProfiles.FirstOrDefaultAsync(p => p.UserId == applicantId);
            if (profile != null)
            {
                // Update existing profile
                if (!string.IsNullOrEmpty(dto.LocationPreference))
                    profile.LocationPreference = dto.LocationPreference;
                if (!string.IsNullOrEmpty(dto.Skills))
                    profile.Skills = dto.Skills;
            }
            else
            {
                // Create new profile if doesn't exist
                profile = new JobSeekerProfile
                {
                    UserId = applicantId,
                    LocationPreference = dto.LocationPreference,
                    Skills = dto.Skills
                };
                _context.JobSeekerProfiles.Add(profile);
            }

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
        // CHANGE: Updated to include phone, location preference, and skills
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

            // CHANGE: Fetch applicants with additional profile details
            var applicants = await _context.JobApplications
                .Where(a => a.JobId == jobId)
                .Include(a => a.Applicant)
                .Select(a => new JobApplicantDto
                {
                    ApplicationId = a.Id,
                    ApplicantId = a.ApplicantId,
                    ApplicantName = a.Applicant.FullName,
                    ApplicantEmail = a.Applicant.Email,
                    // CHANGE: Include phone from User model
                    ApplicantPhone = a.Applicant.Phone,
                    // CHANGE: Include location preference from JobSeekerProfile
                    LocationPreference = _context.JobSeekerProfiles
                        .Where(p => p.UserId == a.ApplicantId)
                        .Select(p => p.LocationPreference)
                        .FirstOrDefault(),
                    // CHANGE: Include skills from JobSeekerProfile
                    Skills = _context.JobSeekerProfiles
                        .Where(p => p.UserId == a.ApplicantId)
                        .Select(p => p.Skills)
                        .FirstOrDefault(),
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

        // ❌ JOBSEEKER: WITHDRAW/REVOKE JOB APPLICATION
        // CHANGE: New endpoint to allow jobseekers to withdraw their application (fix misclicks)
        [HttpDelete("{applicationId}/withdraw")]
        [Authorize(Roles = "jobseeker")]
        public async Task<IActionResult> WithdrawApplication(int applicationId)
        {
            var applicantIdClaim = User.FindFirst("userId")?.Value;
            if (applicantIdClaim == null)
                return Unauthorized();

            int applicantId = int.Parse(applicantIdClaim);

            // Find the application
            var application = await _context.JobApplications
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                return NotFound(new { message = "Application not found" });

            // Verify the application belongs to this jobseeker
            if (application.ApplicantId != applicantId)
                return Forbid("You can only withdraw your own applications");

            // Check if already processed (accepted/rejected) - optional: prevent withdrawal
            if (application.Status == "Accepted" || application.Status == "Rejected")
                return BadRequest(new { message = $"Cannot withdraw application that has been {application.Status.ToLower()}" });

            // Remove the application
            _context.JobApplications.Remove(application);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Application withdrawn successfully",
                applicationId = applicationId
            });
        }

        // ✅ EMPLOYER: UPDATE APPLICATION STATUS (Accept/Reject/Pending)
        // CHANGE: New endpoint to allow employers to update the status of job applications
        [HttpPut("{applicationId}/status")]
        [Authorize(Roles = "employer")]
        public async Task<IActionResult> UpdateApplicationStatus(int applicationId, [FromBody] UpdateStatusDto dto)
        {
            // Get employerId from JWT
            var employerIdClaim = User.FindFirst("userId")?.Value;
            if (employerIdClaim == null)
                return Unauthorized();

            int employerId = int.Parse(employerIdClaim);

            // Find the application with job details
            var application = await _context.JobApplications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                return NotFound(new { message = "Application not found" });

            // Verify the job belongs to this employer
            if (application.Job.EmployerId != employerId)
                return Forbid("You are not authorized to update this application");

            // Validate the status value
            var validStatuses = new[] { "Applied", "Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected" };
            if (!validStatuses.Contains(dto.Status, StringComparer.OrdinalIgnoreCase))
                return BadRequest(new { message = $"Invalid status. Valid values are: {string.Join(", ", validStatuses)}" });

            // Update the status
            application.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Application status updated successfully",
                applicationId = application.Id,
                newStatus = application.Status
            });
        }

    }
}
