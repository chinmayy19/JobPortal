namespace JobPortal.API.DTOs
{
    public class CreateJobDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string WorkLocation { get; set; }
        public string SalaryRange { get; set; }
    }
}
