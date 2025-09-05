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
  const [appError, setAppError] = useState(null);

  // 緊急デバッグ用のログ
  console.log('App component rendered, currentView:', currentView);
  console.log('App error state:', appError);
  
  // モバイルデバッグ用の早期リターン
  if (typeof window !== 'undefined') {
    console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
    console.log('User agent:', navigator.userAgent);
  }

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

  // CSSを完全に無視して、DOM操作でスタイリング
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box !important; }
      html, body { margin: 0 !important; padding: 0 !important; }
      #root { 
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: #ff0000 !important;
        color: white !important;
        font-size: 20px !important;
        padding: 20px !important;
        z-index: 9999 !important;
        overflow: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div>
      <h1>🔴 DEBUG MODE - モバイルテスト成功！</h1>
      <p>✅ JavaScript動作中</p>
      <p>✅ React レンダリング成功</p>
      <p>📱 画面サイズ: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
      <p>🌐 User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 60) + '...' : 'N/A'}</p>
      <p>📊 現在のビュー: {currentView}</p>
      <button 
        onClick={() => {
          const newView = currentView === 'chat' ? 'diary' : 'chat';
          setCurrentView(newView);
          console.log('View changed to:', newView);
        }}
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        🔄 View切替テスト (現在: {currentView})
      </button>
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '8px'
      }}>
        <p>🎯 このテストが成功すれば:</p>
        <p>• JavaScript/React は正常</p>
        <p>• 問題はCSSまたはTailwind設定</p>
        <p>• 元のアプリ復元可能</p>
      </div>
    </div>
  )
}

export default App