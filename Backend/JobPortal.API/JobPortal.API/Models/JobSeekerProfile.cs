using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models
{
    public class JobSeekerProfile
    {
        [Key, ForeignKey("User")]
        public int UserId { get; set; }

        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? ResumePath { get; set; } //Resume File Path

        public string? Skills { get; set; } // JSON stored as string
        
        // CHANGE: New field - Preferred work location for jobseeker
        public string? LocationPreference { get; set; }

        public User User { get; set; }
    }
}