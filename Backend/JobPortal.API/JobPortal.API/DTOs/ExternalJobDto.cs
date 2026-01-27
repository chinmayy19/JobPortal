namespace JobPortal.API.DTOs
{
    /// <summary>
    /// DTO for external job listings from various platforms
    /// CHANGE: Enhanced with more fields for better job display
    /// </summary>
    public class ExternalJobDto
    {
        // Source platform information
        public string Source { get; set; }         // e.g., "Remotive", "RemoteOK", "Arbeitnow"
        public string? SourceLogo { get; set; }    // Logo URL of the source platform
        
        // Job details
        public string Title { get; set; }
        public string Company { get; set; }
        public string? CompanyLogo { get; set; }   // Company logo URL
        public string Location { get; set; }
        public string Description { get; set; }
        
        // Job metadata
        public string? JobType { get; set; }       // Full-time, Part-time, Contract, etc.
        public string? SalaryRange { get; set; }   // Salary information if available
        public string? Category { get; set; }      // Job category (Software, Marketing, etc.)
        public string[]? Tags { get; set; }        // Skills/tags associated with the job
        
        // Dates
        public DateTime? PostedAt { get; set; }    // When the job was posted
        
        // Application
        public string ApplyUrl { get; set; }       // Direct link to apply on external site
    }
}
