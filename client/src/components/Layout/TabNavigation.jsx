import React from 'react';
import { BsChatDots, BsJournalText, BsGear } from 'react-icons/bs';

const TabNavigation = ({ currentView, onViewChange }) => {
  const navItems = [
    {
      id: 'chat',
      label: 'チャット',
      icon: BsChatDots,
      activeColor: 'text-blue-600 border-blue-600',
      inactiveColor: 'text-gray-500 border-transparent hover:text-gray-700'
    },
    {
      id: 'diary',
      label: '日記',
      icon: BsJournalText,
      activeColor: 'text-purple-600 border-purple-600',
      inactiveColor: 'text-gray-500 border-transparent hover:text-gray-700'
    },
    {
      id: 'settings',
      label: '設定',
      icon: BsGear,
      activeColor: 'text-gray-600 border-gray-600',
      inactiveColor: 'text-gray-500 border-transparent hover:text-gray-700'
    }
  ];

  return (
    <nav className="hidden md:block border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  isActive ? item.activeColor : item.inactiveColor
                }`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;