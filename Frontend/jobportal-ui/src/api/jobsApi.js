import axios from "./axios";

// Get all jobs posted by the employer
export const getMyJobs = async () => {
  const response = await axios.get("/jobs");
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

// Get all public jobs
export const getAllJobs = async () => {
  const response = await axios.get("/jobs");
  return response.data;
};
