/**
 * External Jobs Page
 * ==================
 * Displays jobs from external platforms (LinkedIn, Indeed, Glassdoor, Remotive, etc.)
 * Auth-aware: Shows different navigation for logged-in users
 */

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { searchExternalJobs } from "../api/jobsApi";

const ExternalJobs = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Auth state
  const isLoggedIn = !!auth?.token;
  const isJobSeeker = auth?.user?.role === "jobseeker";
  const isEmployer = auth?.user?.role === "employer";
  
  // Search State
  const [keyword, setKeyword] = useState("software developer");
  const [location, setLocation] = useState("India");
  const [source, setSource] = useState("");
  
  // Available sources
  const sources = [
    { value: "", label: "All Sources" },
    { value: "jsearch", label: "LinkedIn, Indeed, Glassdoor" },
    { value: "remotive", label: "Remotive (Remote Jobs)" },
    { value: "arbeitnow", label: "Arbeitnow (European Jobs)" },
  ];

  useEffect(() => {
    fetchExternalJobs();
  }, []);

  const fetchExternalJobs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await searchExternalJobs(keyword, location, source);
      setJobs(response.jobs || []);
    } catch (err) {
      console.error("Error fetching external jobs:", err);
      setError("Failed to fetch external jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExternalJobs();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getSourceColor = (sourceName) => {
    switch (sourceName?.toLowerCase()) {
      case "linkedin":
        return "bg-blue-100 text-blue-700";
      case "indeed":
        return "bg-indigo-100 text-indigo-700";
      case "glassdoor":
        return "bg-green-100 text-green-700";
      case "remotive":
        return "bg-purple-100 text-purple-700";
      case "arbeitnow":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
              <Link to="/jobs" className="text-gray-600 hover:text-gray-900">Browse Jobs</Link>
              <Link to="/external-jobs" className="text-gray-900 font-medium">External Jobs</Link>
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full">
              🌐 External Jobs
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Jobs from LinkedIn, Indeed, Glassdoor & More
          </h1>
          <p className="mt-2 text-gray-600">
            Browse jobs aggregated from multiple platforms. Apply directly on the source website.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title or keyword"
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
                placeholder="Location (e.g., India, Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              {sources.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Fetching jobs from multiple platforms...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-2 text-gray-600">Try different keywords or location</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{jobs.length}</span> jobs
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sources:</span>
                {[...new Set(jobs.map(j => j.source))].map((s) => (
                  <span key={s} className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(s)}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {jobs.map((job, index) => (
                <div
                  key={`${job.source}-${index}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {job.companyLogo ? (
                        <img 
                          src={job.companyLogo} 
                          alt={job.company}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 ${job.companyLogo ? 'hidden' : ''}`}>
                        {job.company?.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 ${getSourceColor(job.source)}`}>
                          {job.source}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location || "Remote"}
                        </span>
                        {job.jobType && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.jobType}
                          </span>
                        )}
                        {job.salaryRange && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salaryRange}
                          </span>
                        )}
                        {job.postedAt && (
                          <span className="text-gray-400">
                            {formatDate(job.postedAt)}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {job.tags && job.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.tags.slice(0, 5).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 5 && (
                            <span className="px-2.5 py-1 text-xs text-gray-400">
                              +{job.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {job.description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                    </div>

                    {/* Apply Button */}
                    <div className="lg:shrink-0">
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Apply
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExternalJobs;
