/**
 * JobSeeker Dashboard Component
 * =============================
 * This dashboard allows jobseekers to:
 * 1. View all jobs listed on the platform
 * 2. Apply for jobs with application form (phone, location, skills)
 * 3. View their applied jobs with status tracking
 * 4. Search and filter jobs
 * 5. Withdraw/Revoke applications (fix misclicks)
 * 
 * BACKEND ENDPOINTS USED:
 * - GET /api/jobs - Fetches all available jobs (public endpoint)
 * - POST /api/applications/apply - Apply for a job with details (requires jobseeker auth)
 * - GET /api/applications/my - Get jobseeker's applied jobs (requires auth)
 * - DELETE /api/applications/{id}/withdraw - Withdraw an application (requires auth)
 */

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
// CHANGE: Added withdrawApplication for revoking job applications
import { getAllJobs, applyForJob, getMyAppliedJobs, withdrawApplication } from "../../api/jobsApi";

const JobSeekerDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // CHANGE: State for all available jobs from the platform
  const [jobs, setJobs] = useState([]);
  // CHANGE: State for jobs the user has already applied to
  const [appliedJobs, setAppliedJobs] = useState([]);
  // CHANGE: Set of job IDs user has applied to (for quick lookup)
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  // CHANGE: Track which job is currently being applied to
  const [applyingJobId, setApplyingJobId] = useState(null);
  // CHANGE: Track which application is being withdrawn
  const [withdrawingId, setWithdrawingId] = useState(null);
  // Messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // CHANGE: Search/filter functionality
  const [searchTerm, setSearchTerm] = useState("");
  // CHANGE: Toggle between viewing all jobs and applied jobs
  const [activeTab, setActiveTab] = useState("browse"); // "browse" or "applied"

  // CHANGE: Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  
  // CHANGE: Application Form Data
  const [applicationForm, setApplicationForm] = useState({
    phone: "",
    locationPreference: "",
    skills: "",
    coverNote: ""
  });

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    // CHANGE: Fetch both all jobs and applied jobs on component mount
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // CHANGE: Parallel fetch for better performance
      const [allJobsData, appliedJobsData] = await Promise.all([
        getAllJobs(),
        getMyAppliedJobs()
      ]);
      
      setJobs(allJobsData);
      setAppliedJobs(appliedJobsData);
      
      // CHANGE: Create a Set of applied job IDs for O(1) lookup
      const appliedIds = new Set(appliedJobsData.map(app => app.jobId));
      setAppliedJobIds(appliedIds);
    } catch (err) {
      setError("Failed to fetch jobs. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // JOB APPLICATION HANDLER
  // ============================================

  // CHANGE: Open application modal instead of direct apply
  const openApplyModal = (job) => {
    setSelectedJobForApply(job);
    setApplicationForm({
      phone: "",
      locationPreference: "",
      skills: "",
      coverNote: ""
    });
    setIsApplyModalOpen(true);
  };

  // CHANGE: Close application modal
  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedJobForApply(null);
    setApplicationForm({
      phone: "",
      locationPreference: "",
      skills: "",
      coverNote: ""
    });
  };

  // CHANGE: Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
  };

  // CHANGE: Submit application with details
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!selectedJobForApply) return;
    
    // Validate required fields
    if (!applicationForm.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    
    setIsSubmittingApplication(true);
    setError("");
    
    try {
      // CHANGE: Call the apply API endpoint with all details
      await applyForJob({
        jobId: selectedJobForApply.id,
        phone: applicationForm.phone,
        locationPreference: applicationForm.locationPreference,
        skills: applicationForm.skills,
        coverNote: applicationForm.coverNote
      });
      
      setSuccessMessage("Successfully applied for the job!");
      
      // CHANGE: Update local state to reflect the application
      setAppliedJobIds(prev => new Set([...prev, selectedJobForApply.id]));
      
      // CHANGE: Refresh applied jobs list
      const updatedAppliedJobs = await getMyAppliedJobs();
      setAppliedJobs(updatedAppliedJobs);
      
      // Close modal
      closeApplyModal();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      // CHANGE: Handle specific error messages from backend
      const errorMessage = err.response?.data || "Failed to apply. Please try again.";
      setError(typeof errorMessage === 'string' ? errorMessage : "Failed to apply. Please try again.");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // ============================================
  // WITHDRAW APPLICATION HANDLER
  // ============================================

  // CHANGE: New function to handle withdrawing/revoking job application
  const handleWithdraw = async (applicationId, jobId) => {
    // Confirm before withdrawing
    if (!window.confirm("Are you sure you want to withdraw this application?")) {
      return;
    }
    
    setWithdrawingId(applicationId);
    setError("");
    
    try {
      await withdrawApplication(applicationId);
      
      setSuccessMessage("Application withdrawn successfully!");
      
      // Update local state to reflect the withdrawal
      setAppliedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      
      // Remove from applied jobs list
      setAppliedJobs(prev => prev.filter(app => app.applicationId !== applicationId));
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to withdraw application. Please try again.";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    } finally {
      setWithdrawingId(null);
    }
  };

  // CHANGE: Check if application can be withdrawn (not accepted/rejected)
  const canWithdraw = (status) => {
    const nonWithdrawableStatuses = ['accepted', 'rejected'];
    return !nonWithdrawableStatuses.includes(status?.toLowerCase());
  };

  // ============================================
  // FILTERING/SEARCH
  // ============================================

  // CHANGE: Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.workLocation?.toLowerCase().includes(searchLower) ||
      job.requirements?.toLowerCase().includes(searchLower)
    );
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // CHANGE: Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // CHANGE: Get status badge color based on application status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CHANGE: Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">JobPortal</h1>
              <span className="ml-3 text-sm text-gray-500">Job Seeker</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Welcome, <span className="font-medium">{auth?.user?.fullName || "User"}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CHANGE: Success/Error Messages */}
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
          </div>
        )}

        {/* CHANGE: Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("browse")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "browse"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Browse Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab("applied")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "applied"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Applications ({appliedJobs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* CHANGE: Search Bar (only for browse tab) */}
        {activeTab === "browse" && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs by title, location, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* CHANGE: Browse Jobs Tab */}
            {activeTab === "browse" && (
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-gray-500">
                      {searchTerm ? "Try adjusting your search terms." : "Check back later for new opportunities."}
                    </p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                            {job.workLocation && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.workLocation}
                              </span>
                            )}
                            {job.salaryRange && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.salaryRange}
                              </span>
                            )}
                            {job.postedAt && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Posted {formatDate(job.postedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* CHANGE: Apply Button - Opens modal for application form */}
                        <div className="ml-4">
                          {appliedJobIds.has(job.id) ? (
                            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => openApplyModal(job)}
                              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Job Description */}
                      <div className="mt-4">
                        <p className="text-gray-600 line-clamp-3">{job.description}</p>
                      </div>
                      
                      {/* Requirements */}
                      {job.requirements && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Requirements:</h4>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{job.requirements}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CHANGE: Applied Jobs Tab */}
            {activeTab === "applied" && (
              <div className="space-y-4">
                {appliedJobs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1 text-gray-500">Start applying to jobs to track your applications here.</p>
                    <button
                      onClick={() => setActiveTab("browse")}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Browse Jobs
                    </button>
                  </div>
                ) : (
                  appliedJobs.map((application) => (
                    <div
                      key={application.applicationId}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{application.jobTitle}</h3>
                          <p className="mt-1 text-gray-600">{application.companyOrEmployer}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                            {application.workLocation && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {application.workLocation}
                              </span>
                            )}
                            {application.salaryRange && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {application.salaryRange}
                              </span>
                            )}
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Applied {formatDate(application.appliedAt)}
                            </span>
                          </div>
                        </div>
                        {/* CHANGE: Application Status Badge and Withdraw Button */}
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                            {application.status || "Applied"}
                          </span>
                          {/* CHANGE: Withdraw button - only show if application can be withdrawn */}
                          {canWithdraw(application.status) && (
                            <button
                              onClick={() => handleWithdraw(application.applicationId, application.jobId)}
                              disabled={withdrawingId === application.applicationId}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {withdrawingId === application.applicationId ? (
                                <>
                                  <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Withdrawing...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Withdraw
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* CHANGE: Application Form Modal */}
      {isApplyModalOpen && selectedJobForApply && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={closeApplyModal}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Apply for Job
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedJobForApply.title}
                  </p>
                </div>
                <button
                  onClick={closeApplyModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Application Form */}
              <form onSubmit={handleSubmitApplication}>
                <div className="p-6 space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Phone Number - Required */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={applicationForm.phone}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Recruiters will use this to contact you</p>
                  </div>

                  {/* Location Preference */}
                  <div>
                    <label htmlFor="locationPreference" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Work Location
                    </label>
                    <input
                      id="locationPreference"
                      name="locationPreference"
                      type="text"
                      placeholder="e.g. Pune, Mumbai, Remote"
                      value={applicationForm.locationPreference}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                      Relevant Skills
                    </label>
                    <input
                      id="skills"
                      name="skills"
                      type="text"
                      placeholder="e.g. JavaScript, React, Node.js, SQL"
                      value={applicationForm.skills}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate skills with commas</p>
                  </div>

                  {/* Cover Note */}
                  <div>
                    <label htmlFor="coverNote" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Note (Optional)
                    </label>
                    <textarea
                      id="coverNote"
                      name="coverNote"
                      rows={3}
                      placeholder="Tell the recruiter why you're a great fit for this role..."
                      value={applicationForm.coverNote}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={closeApplyModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApplication}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    {isSubmittingApplication ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerDashboard;
