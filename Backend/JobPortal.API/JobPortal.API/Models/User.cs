using System.ComponentModel.DataAnnotations;

namespace JobPortal.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; }   // jobseeker / employer / admin

        public string Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        //// Navigation
        //public JobSeekerProfile JobSeekerProfile { get; set; }
        //public EmployerProfile EmployerProfile { get; set; }
    }
}
