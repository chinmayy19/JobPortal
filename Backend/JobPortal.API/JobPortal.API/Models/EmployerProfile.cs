using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models
{
    public class EmployerProfile
    {
        [Key, ForeignKey("User")]
        public int UserId { get; set; }

        public string CompanyName { get; set; }
        public string CompanyDescription { get; set; }
        public string CompanyWebsite { get; set; }
        public string CompanyLogo { get; set; }

        public User User { get; set; }
    }
}