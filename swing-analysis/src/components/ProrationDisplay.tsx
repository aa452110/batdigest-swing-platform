import React from 'react';
import type { ProrationData } from '../services/subscriptionService';

interface ProrationDisplayProps {
  proration: ProrationData | null;
  loading: boolean;
  currentPlan: string;
  newPlan: string;
}

export function ProrationDisplay({ 
  proration, 
  loading, 
  currentPlan, 
  newPlan 
}: ProrationDisplayProps) {
  if (currentPlan === newPlan) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
          <span className="text-sm text-gray-600">Calculating proration...</span>
        </div>
      </div>
    );
  }

  if (!proration) {
    return null;
  }

  const isUpgrade = proration.isUpgrade;

  return (
    <div className={`mt-4 p-4 rounded-lg ${isUpgrade ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <h4 className={`text-sm font-semibold mb-2 ${isUpgrade ? 'text-blue-900' : 'text-yellow-900'}`}>
        {isUpgrade ? '⬆️ Upgrade Details' : '⬇️ Downgrade Details'}
      </h4>
      
      {isUpgrade && proration.proration ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Days used in current cycle:</span>
            <span className="font-medium">
              {proration.proration.daysUsed} of {proration.proration.daysInPeriod} days ({proration.proration.percentageUsed}%)
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Credit for unused time:</span>
            <span className="font-medium text-green-600">
              ${proration.proration.credit.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">New plan price:</span>
            <span className="font-medium">
              ${proration.proration.newPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-blue-900">Charge today:</span>
              <span className="font-bold text-blue-900 text-lg">
                ${proration.proration.prorated.toFixed(2)}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-blue-700 mt-2">
            ℹ️ Your billing date will reset to today and you'll be charged the full plan price on your next billing cycle.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-yellow-800 font-medium">
            Your plan will change to {newPlan === 'starter' ? 'Starter' : newPlan === 'performance' ? 'Performance' : '6-Month Performance'} at your next billing date.
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
            <p className="text-sm text-yellow-900 font-semibold mb-1">
              ⬇️ Ready to downgrade?
            </p>
            <p className="text-xs text-yellow-800">
              Click the "Change plan" button below to confirm your downgrade. The change will take effect at your next billing cycle.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}