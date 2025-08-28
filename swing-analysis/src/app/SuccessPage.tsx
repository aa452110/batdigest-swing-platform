import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('plan') || 'performance';
  
  const planNames: Record<string, string> = {
    starter: 'Starter',
    performance: 'Performance',
    sixmonth: '6-Month Performance'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
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
            Need help? Email us at{' '}
            <a href="mailto:support@batdigest.com" className="text-cyan-600 hover:underline">
              support@batdigest.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}