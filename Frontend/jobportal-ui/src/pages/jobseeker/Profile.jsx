/**
 * JobSeeker Profile Page
 * ======================
 * Profile management for job seekers including:
 * 1. Resume upload (PDF/DOC/DOCX)
 * 2. AI-powered resume analysis (skill extraction)
 * 3. Profile information display
 * 
 * BACKEND ENDPOINTS USED:
 * - POST /api/resume/upload - Upload resume file
 * - POST /api/ai/analyze-resume - AI skill extraction using Gemini
 */

import { useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { uploadResume, analyzeResume } from "../../api/resumeApi";

const Profile = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Resume State
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);

  // Messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      setError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setResumeFile(file);
    setError("");
    setUploadSuccess(false);
  };

  // Handle file drop
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

  // Upload resume to server
  const handleUpload = async () => {
    if (!resumeFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await uploadResume(resumeFile);
      setUploadSuccess(true);
      setUploadedFileName(resumeFile.name);
      setSuccessMessage(response.message || "Resume uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data || "Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Analyze resume using AI
  const handleAnalyze = async () => {
    if (!uploadSuccess) {
      setError("Please upload your resume first");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await analyzeResume();
      setAnalysisResult(response);

      // Parse extracted skills from Gemini response
      if (response.geminiResponse) {
        try {
          // Extract JSON array from the response
          const jsonMatch = response.geminiResponse.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            const skills = JSON.parse(jsonMatch[0]);
            setExtractedSkills(skills);
          }
        } catch (parseErr) {
          console.error("Error parsing skills:", parseErr);
          // Try to extract skills from raw text
          setExtractedSkills([]);
        }
      }

      setSuccessMessage("Resume analyzed successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                JobPortal
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/jobseeker/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/jobseeker/profile" className="text-gray-900 font-medium">
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {auth?.user?.email}
              </span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your resume and let AI analyze your skills
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {auth?.user?.fullName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {auth?.user?.fullName || "User"}
              </h2>
              <p className="text-gray-600">{auth?.user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 mt-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Job Seeker
              </span>
            </div>
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
              <p className="text-sm text-gray-600">Upload your resume for applications</p>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              resumeFile
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
                <p className="text-sm text-gray-500 mt-1">
                  {(resumeFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setResumeFile(null);
                    setUploadSuccess(false);
                  }}
                  className="mt-3 text-sm text-red-600 hover:text-red-700"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-medium text-gray-900">Drop your resume here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX (Max 5MB)</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {resumeFile && !uploadSuccess && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-4 w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload Resume"
              )}
            </button>
          )}

          {/* Upload Success */}
          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Resume uploaded: {uploadedFileName}</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Resume Analysis</h3>
              <p className="text-sm text-gray-600">Let AI extract your skills automatically</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">How it works:</span> Our AI (powered by Google Gemini) will analyze your uploaded resume and extract your technical skills. This helps match you with relevant job opportunities.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!uploadSuccess || isAnalyzing}
            className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
              uploadSuccess
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

          {/* Analysis Results */}
          {extractedSkills.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Extracted Skills ({extractedSkills.length})
              </h4>
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
              <p className="mt-4 text-sm text-purple-700">
                These skills will be used to match you with relevant job opportunities!
              </p>
            </div>
          )}

          {/* Raw Analysis Result (Debug) */}
          {analysisResult?.skillsSourceText && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                View raw analysis data
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 font-mono overflow-auto max-h-40">
                <p><strong>Skills Section Found:</strong></p>
                <p className="whitespace-pre-wrap">{analysisResult.skillsSourceText}</p>
              </div>
            </details>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Link
            to="/jobseeker/dashboard"
            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
