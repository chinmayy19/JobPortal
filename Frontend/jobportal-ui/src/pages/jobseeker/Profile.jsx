/**
 * JobSeeker Profile Page
 * ======================
 * Comprehensive profile management for job seekers including:
 * 1. Personal details editing (name, phone, location)
 * 2. Resume upload (PDF/DOC/DOCX)
 * 3. AI-powered resume analysis (skill extraction)
 * 4. Education & Experience management
 * 5. Skills management with AI auto-fill
 * 6. Skill-based job recommendations
 * 7. Skill suggestions based on market trends
 * 
 * BACKEND ENDPOINTS USED:
 * - GET /api/profile - Get user profile
 * - PUT /api/profile - Update user profile
 * - POST /api/resume/upload - Upload resume file
 * - POST /api/ai/analyze-resume - AI skill extraction using Gemini
 * - GET /api/profile/recommendations - Get job recommendations
 * - GET /api/profile/skill-suggestions - Get skill suggestions
 */

import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  uploadResume, 
  analyzeResume, 
  getUserProfile, 
  updateUserProfile,
  getJobRecommendations,
  getSkillSuggestions
} from "../../api/resumeApi";
import { applyForJob } from "../../api/jobsApi";

const Profile = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState("profile"); // profile, resume, recommendations, suggestions

  // Profile State
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
    skills: "",
    locationPreference: "",
    hasResume: false
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileEdited, setProfileEdited] = useState(false);

  // Resume State
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [userSkillsFromAPI, setUserSkillsFromAPI] = useState([]);

  // Skill Suggestions State
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "recommendations") {
      fetchRecommendations();
    } else if (activeTab === "suggestions") {
      fetchSkillSuggestions();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const data = await getUserProfile();
      setProfile({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        education: data.education || "",
        experience: data.experience || "",
        skills: data.skills || "",
        locationPreference: data.locationPreference || "",
        hasResume: data.hasResume || false
      });
      if (data.hasResume) {
        setUploadSuccess(true);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Profile might not exist yet, that's okay
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const data = await getJobRecommendations();
      setRecommendations(data.recommendations || []);
      setUserSkillsFromAPI(data.userSkills || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch job recommendations");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const fetchSkillSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const data = await getSkillSuggestions();
      setSkillSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Error fetching skill suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // ============================================
  // PROFILE HANDLERS
  // ============================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setProfileEdited(true);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setError("");
    try {
      const response = await updateUserProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        education: profile.education,
        experience: profile.experience,
        skills: profile.skills,
        locationPreference: profile.locationPreference
      });
      setSuccessMessage("Profile saved successfully!");
      setProfileEdited(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ============================================
  // RESUME HANDLERS
  // ============================================

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [".pdf", ".doc", ".docx"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      setError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setResumeFile(file);
    setError("");
    setUploadSuccess(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      await uploadResume(resumeFile);
      setUploadSuccess(true);
      setProfile(prev => ({ ...prev, hasResume: true }));
      setSuccessMessage("Resume uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================
  // AI ANALYSIS HANDLERS
  // ============================================

  const handleAnalyze = async () => {
    if (!profile.hasResume && !uploadSuccess) {
      setError("Please upload your resume first");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setExtractedSkills([]);

    try {
      const response = await analyzeResume();

      // Parse extracted skills from Gemini response
      if (response.geminiResponse) {
        try {
          const jsonMatch = response.geminiResponse.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            const skills = JSON.parse(jsonMatch[0]);
            setExtractedSkills(skills);
          }
        } catch (parseErr) {
          console.error("Error parsing skills:", parseErr);
        }
      }

      setSuccessMessage("Resume analyzed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoFillSkills = () => {
    if (extractedSkills.length === 0) return;
    
    const existingSkills = profile.skills
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s);
    
    const newSkills = extractedSkills.filter(
      skill => !existingSkills.includes(skill.toLowerCase())
    );
    
    const combinedSkills = [...profile.skills.split(',').filter(s => s.trim()), ...newSkills]
      .join(', ');
    
    setProfile(prev => ({ ...prev, skills: combinedSkills }));
    setProfileEdited(true);
    setSuccessMessage("Skills auto-filled from resume analysis!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddSuggestedSkill = (skill) => {
    const existingSkills = profile.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
    
    if (!existingSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
      const newSkills = [...existingSkills, skill].join(', ');
      setProfile(prev => ({ ...prev, skills: newSkills }));
      setProfileEdited(true);
    }
  };

  // ============================================
  // UTILITY
  // ============================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMatchScoreColor = (score) => {
    if (score >= 3) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 2) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                JobPortal
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/jobseeker/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/jobseeker/profile" className="text-sm font-medium text-gray-900">
                  Profile
                </Link>
                <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Browse Jobs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{auth?.user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile, upload resume, and get personalized job recommendations
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: "profile", label: "Personal Details", icon: "👤" },
                { id: "resume", label: "Resume & AI", icon: "📄" },
                { id: "recommendations", label: "Job Matches", icon: "🎯" },
                { id: "suggestions", label: "Skill Insights", icon: "💡" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {isLoadingProfile ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* PROFILE TAB */}
            {/* ============================================ */}
            {activeTab === "profile" && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {profile.fullName?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <h2 className="mt-4 text-xl font-semibold text-gray-900">
                        {profile.fullName || "User"}
                      </h2>
                      <p className="text-gray-600">{profile.email}</p>
                      <span className="inline-flex items-center px-3 py-1 mt-3 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Job Seeker
                      </span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{profile.phone || "Add phone number"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{profile.locationPreference || "Add preferred location"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{profile.hasResume ? "Resume uploaded ✓" : "No resume uploaded"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {profile.skills ? profile.skills.split(',').filter(s => s.trim()).length : 0}
                          </p>
                          <p className="text-xs text-gray-500">Skills</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {recommendations.filter(r => r.matchScore > 0).length || "-"}
                          </p>
                          <p className="text-xs text-gray-500">Job Matches</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profile.fullName}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          placeholder="+91 9876543210"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Location
                        </label>
                        <input
                          type="text"
                          name="locationPreference"
                          value={profile.locationPreference}
                          onChange={handleProfileChange}
                          placeholder="e.g., Pune, Mumbai, Remote"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Education & Experience */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Education & Experience</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Education
                        </label>
                        <textarea
                          name="education"
                          value={profile.education}
                          onChange={handleProfileChange}
                          rows={3}
                          placeholder="e.g., B.Tech in Computer Science from XYZ University (2020-2024)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Experience
                        </label>
                        <textarea
                          name="experience"
                          value={profile.experience}
                          onChange={handleProfileChange}
                          rows={3}
                          placeholder="e.g., Software Developer at ABC Corp (2022-Present)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                      {extractedSkills.length > 0 && (
                        <button
                          onClick={handleAutoFillSkills}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Auto-fill from Resume
                        </button>
                      )}
                    </div>
                    <textarea
                      name="skills"
                      value={profile.skills}
                      onChange={handleProfileChange}
                      rows={3}
                      placeholder="e.g., JavaScript, React, Node.js, Python, SQL, MongoDB"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                    <p className="mt-2 text-xs text-gray-500">Separate skills with commas. These are used to match you with relevant jobs.</p>
                    
                    {/* Skill Tags Preview */}
                    {profile.skills && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.skills.split(',').filter(s => s.trim()).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={!profileEdited || isSavingProfile}
                      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                        profileEdited
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isSavingProfile ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* RESUME TAB */}
            {/* ============================================ */}
            {activeTab === "resume" && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Resume Upload */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
                      <p className="text-sm text-gray-600">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      resumeFile || profile.hasResume
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 bg-gray-50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {resumeFile ? (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : profile.hasResume ? (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-gray-900">Resume already uploaded</p>
                        <p className="text-sm text-gray-500 mt-1">Click to upload a new one</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-medium text-gray-900">Drop your resume here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  {resumeFile && !uploadSuccess && (
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="mt-4 w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload Resume"}
                    </button>
                  )}
                </div>

                {/* AI Analysis */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Resume Analysis</h3>
                      <p className="text-sm text-gray-600">Powered by Google Gemini</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">How it works:</span> Our AI analyzes your resume to extract skills, which are then used to match you with relevant jobs.
                    </p>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={(!profile.hasResume && !uploadSuccess) || isAnalyzing}
                    className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
                      profile.hasResume || uploadSuccess
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } disabled:opacity-50`}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing with AI...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze Resume
                      </span>
                    )}
                  </button>

                  {/* Extracted Skills */}
                  {extractedSkills.length > 0 && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Extracted Skills ({extractedSkills.length})
                        </h4>
                        <button
                          onClick={handleAutoFillSkills}
                          className="text-sm text-purple-700 hover:text-purple-900 font-medium"
                        >
                          Add to Profile →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {extractedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 text-sm font-medium bg-white text-purple-700 border border-purple-200 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* RECOMMENDATIONS TAB */}
            {/* ============================================ */}
            {activeTab === "recommendations" && (
              <div>
                {/* Header Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Job Recommendations</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Jobs matched based on your skills: {userSkillsFromAPI.length > 0 ? userSkillsFromAPI.join(', ') : 'Add skills to get personalized recommendations'}
                      </p>
                    </div>
                    <button
                      onClick={fetchRecommendations}
                      disabled={isLoadingRecommendations}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {isLoadingRecommendations ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No recommendations yet</h3>
                    <p className="mt-2 text-gray-600">Add skills to your profile to get job matches</p>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      Add Skills
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              {job.matchScore > 0 && (
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getMatchScoreColor(job.matchScore)}`}>
                                  {job.matchScore} skill{job.matchScore > 1 ? 's' : ''} match
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {job.workLocation}
                              </span>
                              <span className="text-emerald-600 font-medium">{job.salaryRange}</span>
                              <span>{formatDate(job.postedAt)}</span>
                            </div>
                            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{job.description}</p>
                            
                            {/* Matched Skills */}
                            {job.matchedSkills && job.matchedSkills.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500">Matching:</span>
                                {job.matchedSkills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <Link
                            to="/jobseeker/dashboard"
                            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shrink-0"
                          >
                            View & Apply
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================ */}
            {/* SKILL SUGGESTIONS TAB */}
            {/* ============================================ */}
            {activeTab === "suggestions" && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Your Current Skills */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>
                  {profile.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.split(',').filter(s => s.trim()).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added yet. Add skills to get suggestions.</p>
                  )}
                </div>

                {/* Trending Skills */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Trending Skills</h3>
                    <button
                      onClick={fetchSkillSuggestions}
                      disabled={isLoadingSuggestions}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Refresh
                    </button>
                  </div>
                  
                  {isLoadingSuggestions ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : skillSuggestions.length === 0 ? (
                    <p className="text-gray-500">No suggestions available. Add more jobs to the platform to see trends.</p>
                  ) : (
                    <div className="space-y-3">
                      {skillSuggestions.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{item.skill}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.demandLevel === 'High' ? 'bg-green-100 text-green-700' :
                              item.demandLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {item.demandLevel} Demand
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddSuggestedSkill(item.skill)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="lg:col-span-2 bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips to Improve Your Profile</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Upload your resume and use AI analysis to auto-fill skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Add trending skills to increase your job match rate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Keep your phone number updated for recruiters to contact you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Specify your preferred location to get more relevant job recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
