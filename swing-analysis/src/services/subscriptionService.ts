/**
 * Subscription service for handling plan changes, cancellations, and proration
 */

import { API_BASE } from './api';

export type ProrationData = {
  isUpgrade: boolean;
  proration?: {
    credit: number;
    newPrice: number;
    prorated: number;
    daysUsed: number;
    daysInPeriod: number;
    percentageUsed: number;
  };
  message: string;
};

export interface SubscriptionChangeResult {
  success: boolean;
  message?: string;
  error?: string;
  checkoutData?: {
    type: 'upgrade' | 'downgrade';
    description: string;
    amount: number;
    credit?: number;
    newPlan: string;
    resetBillingDate: boolean;
  };
}

/**
 * Calculate proration preview for plan change
 */
export async function calculateProrationPreview(
  newPlan: string,
  token: string
): Promise<ProrationData | null> {
  try {
    const response = await fetch(`${API_BASE}/api/subscription/proration-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newPlan }),
    });

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Error calculating proration:', error);
    return null;
  }
}

/**
 * Change subscription plan
 */
export async function changeSubscriptionPlan(
  newPlan: string,
  token: string
): Promise<SubscriptionChangeResult> {
  try {
    const response = await fetch(`${API_BASE}/api/subscription/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newPlan }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error changing subscription:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(token: string): Promise<{
  success: boolean;
  accessUntil?: string;
  accessUntilFormatted?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Format proration message for display
 */
export function formatProrationMessage(proration: ProrationData | null): string {
  if (!proration) return '';
  
  if (proration.isUpgrade && proration.proration) {
    const { credit, prorated, percentageUsed } = proration.proration;
    return `You'll receive a $${credit.toFixed(2)} credit for unused time (${percentageUsed}% used). Today's charge: $${prorated.toFixed(2)}`;
  }
  
  return proration.message;
}

/**
 * Determine if a plan change is an upgrade
 */
export function isUpgrade(currentPlan: string, newPlan: string): boolean {
  const planValues: Record<string, number> = {
    starter: 1,
    performance: 2,
    sixmonth: 3,
  };
  
  return planValues[newPlan] > planValues[currentPlan];
}

/**
 * Get subscription status display text
 */
export function getSubscriptionStatusText(
  status: string,
  subscriptionEnd?: string
): string {
  if (status === 'active') {
    return 'Active - Recurring';
  }
  
  if (status === 'cancelled' && subscriptionEnd) {
    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    
    if (endDate > now) {
      return 'Active - Not Recurring';
    }
    return 'Cancelled';
  }
  
  if (status === 'expired') {
    return 'Expired';
  }
  
  return status;
}

/**
 * Build checkout URL for prorated upgrades
 */
export function buildCheckoutUrl(checkoutData: any): string {
  // For now, use the React checkout page
  // When Stripe is ready, change this to redirect to your Flask checkout:
  // return `http://localhost:5003/checkout/swing?plan=${checkoutData.newPlan}&upgrade=true&credit=${checkoutData.credit}&amount=${checkoutData.amount}`;
  
  const params = new URLSearchParams({
    plan: checkoutData.newPlan,
    amount: checkoutData.amount.toString(),
    credit: checkoutData.credit?.toString() || '0',
    description: checkoutData.description,
    type: 'upgrade',
  });
  
  return `/checkout?${params.toString()}`;
}