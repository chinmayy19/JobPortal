using JobPortal.API.Data;
using JobPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers
{
    [ApiController]
    [Route("api/resume")]
    [Authorize(Roles = "jobseeker")] // 🔐 Only jobseekers
    public class ResumeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        public ResumeController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // 📤 UPLOAD RESUME
        [HttpPost("upload")]
        public async Task<IActionResult> UploadResume(IFormFile resume)
        {
            if (resume == null || resume.Length == 0)
                return BadRequest("Resume file is required");

            var extension = Path.GetExtension(resume.FileName).ToLower();
            if (extension != ".pdf" && extension != ".doc" && extension != ".docx")
                return BadRequest("Only PDF or DOC/DOCX files are allowed");

            // Get logged-in userId
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // Create uploads folder if not exists
            var uploadsFolder = Path.Combine(_env.ContentRootPath, "Uploads", "Resumes");
            Directory.CreateDirectory(uploadsFolder);

            // Unique filename
            var fileName = $"resume_{userId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await resume.CopyToAsync(stream);
            }

            // Save or update JobSeekerProfile
            var profile = _context.JobSeekerProfiles.FirstOrDefault(p => p.UserId == userId);
            if (profile == null)
            {
                profile = new JobSeekerProfile
                {
                    UserId = userId,
                    ResumePath = filePath,
                    Education = "",      // ✅ Set default empty string
                    Experience = "",     // ✅ Set default empty string
                    Skills = ""
                };
                _context.JobSeekerProfiles.Add(profile);
            }
            else
            {
                profile.ResumePath = filePath;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Resume uploaded successfully",
                resumePath = fileName
            });
        }
    }
}
