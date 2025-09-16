import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public pages
import { LandingPage } from './app/LandingPage';
import { LoginPage } from './app/LoginPage';
import { CheckoutPage } from './app/CheckoutPage';
import { StripeCheckoutPage } from './app/StripeCheckoutPage';
import { SuccessPage } from './app/SuccessPage';
import { ForgotPasswordPage } from './app/ForgotPasswordPage';
import { ResetPasswordPage } from './app/ResetPasswordPage';
import { PrivacyPage } from './app/PrivacyPage';

// Coach pages
import { CoachSignupPage } from './app/CoachSignupPage';
import { CoachSignupSuccess } from './app/CoachSignupSuccess';
import { CoachLoginPage } from './app/CoachLoginPage';
import { CoachQueuePage } from './app/CoachQueuePage';
import { CoachProfilePage } from './app/CoachProfilePage';
import { CoachGetStartedPage } from './app/CoachGetStartedPage';
import { CoachHowItWorksPage } from './app/CoachHowItWorksPage';

// Protected pages
import { AccountPage } from './app/AccountPage';

// Admin pages
import NeedAnalysisPage from './app/NeedAnalysisPage';
import LoadVideoPage from './app/LoadVideoPage';
import AdminDashboard from './app/AdminDashboard';
import TestCapturePage from './app/TestCapturePage';
import TestExtensionPage from './app/TestExtensionPage';
import TestAudioPage from './app/TestAudioPage';
import SupportPage from './app/SupportPage';

// Auth components
import { AdminAuth } from './components/AdminAuth';
import { LimitedSignupBanner } from './components/LimitedSignupBanner';

function App() {
  return (
    <Router>
      <LimitedSignupBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout-old" element={<CheckoutPage />} />
        <Route path="/checkout" element={<StripeCheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/support" element={<SupportPage />} />
        
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
        <Route path="/admin/test-capture" element={
          <AdminAuth>
            <TestCapturePage />
          </AdminAuth>
        } />
        <Route path="/admin/test-extension" element={
          <AdminAuth>
            <TestExtensionPage />
          </AdminAuth>
        } />
        <Route path="/admin/test-audio" element={
          <AdminAuth>
            <TestAudioPage />
          </AdminAuth>
        } />
        
        {/* Coach Routes */}
        <Route path="/coach" element={<CoachLoginPage />} />
        <Route path="/coach/signup" element={<CoachSignupPage />} />
        <Route path="/coach/signup-success" element={<CoachSignupSuccess />} />
        <Route path="/coach/login" element={<CoachLoginPage />} />
        <Route path="/coach/queue" element={<CoachQueuePage />} />
        <Route path="/coach/profile" element={<CoachProfilePage />} />
        <Route path="/coach/get-started" element={<CoachGetStartedPage />} />
        <Route path="/coach/how-it-works" element={<CoachHowItWorksPage />} />
        <Route path="/coach/analyzer" element={<LoadVideoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
