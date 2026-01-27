/**
 * Home Page / Landing Page
 * ========================
 * Public landing page for the Job Portal with:
 * 1. Hero section with job search
 * 2. Featured jobs preview (limited for non-logged-in users)
 * 3. Stats section
 * 4. Call-to-action for registration
 * 
 * NON-LOGGED-IN USERS: See first 3 jobs clearly, rest are blurred
 * LOGGED-IN USERS: See all jobs and can navigate to dashboard
 */

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getAllJobs } from "../api/jobsApi";

const Home = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, candidates: 0 });

  // Auth state
  const isLoggedIn = !!auth?.token;
  const isJobSeeker = auth?.user?.role === "jobseeker";
  const isEmployer = auth?.user?.role === "employer";

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const jobs = await getAllJobs();
      setFeaturedJobs(jobs.slice(0, 6)); // Show first 6 jobs
      setStats({
        jobs: jobs.length,
        companies: new Set(jobs.map(j => j.employerId)).size,
        candidates: 500 // Placeholder
      });
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search params
    navigate(`/jobs?keyword=${searchKeyword}&location=${searchLocation}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Auth Aware */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                JobPortal
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {isLoggedIn && isJobSeeker && (
                <Link to="/jobseeker/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
              )}
              {isLoggedIn && isEmployer && (
                <Link to="/employer/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
                Browse Jobs
              </Link>
              <Link to="/external-jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
                External Jobs
              </Link>
              {isLoggedIn && isJobSeeker && (
                <Link to="/jobseeker/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profile
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">{auth?.user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find Your Dream Job
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                With Ease
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with top employers and discover opportunities that match your skills. 
              Your next career move starts here.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mt-10 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-2xl">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex-1 relative border-t sm:border-t-0 sm:border-l border-gray-200">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="City or Remote"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-12">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.jobs}+</p>
                <p className="text-gray-400 mt-1">Active Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.companies}+</p>
                <p className="text-gray-400 mt-1">Companies</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.candidates}+</p>
                <p className="text-gray-400 mt-1">Job Seekers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Job Openings</h2>
              <p className="mt-2 text-gray-600">
                {isLoggedIn 
                  ? "Explore all the newest opportunities on our platform" 
                  : "Sign in to unlock all job listings and apply"}
              </p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center text-gray-900 font-medium hover:underline"
            >
              View all jobs
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600">No jobs available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="relative">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredJobs.map((job, index) => {
                  // For non-logged-in users: first 3 jobs are visible, rest are blurred
                  const isBlurred = !isLoggedIn && index >= 3;
                  
                  return (
                    <div
                      key={job.id}
                      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group relative ${
                        isBlurred ? "select-none" : ""
                      }`}
                    >
                      {/* Blur overlay for non-logged-in users */}
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
                          <div className="text-center p-4">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-600">Sign in to view</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {isBlurred ? "••••••••••" : job.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {isBlurred ? "•••••" : job.workLocation}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                        {isBlurred ? "Sign in to see job description and requirements..." : job.description}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {isBlurred ? (
                          <>
                            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-400 rounded-full">•••••</span>
                            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-400 rounded-full">•••••</span>
                          </>
                        ) : (
                          job.requirements?.split(",").slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                            >
                              {skill.trim()}
                            </span>
                          ))
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-600">
                          {isBlurred ? "•••••" : job.salaryRange}
                        </span>
                        <span className="text-xs text-gray-400">
                          {isBlurred ? "•••" : formatDate(job.postedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Sign in CTA overlay for non-logged-in users */}
              {!isLoggedIn && featuredJobs.length > 3 && (
                <div className="mt-8 text-center p-8 bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl">
                  <h3 className="text-xl font-bold text-white">
                    Unlock {featuredJobs.length - 3}+ More Jobs
                  </h3>
                  <p className="mt-2 text-gray-300">
                    Sign in or create a free account to see all job listings and apply instantly
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/login"
                      className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-8 py-3 bg-transparent text-white font-semibold rounded-xl border border-gray-500 hover:border-gray-300 transition-colors"
                    >
                      Create Free Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-gray-600">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Profile",
                desc: "Sign up and build your professional profile with your skills and experience",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Upload Resume",
                desc: "Upload your resume and let our AI analyze your skills automatically",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Apply & Get Hired",
                desc: "Apply to jobs that match your profile and track your application status",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white text-sm font-bold rounded-full flex items-center justify-center">
                  {item.step}
                </span>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Take the Next Step?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Join thousands of job seekers and employers on our platform
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/jobs"
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border border-gray-600 hover:border-gray-400 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">JobPortal</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Your trusted platform for finding the perfect job or candidate.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/jobs" className="hover:text-gray-900">Browse Jobs</Link></li>
                <li><Link to="/external-jobs" className="hover:text-gray-900">External Jobs</Link></li>
                <li><Link to="/register" className="hover:text-gray-900">Create Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/register" className="hover:text-gray-900">Post a Job</Link></li>
                <li><Link to="/login" className="hover:text-gray-900">Employer Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2026 JobPortal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
