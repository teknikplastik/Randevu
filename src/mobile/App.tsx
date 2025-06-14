import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/MobileAuthContext'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import AppointmentsScreen from './screens/AppointmentsScreen'
import CalendarScreen from './screens/CalendarScreen'
import AddAppointmentScreen from './screens/AddAppointmentScreen'
import ContactPickerScreen from './screens/ContactPickerScreen'
import BottomNavigation from './components/BottomNavigation'
import LoadingScreen from './components/LoadingScreen'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingScreen />
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNavigation />
    </div>
  )
}

const AppContent: React.FC = () => {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MobileLayout>
              <DashboardScreen />
            </MobileLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute>
            <MobileLayout>
              <AppointmentsScreen />
            </MobileLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <MobileLayout>
              <CalendarScreen />
            </MobileLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/add-appointment" element={
          <ProtectedRoute>
            <MobileLayout>
              <AddAppointmentScreen />
            </MobileLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/contact-picker" element={
          <ProtectedRoute>
            <MobileLayout>
              <ContactPickerScreen />
            </MobileLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function MobileApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default MobileApp