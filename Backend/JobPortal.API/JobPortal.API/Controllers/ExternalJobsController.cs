using JobPortal.API.DTOs;
using JobPortal.API.Services;
using JobPortal.API.Services.ExternalJobs;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers
{
   
    /// Controller for fetching jobs from external job platforms
    /// Aggregates jobs from multiple sources: JSearch (LinkedIn, Indeed, Glassdoor), Remotive, Arbeitnow
    /// </summary>
    [ApiController]
    [Route("api/external-jobs")]
    public class ExternalJobsController : ControllerBase
    {
        private readonly RemotiveJobService _remotive;
        private readonly ArbeitnowJobService _arbeitnow;
        private readonly JSearchJobService _jsearch;

        public ExternalJobsController(
            RemotiveJobService remotive,
            ArbeitnowJobService arbeitnow,
            JSearchJobService jsearch)
        {
            _remotive = remotive;
            _arbeitnow = arbeitnow;
            _jsearch = jsearch;
        }

        /// <summary>
        /// Search jobs from all external sources
        /// JSearch aggregates from LinkedIn, Indeed, Glassdoor, Naukri etc.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchExternalJobs(
            [FromQuery] string? keyword,
            [FromQuery] string? location,
            [FromQuery] string? source) // Optional filter by source
        {
            var allJobs = new List<ExternalJobDto>();

            // Fetch from sources in parallel
            var tasks = new List<Task<List<ExternalJobDto>>>();

            // JSearch is the primary source (LinkedIn, Indeed, Glassdoor, etc.)
            if (string.IsNullOrEmpty(source) || source.ToLower() == "jsearch" || 
                source.ToLower() == "linkedin" || source.ToLower() == "indeed")
            {
                tasks.Add(_jsearch.FetchJobs(keyword ?? "", location ?? "India"));
            }

            if (string.IsNullOrEmpty(source) || source.ToLower() == "remotive")
            {
                tasks.Add(_remotive.FetchJobs(keyword ?? "", location ?? ""));
            }

            if (string.IsNullOrEmpty(source) || source.ToLower() == "arbeitnow")
            {
                tasks.Add(_arbeitnow.FetchJobs(keyword ?? "", location ?? ""));
            }

            var results = await Task.WhenAll(tasks);

            foreach (var jobList in results)
            {
                allJobs.AddRange(jobList);
            }

            // Sort by posted date (most recent first)
            allJobs = allJobs
                .OrderByDescending(j => j.PostedAt ?? DateTime.MinValue)
                .ToList();

            return Ok(new
            {
                totalCount = allJobs.Count,
                sources = allJobs.Select(j => j.Source).Distinct(),
                jobs = allJobs
            });
        }

        /// <summary>
        /// Search jobs specifically from JSearch (LinkedIn, Indeed, Glassdoor, Naukri)
        /// Best for Indian job market
        /// </summary>
        [HttpGet("jsearch")]
        public async Task<IActionResult> SearchJSearchJobs(
            [FromQuery] string? keyword,
            [FromQuery] string? location)
        {
            var jobs = await _jsearch.FetchJobs(
                keyword ?? "software developer", 
                location ?? "India"
            );

            return Ok(new
            {
                totalCount = jobs.Count,
                sources = jobs.Select(j => j.Source).Distinct(),
                jobs = jobs
            });
        }

        /// <summary>
        /// Get list of available external job sources
        /// </summary>
        [HttpGet("sources")]
        public IActionResult GetSources()
        {
            return Ok(new[]
            {
                new { 
                    name = "JSearch", 
                    description = "LinkedIn, Indeed, Glassdoor, Naukri & more (Indian Jobs)", 
                    logo = "https://cdn-icons-png.flaticon.com/512/174/174857.png",
                    isDefault = true
                },
                new { 
                    name = "Remotive", 
                    description = "Remote Jobs Worldwide", 
                    logo = "https://remotive.com/favicon.ico",
                    isDefault = false
                },
                new { 
                    name = "Arbeitnow", 
                    description = "European Job Listings", 
                    logo = "https://www.arbeitnow.com/favicon.ico",
                    isDefault = false
                }
            });
        }
    }
}
