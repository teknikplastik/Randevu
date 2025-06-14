import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import AppointmentForm from './components/AppointmentForm'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AppointmentsPage from './pages/admin/AppointmentsPage'
import CalendarPage from './pages/admin/CalendarPage'
import DoctorsPage from './pages/admin/DoctorsPage'
import PatientsPage from './pages/admin/PatientsPage'
import SettingsPage from './pages/admin/SettingsPage'

// Mobile App Import
import MobileApp from './mobile/App'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/admin/login" replace />
}

const AppContent: React.FC = () => {
  // Check if it's mobile app request
  const isMobileApp = window.location.pathname.startsWith('/mobile') || 
                     window.location.search.includes('mobile=true') ||
                     /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobileApp) {
    return <MobileApp />
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <Layout>
            <AppointmentForm />
          </Layout>
        } />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute>
            <DoctorsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute>
            <PatientsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        {/* Mobile App Route */}
        <Route path="/mobile/*" element={<MobileApp />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App