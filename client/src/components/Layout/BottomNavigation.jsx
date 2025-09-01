import React from 'react';
import { BsChatDots, BsJournalText, BsGear } from 'react-icons/bs';

const BottomNavigation = ({ currentView, onViewChange }) => {
  const navItems = [
    {
      id: 'chat',
      label: 'チャット',
      icon: BsChatDots,
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    },
    {
      id: 'diary',
      label: '日記',
      icon: BsJournalText,
      activeColor: 'text-purple-600',
      inactiveColor: 'text-gray-400'
    },
    {
      id: 'settings',
      label: '設定',
      icon: BsGear,
      activeColor: 'text-gray-600',
      inactiveColor: 'text-gray-400'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-gray-50' : ''
              }`}
            >
              <Icon 
                className={`text-xl mb-1 ${
                  isActive ? item.activeColor : item.inactiveColor
                }`} 
              />
              <span 
                className={`text-xs font-medium ${
                  isActive ? item.activeColor : item.inactiveColor
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;