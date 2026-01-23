using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models
{
    public class Job
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Employer")]
        public int EmployerId { get; set; }
        [Required]
        public string Title { get; set; }

        public string Description { get; set; }
        public string Requirements { get; set; }
        public string WorkLocation { get; set; }
        public string SalaryRange { get; set; }

        public DateTime PostedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("EmployerId")]
        public User Employer { get; set; }
    }
}
