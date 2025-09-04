import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const PLAN_DETAILS: Record<string, { name: string; price: number; period: string }> = {
  starter: { name: 'Starter', price: 25, period: '/month' },
  performance: { name: 'Performance', price: 40, period: '/month' },
  sixmonth: { name: '6-Month Performance', price: 200, period: '/6 months' },
};

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuthStore();
  
  const planId = searchParams.get('plan');
  const planDetails = planId ? PLAN_DETAILS[planId] : null;
  const amount = planDetails?.price || parseFloat(searchParams.get('amount') || '0');
  const credit = parseFloat(searchParams.get('credit') || '0');
  const description = planDetails?.name || searchParams.get('description') || '';
  const type = searchParams.get('type');
  const isUpgrade = type === 'upgrade';
  
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState(isUpgrade && user ? user.email : '');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(isUpgrade && user ? user.firstName : '');
  const [lastName, setLastName] = useState(isUpgrade && user ? user.lastName : '');
  
  // Round the amount to 2 decimal places
  const finalAmount = Math.round(amount * 100) / 100;
  
  const handleCheckout = async () => {
    // For upgrades, we don't need email/password since user is logged in
    if (isUpgrade) {
      if (!firstName || !lastName) {
        alert('Please fill in your name for billing');
        return;
      }
    } else {
      if (!email || !password || !firstName || !lastName) {
        alert('Please fill in all fields');
        return;
      }
    }
    
    setProcessing(true);
    
    try {
      // Different endpoints for upgrade vs new signup
      const endpoint = isUpgrade 
        ? `${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/subscription/change`
        : `${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/checkout`;
      
      // For upgrades, use the logged-in user's email
      const requestBody = isUpgrade 
        ? {
            email: user?.email || email,
            newPlan: planId,
            firstName,
            lastName
          }
        : {
            email,
            password,
            firstName,
            lastName,
            planType: planId
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isUpgrade && user?.token ? { 'Authorization': `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      // Store the user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      // Update the auth store
      setUser(data.user);
      setToken(data.token);
      
      // Redirect to success page
      navigate('/success?plan=' + planId);
    } catch (error) {
      alert(error.message || 'Failed to create account');
      setProcessing(false);
    }
  };
  
  if (!planId || !planDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Invalid checkout session</h2>
          <p className="mt-2 text-gray-600">Please select a plan from the home page.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Upgrade</h1>
          </div>
          
          {/* Order Summary */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{description}</span>
              </div>
              
              {credit > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Price:</span>
                    <span>${(finalAmount + credit).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Credit for unused time:</span>
                    <span>-${credit.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Due Today:</span>
                  <span className="text-indigo-600">${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Account Info */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isUpgrade ? 'Billing Information' : 'Create Your Account'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Only show email/password for new signups */}
                {!isUpgrade && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Billing Info */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information (Mock)</h3>
              
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Important Notes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your billing date will reset to today</li>
                <li>• You'll be charged ${finalAmount.toFixed(2)} today</li>
                <li>• Future charges will be at the full plan price</li>
                <li>• You can cancel anytime from your account page</li>
              </ul>
            </div>
            
            {/* Actions */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => navigate('/account')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}