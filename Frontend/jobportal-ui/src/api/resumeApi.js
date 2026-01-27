import axios from "./axios";

// ============================================
// RESUME & AI ANALYSIS APIs
// ============================================

/**
 * Upload resume file (PDF/DOC/DOCX)
 * Endpoint: POST /api/resume/upload
 * Auth: Jobseeker only
 * 
 * @param {File} file - The resume file to upload
 * @returns {Promise} - Response with message and resumePath
 */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await axios.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Analyze resume using AI (Gemini) to extract skills
 * Endpoint: POST /api/ai/analyze-resume
 * Auth: Jobseeker only
 * 
 * @returns {Promise} - Response with extracted skills and Gemini response
 */
export const analyzeResume = async () => {
  const response = await axios.post("/ai/analyze-resume");
  return response.data;
};
