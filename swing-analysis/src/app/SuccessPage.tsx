import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [planType, setPlanType] = useState(searchParams.get('plan') || 'performance');
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // Verify the Stripe session and activate account
    const verifySession = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/stripe/verify-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          }
        );
        
        const data = await response.json();
        
        if (data.success) {
          // Update plan type if returned from verification
          if (data.planId) {
            setPlanType(data.planId);
          }
        } else {
          setVerificationError(data.error || 'Failed to verify payment');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationError('Failed to verify payment. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };
    
    verifySession();
  }, [sessionId]);
  
  const planNames: Record<string, string> = {
    starter: 'Starter',
    performance: 'Performance',
    sixmonth: '6-Month Performance'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {verifying ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
              <p className="text-gray-600">Verifying your payment...</p>
            </div>
          ) : verificationError ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
              <p className="text-gray-600 mb-4">{verificationError}</p>
              <p className="text-sm text-gray-500">Please contact support at admin@batdigest.com</p>
            </div>
          ) : (
          <>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Welcome to $500 Swing!
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            Your {planNames[planType]} subscription is now active.
          </p>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What's Next?
            </h2>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Download the iOS App</p>
                  <p className="text-sm text-gray-600">Search for "$500 Swing" in the App Store</p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Log In with Your Credentials</p>
                  <p className="text-sm text-gray-600">Use the email and password you just created</p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">Upload Your First Swing</p>
                  <p className="text-sm text-gray-600">Record from any angle - our coaches will analyze it within 24-48 hours</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Important Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">Check Your Email</p>
                <p className="text-sm text-blue-800">
                  We've sent you a welcome email with your login details and quick start guide.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/account"
              className="flex-1 bg-cyan-500 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
            >
              Go to Your Account
            </Link>
            
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-900 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Download iOS App
            </a>
          </div>

          {/* Support */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Need help? Visit our{' '}
            <Link to="/support" className="text-cyan-600 hover:underline">
              Support
            </Link>
            {' '}page.
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
