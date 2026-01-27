/**
 * Public Jobs Page
 * ================
 * Allows anyone to browse and search jobs without logging in.
 * Shows all jobs with search and filter functionality.
 * Auth-aware: Shows different navigation for logged-in users.
 */

import { useState, useEffect, useContext } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getAllJobs, applyForJob } from "../api/jobsApi";

const Jobs = () => {
  const { auth, logout } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Search & Filter State
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
      if (data.length > 0) {
        setSelectedJob(data[0]);
      }
    } catch (err) {
      setError("Failed to load jobs. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter jobs based on search criteria
  const filteredJobs = jobs.filter((job) => {
    const matchesKeyword = !keyword || 
      job.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      job.description?.toLowerCase().includes(keyword.toLowerCase()) ||
      job.requirements?.toLowerCase().includes(keyword.toLowerCase());
    
    const matchesLocation = !location ||
      job.workLocation?.toLowerCase().includes(location.toLowerCase());
    
    return matchesKeyword && matchesLocation;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleApplyClick = async (jobId) => {
    if (!auth?.token) {
      // Redirect to login with return URL
      navigate("/login", { state: { from: `/jobs` } });
      return;
    }
    
    // User is logged in - redirect to dashboard to apply
    if (auth?.user?.role === "jobseeker") {
      navigate("/jobseeker/dashboard");
    } else {
      navigate("/employer/dashboard");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Check if user is logged in
  const isLoggedIn = !!auth?.token;
  const isJobSeeker = auth?.user?.role === "jobseeker";
  const isEmployer = auth?.user?.role === "employer";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Auth Aware */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              JobPortal
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {isLoggedIn && isJobSeeker && (
                <Link to="/jobseeker/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              )}
              {isLoggedIn && isEmployer && (
                <Link to="/employer/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              )}
              <Link to="/jobs" className="text-gray-900 font-medium">Browse Jobs</Link>
              <Link to="/external-jobs" className="text-gray-600 hover:text-gray-900">External Jobs</Link>
              {isLoggedIn && isJobSeeker && (
                <Link to="/jobseeker/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">{auth?.user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
                  <Link to="/register" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keywords, or skills"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
          </p>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchJobs} className="mt-4 text-gray-900 underline">Try again</button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Job List */}
            <div className="w-full lg:w-2/5 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 bg-white rounded-xl border cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? "border-gray-900 ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.workLocation}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">{job.salaryRange}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  <p className="mt-3 text-xs text-gray-400">Posted {formatDate(job.postedAt)}</p>
                </div>
              ))}
            </div>

            {/* Job Details */}
            <div className="hidden lg:block lg:w-3/5">
              {selectedJob && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sticky top-24">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {selectedJob.workLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {selectedJob.salaryRange}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Posted {formatDate(selectedJob.postedAt)}
                        </span>
                      </div>
                    </div>
                    {isLoggedIn && isJobSeeker ? (
                      <button
                        onClick={() => handleApplyClick(selectedJob.id)}
                        className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Apply in Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(selectedJob.id)}
                        className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                  </div>

                  {selectedJob.requirements && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.split(",").map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show different message based on auth state */}
                  {!isLoggedIn ? (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Want to apply?</span> Sign in or create an account to submit your application.
                      </p>
                      <div className="mt-3 flex gap-3">
                        <Link
                          to="/login"
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  ) : isJobSeeker ? (
                    <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Ready to apply?</span> Go to your dashboard to apply with your full profile.
                      </p>
                      <div className="mt-3">
                        <Link
                          to="/jobseeker/dashboard"
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors inline-block"
                        >
                          Go to Dashboard
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">Employer Account</span> - You're viewing as an employer. Switch to a jobseeker account to apply.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
