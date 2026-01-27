using JobPortal.API.Data;
using JobPortal.API.DTOs;
using JobPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers
{
    /// <summary>
    /// Controller for managing user profiles
    /// Handles profile viewing, updating, and skill-based job recommendations
    /// </summary>
    [ApiController]
    [Route("api/profile")]
    [Authorize(Roles = "jobseeker")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get the current user's complete profile
        /// Combines User and JobSeekerProfile data
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");

            var profile = await _context.JobSeekerProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            var profileDto = new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Education = profile?.Education,
                Experience = profile?.Experience,
                Skills = profile?.Skills,
                LocationPreference = profile?.LocationPreference,
                HasResume = !string.IsNullOrEmpty(profile?.ResumePath),
                CreatedAt = user.CreatedAt
            };

            return Ok(profileDto);
        }

        /// <summary>
        /// Update user profile information
        /// Updates both User and JobSeekerProfile
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");

            // Update User fields
            if (!string.IsNullOrEmpty(dto.FullName))
                user.FullName = dto.FullName;
            if (!string.IsNullOrEmpty(dto.Phone))
                user.Phone = dto.Phone;

            // Update or create JobSeekerProfile
            var profile = await _context.JobSeekerProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                profile = new JobSeekerProfile
                {
                    UserId = userId,
                    Education = dto.Education ?? "",
                    Experience = dto.Experience ?? "",
                    Skills = dto.Skills ?? "",
                    LocationPreference = dto.LocationPreference ?? ""
                };
                _context.JobSeekerProfiles.Add(profile);
            }
            else
            {
                if (dto.Education != null)
                    profile.Education = dto.Education;
                if (dto.Experience != null)
                    profile.Experience = dto.Experience;
                if (dto.Skills != null)
                    profile.Skills = dto.Skills;
                if (dto.LocationPreference != null)
                    profile.LocationPreference = dto.LocationPreference;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully",
                profile = new UserProfileDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Education = profile.Education,
                    Experience = profile.Experience,
                    Skills = profile.Skills,
                    LocationPreference = profile.LocationPreference,
                    HasResume = !string.IsNullOrEmpty(profile.ResumePath),
                    CreatedAt = user.CreatedAt
                }
            });
        }

        /// <summary>
        /// Get job recommendations based on user's skills
        /// Matches jobs where requirements contain any of the user's skills
        /// </summary>
        [HttpGet("recommendations")]
        public async Task<IActionResult> GetJobRecommendations()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);

            var profile = await _context.JobSeekerProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null || string.IsNullOrEmpty(profile.Skills))
            {
                // Return latest jobs if no skills defined
                var latestJobs = await _context.Jobs
                    .OrderByDescending(j => j.PostedAt)
                    .Take(10)
                    .Select(j => new
                    {
                        j.Id,
                        j.Title,
                        j.Description,
                        j.Requirements,
                        j.WorkLocation,
                        j.SalaryRange,
                        j.PostedAt,
                        MatchScore = 0,
                        MatchedSkills = new string[] { }
                    })
                    .ToListAsync();

                return Ok(new
                {
                    message = "Add skills to get personalized recommendations",
                    hasSkills = false,
                    recommendations = latestJobs
                });
            }

            // Parse user skills (comma-separated)
            var userSkills = profile.Skills
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().ToLower())
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();

            // Get all jobs
            var allJobs = await _context.Jobs
                .OrderByDescending(j => j.PostedAt)
                .ToListAsync();

            // Calculate match score for each job
            var recommendations = allJobs
                .Select(job =>
                {
                    var jobRequirements = (job.Requirements ?? "").ToLower();
                    var jobTitle = (job.Title ?? "").ToLower();
                    var jobDescription = (job.Description ?? "").ToLower();

                    var matchedSkills = userSkills
                        .Where(skill =>
                            jobRequirements.Contains(skill) ||
                            jobTitle.Contains(skill) ||
                            jobDescription.Contains(skill))
                        .ToList();

                    return new
                    {
                        job.Id,
                        job.Title,
                        job.Description,
                        job.Requirements,
                        job.WorkLocation,
                        job.SalaryRange,
                        job.PostedAt,
                        MatchScore = matchedSkills.Count,
                        MatchedSkills = matchedSkills.ToArray()
                    };
                })
                .Where(j => j.MatchScore > 0)  // Only jobs with at least 1 matching skill
                .OrderByDescending(j => j.MatchScore)
                .ThenByDescending(j => j.PostedAt)
                .Take(20)
                .ToList();

            // If no matches found, return latest jobs
            if (recommendations.Count == 0)
            {
                var latestJobs = allJobs
                    .Take(10)
                    .Select(j => new
                    {
                        j.Id,
                        j.Title,
                        j.Description,
                        j.Requirements,
                        j.WorkLocation,
                        j.SalaryRange,
                        j.PostedAt,
                        MatchScore = 0,
                        MatchedSkills = new string[] { }
                    })
                    .ToList();

                return Ok(new
                {
                    message = "No exact matches found. Showing latest jobs.",
                    hasSkills = true,
                    userSkills = userSkills,
                    recommendations = latestJobs
                });
            }

            return Ok(new
            {
                message = $"Found {recommendations.Count} jobs matching your skills",
                hasSkills = true,
                userSkills = userSkills,
                recommendations = recommendations
            });
        }

        /// <summary>
        /// Get skill suggestions based on job market trends
        /// Returns skills that appear frequently in job requirements
        /// </summary>
        [HttpGet("skill-suggestions")]
        public async Task<IActionResult> GetSkillSuggestions()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);

            var profile = await _context.JobSeekerProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            var userSkills = new List<string>();
            if (profile != null && !string.IsNullOrEmpty(profile.Skills))
            {
                userSkills = profile.Skills
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim().ToLower())
                    .ToList();
            }

            // Get all job requirements
            var allRequirements = await _context.Jobs
                .Select(j => j.Requirements)
                .ToListAsync();

            // Extract and count skills from job requirements
            var skillFrequency = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            foreach (var req in allRequirements)
            {
                if (string.IsNullOrEmpty(req)) continue;

                var skills = req.Split(new[] { ',', ';', '/', '|' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Where(s => s.Length > 1 && s.Length < 30);

                foreach (var skill in skills)
                {
                    if (skillFrequency.ContainsKey(skill))
                        skillFrequency[skill]++;
                    else
                        skillFrequency[skill] = 1;
                }
            }

            // Get top skills that user doesn't have
            var suggestedSkills = skillFrequency
                .Where(kvp => !userSkills.Contains(kvp.Key.ToLower()))
                .OrderByDescending(kvp => kvp.Value)
                .Take(15)
                .Select(kvp => new
                {
                    Skill = kvp.Key,
                    Demand = kvp.Value,
                    DemandLevel = kvp.Value > 5 ? "High" : kvp.Value > 2 ? "Medium" : "Low"
                })
                .ToList();

            return Ok(new
            {
                userSkills = userSkills,
                suggestions = suggestedSkills
            });
        }
    }
}
