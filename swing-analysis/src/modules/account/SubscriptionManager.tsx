import React, { useState, useEffect } from 'react';
import { ProrationDisplay } from '../../components/ProrationDisplay';
import {
  calculateProrationPreview,
  changeSubscriptionPlan,
  cancelSubscription,
  formatProrationMessage,
  getSubscriptionStatusText,
  buildCheckoutUrl,
} from '../../services/subscriptionService';
import type { ProrationData } from '../../services/subscriptionService';

interface SubscriptionManagerProps {
  user: any;
  token: string | null;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$25/mo',
    features: ['2 analyses per month', 'Pro coach feedback', 'Frame-by-frame analysis', 'Progress tracking', 'iOS app access'],
  },
  {
    id: 'performance',
    name: 'Performance',
    price: '$45/mo',
    features: ['4 analyses per month', 'Pro coach feedback', 'Frame-by-frame analysis', 'Progress tracking', 'iOS app access', 'Priority support'],
    popular: true,
  },
  {
    id: 'sixmonth',
    name: '6-Month Performance',
    price: '$249',
    features: ['4 analyses per month', '24 total analyses', 'Pro coach feedback', 'Frame-by-frame analysis', 'Progress tracking', 'iOS app access', 'Priority support', 'Save vs monthly'],
  },
];

function getNextBillingDate(dateString?: string, planType?: string): string {
  if (!dateString) {
    return 'Not available';
  }
  
  const date = new Date(dateString);
  const now = new Date();
  const monthsToAdd = planType === 'sixmonth' ? 6 : 1;
  
  while (date <= now) {
    date.setMonth(date.getMonth() + monthsToAdd);
  }
  
  return date.toLocaleDateString();
}

export function SubscriptionManager({ user, token }: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState(user.planType);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [proration, setProration] = useState<ProrationData | null>(null);
  const [loadingProration, setLoadingProration] = useState(false);

  // Calculate proration when plan selection changes
  useEffect(() => {
    if (selectedPlan !== user.planType && token) {
      loadProration();
    } else {
      setProration(null);
    }
  }, [selectedPlan, user.planType, token]);

  const loadProration = async () => {
    if (!token) return;
    
    setLoadingProration(true);
    const result = await calculateProrationPreview(selectedPlan, token);
    setProration(result);
    setLoadingProration(false);
  };

  const handlePlanChange = async () => {
    // For users with Stripe subscriptions, redirect to Stripe Customer Portal
    if (user.stripeCustomerId) {
      setIsChanging(true);
      setError('');
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8787'}/api/stripe/create-portal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: user.stripeCustomerId,
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.portalUrl) {
          // Redirect to Stripe Customer Portal
          window.location.href = data.portalUrl;
        } else {
          setError('Failed to open subscription management portal');
          setIsChanging(false);
        }
      } catch (error) {
        console.error('Portal error:', error);
        setError('Failed to open subscription management portal');
        setIsChanging(false);
      }
      return;
    }
    
    // Fallback for users without Stripe (shouldn't happen in production)
    if (!token || selectedPlan === user.planType) {
      setError('Please select a different plan');
      return;
    }

    setIsChanging(true);
    setError('');
    setSuccess('');

    // For new subscriptions, redirect to checkout
    window.location.href = `/stripe-checkout?plan=${selectedPlan}`;
    setIsChanging(false);
  };

  const handleCancelSubscription = async () => {
    if (!token) return;
    
    setIsChanging(true);
    setError('');

    const result = await cancelSubscription(token);

    if (result.success) {
      setSuccess(`Subscription cancelled. You have access until ${result.accessUntilFormatted}`);
      setShowCancelConfirm(false);
      
      const updatedUser = { 
        ...user, 
        subscriptionStatus: 'cancelled',
        subscriptionEnd: result.accessUntil 
      };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    } else {
      setError(result.error || 'Failed to cancel subscription');
    }

    setIsChanging(false);
  };

  const subscriptionStatusText = getSubscriptionStatusText(
    user.subscriptionStatus,
    user.subscriptionEnd
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900">Current Plan</h4>
        <p className="mt-1 text-lg font-semibold text-indigo-600">
          {PLANS.find(p => p.id === user.planType)?.name || user.planType}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">
            Status: <span className={
              user.subscriptionStatus === 'active' ? 'text-green-600' : 
              user.subscriptionStatus === 'cancelled' ? 'text-yellow-600' : 
              'text-red-600'
            }>
              {subscriptionStatusText}
            </span>
          </p>
          {user.subscriptionStatus === 'active' && (
            <p className="text-sm text-gray-600">
              Next billing date: <span className="font-medium">
                {getNextBillingDate(user.nextBillingDate || user.createdAt, user.planType)}
              </span>
            </p>
          )}
          {user.subscriptionStatus === 'cancelled' && user.subscriptionEnd && (
            <p className="text-sm text-gray-600">
              Access until: <span className="font-medium">
                {new Date(user.subscriptionEnd).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Subscription Management */}
      {user.stripeCustomerId ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Manage Your Subscription</h4>
          <p className="text-sm text-gray-600 mb-4">
            You can change plans, update payment methods, or view billing history through our secure billing portal.
          </p>
          <button
            onClick={handlePlanChange}
            disabled={isChanging}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isChanging ? 'Opening Portal...' : 'Manage Subscription'}
          </button>
        </div>
      ) : (
        /* Show plan options for users without Stripe subscription */
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Upgrade Your Plan</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.filter(p => p.id !== user.planType).map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-lg border border-gray-300 bg-white p-4"
              >
                {plan.popular && (
                  <span className="absolute -top-2 -left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Most Popular
                  </span>
                )}
                <h5 className="text-lg font-medium text-gray-900">{plan.name}</h5>
                <p className="mt-1 text-sm text-gray-500">{plan.price}</p>
                <ul className="mt-3 space-y-2">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    handlePlanChange();
                  }}
                  className="mt-4 w-full bg-indigo-600 text-white text-sm py-2 px-4 rounded hover:bg-indigo-700"
                >
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {user.subscriptionStatus === 'active' && (
        <div className="pt-4 border-t">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-sm text-red-600 hover:text-red-500"
          >
            Cancel subscription
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Subscription?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel your subscription? You'll retain access until the end of your current billing period.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Keep subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isChanging}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isChanging ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}