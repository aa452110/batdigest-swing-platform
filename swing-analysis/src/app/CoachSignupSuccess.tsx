import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export function CoachSignupSuccess() {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check Your Email!
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've sent a verification email to:
          <br />
          <span className="font-semibold text-gray-900">{email}</span>
        </p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Click the link in the email to verify your account. Once verified, you'll receive your unique coach code that players can use to link their submissions to you.
          </p>
        </div>
        
        <Link
          to="/coach/login"
          className="inline-block w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
        >
          Go to Login
        </Link>
        
        <p className="text-xs text-gray-500 mt-6">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
}