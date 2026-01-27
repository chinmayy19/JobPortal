/**
 * Reusable Navbar Component
 * =========================
 * Navigation bar that adapts based on authentication status and user role
 */

import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!auth?.token;
  const userRole = auth?.user?.role || 
    auth?.user?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">JobPortal</span>
            {isAuthenticated && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-900 text-white rounded-full capitalize">
                {userRole}
              </span>
            )}
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              // Public Navigation
              <>
                <Link
                  to="/jobs"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/jobs") ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/external-jobs"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/external-jobs") ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  External Jobs
                </Link>
              </>
            ) : userRole.toLowerCase() === "employer" ? (
              // Employer Navigation
              <>
                <Link
                  to="/employer/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/employer/dashboard") ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  My Jobs
                </Link>
              </>
            ) : (
              // JobSeeker Navigation
              <>
                <Link
                  to="/jobseeker/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/jobseeker/dashboard") ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/jobseeker/profile"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/jobseeker/profile") ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/jobs"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/jobs") ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Browse Jobs
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">
                  {auth?.user?.email || auth?.user?.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
