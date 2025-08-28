import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public pages
import { LandingPage } from './app/LandingPage';
import { LoginPage } from './app/LoginPage';
import { CheckoutPage } from './app/CheckoutPage';
import { SuccessPage } from './app/SuccessPage';
import { ForgotPasswordPage } from './app/ForgotPasswordPage';
import { ResetPasswordPage } from './app/ResetPasswordPage';

// Protected pages
import { AccountPage } from './app/AccountPage';

// Admin pages
import NeedAnalysisPage from './app/NeedAnalysisPage';
import LoadVideoPage from './app/LoadVideoPage';
import AdminDashboard from './app/AdminDashboard';
import ResourceVideosManager from './app/ResourceVideosManager';

// Auth components
import { AdminAuth } from './components/AdminAuth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes (require login) */}
        <Route path="/account" element={<AccountPage />} />
        
        {/* Admin Routes (require admin password) */}
        <Route path="/admin" element={
          <AdminAuth>
            <AdminDashboard />
          </AdminAuth>
        } />
        <Route path="/admin/queue" element={
          <AdminAuth>
            <NeedAnalysisPage />
          </AdminAuth>
        } />
        <Route path="/admin/analyzer" element={
          <AdminAuth>
            <LoadVideoPage />
          </AdminAuth>
        } />
        <Route path="/admin/resource-videos" element={
          <AdminAuth>
            <ResourceVideosManager />
          </AdminAuth>
        } />
      </Routes>
    </Router>
  );
}

export default App;