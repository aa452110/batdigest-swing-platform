import React from 'react';
import { Link } from 'react-router-dom';

interface SwingShopHeaderProps {
  rightContent?: React.ReactNode;
  isDark?: boolean; // For pages with dark backgrounds
}

export function SwingShopHeader({ rightContent, isDark = false }: SwingShopHeaderProps) {
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  
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
          {rightContent && (
            <div className="flex items-center">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}