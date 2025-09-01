import React, { useState } from 'react'
import Header from './components/Layout/Header'
import BottomNavigation from './components/Layout/BottomNavigation'
import TabNavigation from './components/Layout/TabNavigation'
import ChatContainer from './components/Chat/ChatContainer'
import DiaryContainer from './components/Diary/DiaryContainer'
import SettingsContainer from './components/Settings/SettingsContainer'

function App() {
  const [currentView, setCurrentView] = useState('chat');

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return (
          <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
            <ChatContainer />
          </div>
        );
      case 'diary':
        return (
          <div className="h-full">
            <DiaryContainer />
          </div>
        );
      case 'settings':
        return (
          <div className="h-full">
            <SettingsContainer />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header currentView={currentView} />
      <TabNavigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-20 md:pb-6 overflow-hidden">
        {renderContent()}
      </main>

      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}

export default App