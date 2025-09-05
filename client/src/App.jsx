import React, { useState, useEffect, createContext } from 'react'
import Header from './components/Layout/Header'
import BottomNavigation from './components/Layout/BottomNavigation'
import TabNavigation from './components/Layout/TabNavigation'
import ChatContainer from './components/Chat/ChatContainer'
import DiaryContainer from './components/Diary/DiaryContainer'
import SettingsContainer from './components/Settings/SettingsContainer'
import SearchContainer from './components/Search/SearchContainer'
import StatsContainer from './components/Stats/StatsContainer'
import ExportContainer from './components/Export/ExportContainer'
import ToastContainer from './components/Common/ToastContainer'
import ErrorBoundary from './components/Common/ErrorBoundary'
import { useToast } from './hooks/useToast'
import { ThemeProvider } from './contexts/ThemeContext'
import { reminderScheduler, notificationManager } from './utils/notifications'
import { reminderStorage, diaryStorage } from './utils/localStorage'

export const ToastContext = createContext(null);

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const { toasts, toast, removeToast } = useToast();

  // リマインダーシステムの初期化
  useEffect(() => {
    const initializeReminderSystem = async () => {
      // 通知許可をチェック
      const hasPermission = await notificationManager.requestPermission();
      
      // リマインダー設定を取得
      const reminderSettings = reminderStorage.getReminderSettings();
      
      // 日次リマインダーが有効な場合はスケジュール設定
      if (reminderSettings.enabled && reminderSettings.dailyReminder.enabled && hasPermission) {
        reminderScheduler.scheduleDailyReminder(
          reminderSettings.dailyReminder.hour,
          reminderSettings.dailyReminder.minute
        );
      }
      
      // 継続記録と励まし通知のチェック
      const diaryEntries = diaryStorage.getDiaryEntries();
      
      if (reminderSettings.streakNotifications && hasPermission) {
        reminderScheduler.checkStreak(diaryEntries);
      }
      
      if (reminderSettings.encouragementNotifications && hasPermission) {
        reminderScheduler.checkForEncouragement(diaryEntries);
      }
    };

    initializeReminderSystem();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col">
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
      case 'search':
        return (
          <div className="h-full">
            <SearchContainer 
              onDiarySelect={(diary) => {
                // 日記詳細画面に遷移する処理
                setCurrentView('diary');
                // TODO: 選択された日記を表示する処理を実装
              }}
              onChatSelect={(message) => {
                // チャット画面に遷移する処理
                setCurrentView('chat');
                // TODO: 選択されたメッセージにスクロールする処理を実装
              }}
            />
          </div>
        );
      case 'stats':
        return (
          <div className="h-full">
            <StatsContainer />
          </div>
        );
      case 'export':
        return (
          <div className="h-full">
            <ExportContainer />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastContext.Provider value={toast}>
          <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <Header currentView={currentView} />
            <TabNavigation currentView={currentView} onViewChange={setCurrentView} />
            
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-20 md:pb-6 overflow-hidden">
              {renderContent()}
            </main>

            <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
            
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
          </div>
        </ToastContext.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App