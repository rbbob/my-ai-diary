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

  // 段階的デバッグ：最小限のコンポーネントから開始
  try {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f9fafb',
        padding: '20px',
        fontSize: '16px',
        color: '#111827'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Daily Companion - 段階的テスト</h1>
        
        <div style={{ marginBottom: '15px' }}>
          <p>✅ App.jsx レンダリング成功</p>
          <p>✅ 基本的なJavaScript動作</p>
          <p>現在のビュー: {currentView}</p>
        </div>

        <button 
          onClick={() => setCurrentView(currentView === 'chat' ? 'diary' : 'chat')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '20px'
          }}
        >
          ビュー切替テスト ({currentView})
        </button>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h3>次のステップ:</h3>
          <p>1. このテストが成功 → 個別コンポーネントに問題</p>
          <p>2. このテストが失敗 → より基本的な問題</p>
          <p>3. Errorバウンダリやインポートエラーを調査</p>
        </div>

        {/* Toast機能の基本テスト */}
        <button 
          onClick={() => toast({ message: 'テストメッセージ', type: 'success' })}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            marginTop: '10px'
          }}
        >
          Toast機能テスト
        </button>

        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  } catch (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        fontSize: '18px'
      }}>
        <h1>❌ App.jsx エラー発生</h1>
        <p>エラー: {error.message}</p>
        <p>スタック: {error.stack}</p>
      </div>
    );
  }
}

export default App