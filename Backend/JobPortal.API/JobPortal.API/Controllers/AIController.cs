using JobPortal.API.Data;
using JobPortal.API.Models;
using JobPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace JobPortal.API.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Authorize(Roles = "jobseeker")]
    public class AIController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public AIController(
            ApplicationDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpPost("analyze-resume")]
        public async Task<IActionResult> AnalyzeResume()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);

            var profile = _context.JobSeekerProfiles.FirstOrDefault(p => p.UserId == userId);
            if (profile == null || string.IsNullOrEmpty(profile.ResumePath))
                return BadRequest("Resume not uploaded");

            // 🔹 1. Extract full resume text
            var resumeText = ResumeTextExtractor.ExtractText(profile.ResumePath);

            resumeText = resumeText
                .Replace("----------------------------------------------------------------------------------------------------------------------------------------------", "\n")
                .Replace("\r", " ")
                .Replace("\n", " ")
                .Replace("  ", " ");

            // 🔹 2. Extract ONLY skills section (local logic)
            var skillsText = ExtractSkillsSection(resumeText);

            if (string.IsNullOrEmpty(skillsText))
                return Ok(new { message = "No skills section found in resume" });

            // 🔹 3. Gemini used ONLY to clean/format skills
            var prompt = $"""
    Extract a clean list of technical skills from the text below.
    Do NOT infer new skills.
    Do NOT add explanations.
    Return ONLY a JSON array of strings.

    Text:
    {skillsText}
    """;

            var client = _httpClientFactory.CreateClient();
            var apiKey = _configuration["GeminiAI:ApiKey"];

            var requestBody = new
            {
                contents = new[]
                {
            new
            {
                parts = new[] { new { text = prompt } }
            }
        }
            };

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={apiKey}"
            );

            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await client.SendAsync(request);
            var responseJson = await response.Content.ReadAsStringAsync();

            // 🔹 4. Save analysis (no nulls)
            var analysis = new ResumeAnalysis
            {
                UserId = userId,
                ExtractedSkills = responseJson,   // store cleaned skills
                RecommendedRoles = "[]",
                ImprovementSuggestions = "Skill-based analysis"
            };

            _context.ResumeAnalyses.Add(analysis);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Skills extracted successfully",
                skillsSourceText = skillsText,
                geminiResponse = responseJson
            });
        }

        private string ExtractSkillsSection(string text)
        {
            var lowerText = text.ToLower();

            string[] headers =
            {
        "skills",
        "technical skills",
        "key skills",
        "skill set",
        "technologies"
    };

            foreach (var header in headers)
            {
                int index = lowerText.IndexOf(header);
                if (index != -1)
                {
                    return text.Substring(index, Math.Min(800, text.Length - index));
                }
            }

            return string.Empty;
        }


    }
}
