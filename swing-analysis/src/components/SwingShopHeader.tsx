import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface SwingShopHeaderProps {
  rightContent?: React.ReactNode;
  isDark?: boolean; // For pages with dark backgrounds
}

export function SwingShopHeader({ rightContent, isDark = false }: SwingShopHeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const buttonTextColor = isDark ? 'text-white hover:text-cyan-300' : 'text-gray-700 hover:text-gray-900';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className={`py-4 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600' : 'bg-white border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/swing-shop-icon.png" 
              alt="Swing Shop" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className={`text-xl md:text-2xl font-bold ${textColor}`}>Swing Shop</span>
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>A BatDigest.com Initiative</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {rightContent}
            {isAuthenticated && user ? (
              <>
                <Link 
                  to="/account" 
                  className={`font-medium ${buttonTextColor} transition-colors`}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className={`font-medium ${buttonTextColor} transition-colors`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className={`font-medium ${buttonTextColor} transition-colors`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}