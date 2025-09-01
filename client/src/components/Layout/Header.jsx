import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const Header = ({ currentView }) => {
  const today = new Date();
  const formattedDate = format(today, 'M月d日', { locale: ja });
  
  const getViewTitle = () => {
    switch (currentView) {
      case 'chat':
        return 'チャット';
      case 'diary':
        return '日記';
      case 'settings':
        return '設定';
      default:
        return 'Daily Companion';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: App name and view */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-primary sm:text-2xl">
              Daily Companion
            </h1>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="text-gray-600 font-medium sm:text-lg">
              {getViewTitle()}
            </span>
          </div>
          
          {/* Right: Date and mood */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden xs:block">
              <div className="text-sm text-gray-600">
                {formattedDate}
              </div>
              <div className="text-xs text-gray-400">
                今日の気分
              </div>
            </div>
            <div className="text-2xl">
              😊
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;