using System.ComponentModel.DataAnnotations;

namespace JobPortal.API.Models
{
    public class ResumeAnalysis
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public string ExtractedSkills { get; set; }
        public string RecommendedRoles { get; set; }
        public string ImprovementSuggestions { get; set; }

        public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
    }
}
