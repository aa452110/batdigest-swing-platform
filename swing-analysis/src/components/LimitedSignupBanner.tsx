import React, { useEffect, useState } from 'react';

export const LimitedSignupBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('signupBannerDismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('signupBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  // Static 25% for now - can update manually
  const percentage = 25;
  const spotsRemaining = 15;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1.5">
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-xs sm:text-sm md:text-base">
                Limited Beta
              </span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-white/30"></div>
            <div className="flex items-center">
              <span className="text-xs sm:text-sm md:text-base">
                <span className="font-bold">{percentage}% subscribed</span>
                <span className="hidden sm:inline ml-2 text-white/90">
                  • Only {spotsRemaining} spots remaining
                </span>
                <span className="sm:hidden ml-1.5 text-white/90">
                  • {spotsRemaining} left
                </span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <a 
              href="/#pricing" 
              className="bg-white text-red-600 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors"
            >
              <span className="hidden sm:inline">Claim Your Spot</span>
              <span className="sm:hidden">Get Started</span>
            </a>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};