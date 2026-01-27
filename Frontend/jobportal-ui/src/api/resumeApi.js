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

// ============================================
// USER PROFILE APIs
// ============================================

/**
 * Get the current user's complete profile
 * Endpoint: GET /api/profile
 * Auth: Jobseeker only
 * 
 * @returns {Promise} - User profile data
 */
export const getUserProfile = async () => {
  const response = await axios.get("/profile");
  return response.data;
};

/**
 * Update user profile information
 * Endpoint: PUT /api/profile
 * Auth: Jobseeker only
 * 
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise} - Updated profile data
 */
export const updateUserProfile = async (profileData) => {
  const response = await axios.put("/profile", profileData);
  return response.data;
};

/**
 * Get job recommendations based on user's skills
 * Endpoint: GET /api/profile/recommendations
 * Auth: Jobseeker only
 * 
 * @returns {Promise} - List of recommended jobs with match scores
 */
export const getJobRecommendations = async () => {
  const response = await axios.get("/profile/recommendations");
  return response.data;
};

/**
 * Get skill suggestions based on job market trends
 * Endpoint: GET /api/profile/skill-suggestions
 * Auth: Jobseeker only
 * 
 * @returns {Promise} - List of suggested skills to learn
 */
export const getSkillSuggestions = async () => {
  const response = await axios.get("/profile/skill-suggestions");
  return response.data;
};

