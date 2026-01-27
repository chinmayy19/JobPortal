namespace JobPortal.API.DTOs
{
    // CHANGE: Extended DTO to collect applicant details when applying for a job
    public class ApplyJobDto
    {
        public int JobId { get; set; }
        
        // CHANGE: New fields to collect applicant information
        public string? Phone { get; set; }              // Contact phone number
        public string? LocationPreference { get; set; } // Preferred work location
        public string? Skills { get; set; }             // Relevant skills (comma-separated)
        public string? CoverNote { get; set; }          // Optional cover note/message
    }
}
