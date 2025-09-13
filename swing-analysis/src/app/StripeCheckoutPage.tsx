import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from '../stores/authStore';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const PLAN_DETAILS: Record<string, { name: string; price: number; period: string }> = {
  starter: { name: 'Starter', price: 25, period: '/month' },
  performance: { name: 'Performance', price: 45, period: '/month' },
  sixmonth: { name: '6-Month Performance', price: 249, period: ' (one-time)' },
};

export function StripeCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const planId = searchParams.get('plan');
  const planDetails = planId ? PLAN_DETAILS[planId] : null;
  
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // If no plan selected, redirect to home
    if (!planId || !planDetails) {
      navigate('/');
    }
  }, [planId, planDetails, navigate]);
  
  const handleStripeCheckout = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      // Call our Worker to create Stripe checkout session
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/stripe/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            planId,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      // Redirect to Stripe's hosted checkout page
      window.location.href = data.checkoutUrl;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to start checkout');
      setProcessing(false);
    }
  };
  
  if (!planDetails) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Plan Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Plan</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{planDetails.name}</div>
                    <div className="text-sm text-gray-600">
                      {planId === 'starter' && '2 analyses per month'}
                      {planId === 'performance' && '4 analyses per month'}
                      {planId === 'sixmonth' && '24 analyses total (6 months)'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      ${planDetails.price}
                    </div>
                    <div className="text-sm text-gray-600">
                      {planDetails.period}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Setup */}
            <div className="mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Your Account</h3>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={processing}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={processing}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={processing}
                />
              </div>
              
              <p className="text-sm text-gray-500">
                Your account will be created after successful payment
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll be redirected to Stripe's secure checkout</li>
                <li>• Enter your payment information</li>
                <li>• Your account will be created automatically</li>
                <li>• Download the iOS app and start analyzing swings!</li>
              </ul>
            </div>
            
            {/* Cancellation Policy - Clear and Prominent */}
            {planId !== 'sixmonth' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-1">Cancel Anytime - No Questions Asked</h4>
                    <p className="text-sm text-green-800">
                      You can cancel your subscription at any time from your account page. 
                      When you cancel, you'll keep access until the end of your current billing period, 
                      then your subscription will end. No future charges, no hassle.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Trust Badges */}
            <div className="mb-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Checkout
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Powered by Stripe
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={processing}
              >
                Cancel
              </button>
              
              <button
                onClick={handleStripeCheckout}
                disabled={processing || !email}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Continue to Payment →`
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Questions? Email us at admin@batdigest.com</p>
        </div>
      </div>
    </div>
  );
}