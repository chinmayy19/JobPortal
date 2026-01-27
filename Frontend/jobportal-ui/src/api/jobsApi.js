import axios from "./axios";

// ============================================
// EMPLOYER APIs
// ============================================

// Get all jobs posted by the employer (uses /jobs/my-jobs endpoint)
// CHANGE: Updated to use correct endpoint for employer's own jobs
export const getMyJobs = async () => {
  const response = await axios.get("/jobs/my-jobs");
  return response.data;
};

// Create a new job
export const createJob = async (jobData) => {
  const response = await axios.post("/jobs", jobData);
  return response.data;
};

// Update an existing job
export const updateJob = async (id, jobData) => {
  const response = await axios.put(`/jobs/${id}`, jobData);
  return response.data;
};

// Delete a job
export const deleteJob = async (id) => {
  const response = await axios.delete(`/jobs/${id}`);
  return response.data;
};

// Get applicants for a specific job (employer only)
// CHANGE: New function to get all applicants who applied for a job
export const getApplicantsForJob = async (jobId) => {
  const response = await axios.get(`/applications/job/${jobId}`);
  return response.data;
};

// Update application status (employer only)
// CHANGE: New function to update application status (Accept/Reject/Pending etc.)
// Valid statuses: Applied, Pending, Reviewed, Shortlisted, Accepted, Rejected
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axios.put(`/applications/${applicationId}/status`, { status });
  return response.data;
};

// ============================================
// PUBLIC/JOBSEEKER APIs
// ============================================

// Get all public jobs (no auth required)
// CHANGE: This fetches all jobs listed on platform for jobseekers to browse
export const getAllJobs = async () => {
  const response = await axios.get("/jobs");
  return response.data;
};

// ============================================
// JOB APPLICATION APIs (for jobseekers)
// ============================================

// Apply for a job (jobseeker only)
// CHANGE: Updated to accept applicant details (phone, location, skills, coverNote)
export const applyForJob = async (applicationData) => {
  // applicationData should contain: { jobId, phone, locationPreference, skills, coverNote }
  const response = await axios.post("/applications/apply", applicationData);
  return response.data;
};

// Get all jobs the current jobseeker has applied for
// CHANGE: New function to get applied jobs using GET /api/applications/my
export const getMyAppliedJobs = async () => {
  const response = await axios.get("/applications/my");
  return response.data;
};

// Withdraw/Revoke a job application (jobseeker only)
// CHANGE: New function to withdraw an application (helps fix misclicks)
export const withdrawApplication = async (applicationId) => {
  const response = await axios.delete(`/applications/${applicationId}/withdraw`);
  return response.data;
};

// ============================================
// EXTERNAL JOB APIs (aggregated from multiple platforms)
// ============================================

// Search external jobs from multiple platforms (Remotive, Arbeitnow, etc.)
// CHANGE: New function to fetch jobs from external platforms
// These jobs redirect to external sites for application
export const searchExternalJobs = async (keyword = "", location = "", source = "") => {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (location) params.append("location", location);
  if (source) params.append("source", source);
  
  const response = await axios.get(`/external-jobs/search?${params.toString()}`);
  return response.data;
};

// Get available external job sources
export const getExternalJobSources = async () => {
  const response = await axios.get("/external-jobs/sources");
  return response.data;
};
