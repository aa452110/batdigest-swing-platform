import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AccountSettings } from '../modules/account/AccountSettings';
import { SubscriptionManager } from '../modules/account/SubscriptionManager';
import { PasswordChange } from '../modules/account/PasswordChange';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loadFromStorage, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'password'>('account');

  useEffect(() => {
    loadFromStorage();
    if (!isAuthenticated && !token) {
      navigate('/login');
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Management
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your account settings and subscription
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign out
            </button>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('account')}
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Info
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'subscription'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Password
              </button>
            </nav>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'account' && <AccountSettings user={user} token={token} />}
            {activeTab === 'subscription' && <SubscriptionManager user={user} token={token} />}
            {activeTab === 'password' && <PasswordChange token={token} />}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> To view your swing analysis videos and submit new videos, 
            please use the mobile app. This portal is for account management only.
          </p>
        </div>
      </div>
    </div>
  );
}