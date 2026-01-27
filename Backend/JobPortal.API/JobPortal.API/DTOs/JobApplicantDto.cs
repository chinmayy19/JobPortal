namespace JobPortal.API.DTOs
{
    // CHANGE: Added Phone and LocationPreference fields to help recruiters make decisions
    public class JobApplicantDto
    {
        public int ApplicationId { get; set; }
        public int ApplicantId { get; set; }
        public string ApplicantName { get; set; }
        public string ApplicantEmail { get; set; }
        // CHANGE: New field - Phone number of the applicant
        public string? ApplicantPhone { get; set; }
        // CHANGE: New field - Preferred work location of the applicant
        public string? LocationPreference { get; set; }
        // CHANGE: New field - Skills of the applicant
        public string? Skills { get; set; }
        public string Status { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
