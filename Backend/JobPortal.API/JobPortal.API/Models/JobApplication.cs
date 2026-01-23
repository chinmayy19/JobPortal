using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models
{
    public class JobApplication
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        public int ApplicantId { get; set; }

        public string Status { get; set; } = "Applied";
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("JobId")]
        public Job Job { get; set; }

        [ForeignKey("ApplicantId")]
        public User Applicant { get; set; }
    }
}
