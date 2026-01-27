namespace JobPortal.API.DTOs
{
    /// <summary>
    /// DTO for User Profile - combines User and JobSeekerProfile data
    /// Used for viewing and updating user profile information
    /// </summary>
    public class UserProfileDto
    {
        // Basic User Info
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }
        
        // JobSeeker Profile Info
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? Skills { get; set; }
        public string? LocationPreference { get; set; }
        public bool HasResume { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO for updating user profile
    /// </summary>
    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? Skills { get; set; }
        public string? LocationPreference { get; set; }
    }
}
