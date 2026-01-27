namespace JobPortal.API.DTOs
{
    /// <summary>
    /// DTO for updating job application status
    /// CHANGE: New DTO to receive status update requests from employer
    /// Valid statuses: Applied, Pending, Reviewed, Shortlisted, Accepted, Rejected
    /// </summary>
    public class UpdateStatusDto
    {
        public string Status { get; set; }
    }
}
