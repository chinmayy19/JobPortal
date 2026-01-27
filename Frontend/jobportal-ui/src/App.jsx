import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Public Pages
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import ExternalJobs from './pages/ExternalJobs'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard'

// JobSeeker Pages
import JobSeekerDashboard from './pages/jobseeker/Dashboard'
import JobSeekerProfile from './pages/jobseeker/Profile'

// Components
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ============================================ */}
          {/* PUBLIC ROUTES - No authentication required */}
          {/* ============================================ */}
          
          {/* Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Public Job Browsing */}
          <Route path="/jobs" element={<Jobs />} />
          
          {/* External Jobs (LinkedIn, Indeed, etc.) */}
          <Route path="/external-jobs" element={<ExternalJobs />} />
          
          {/* ============================================ */}
          {/* AUTH ROUTES */}
          {/* ============================================ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ============================================ */}
          {/* EMPLOYER ROUTES - Requires employer role */}
          {/* ============================================ */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* JOBSEEKER ROUTES - Requires jobseeker role */}
          {/* ============================================ */}
          <Route
            path="/jobseeker/dashboard"
            element={
              <ProtectedRoute allowedRoles={["jobseeker"]}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/profile"
            element={
              <ProtectedRoute allowedRoles={["jobseeker"]}>
                <JobSeekerProfile />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* FALLBACK - Redirect unknown routes to home */}
          {/* ============================================ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
