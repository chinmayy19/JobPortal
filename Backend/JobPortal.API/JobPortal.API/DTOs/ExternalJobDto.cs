namespace JobPortal.API.DTOs
{
    public class ExternalJobDto
    {
        public string Source { get; set; }     // Jooble, Remotive
        public string Title { get; set; }
        public string Company { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public string ApplyUrl { get; set; }
    }
}
