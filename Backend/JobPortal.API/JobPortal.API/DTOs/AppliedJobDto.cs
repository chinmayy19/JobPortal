namespace JobPortal.API.DTOs
{
    public class AppliedJobDto
    {
        public int ApplicationId { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string CompanyOrEmployer { get; set; }
        public string WorkLocation { get; set; }
        public string SalaryRange { get; set; }
        public string Status { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
