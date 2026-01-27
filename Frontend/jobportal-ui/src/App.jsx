import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmployerDashboard from './pages/employer/Dashboard'
// CHANGE: Import the new JobSeeker Dashboard component
import JobSeekerDashboard from './pages/jobseeker/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {


  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            {/* CHANGE: New route for JobSeeker Dashboard */}
            <Route
              path="/jobseeker/dashboard"
              element={
                <ProtectedRoute allowedRoles={["jobseeker"]}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
