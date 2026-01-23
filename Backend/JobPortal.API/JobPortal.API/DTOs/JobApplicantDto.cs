namespace JobPortal.API.DTOs
{
    public class JobApplicantDto
    {
        public int ApplicationId { get; set; }
        public int ApplicantId { get; set; }
        public string ApplicantName { get; set; }
        public string ApplicantEmail { get; set; }
        public string Status { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
