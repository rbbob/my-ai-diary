import React, { useState } from 'react';
import ChatContainer from './components/Chat/ChatContainer';
import DiaryContainer from './components/Diary/DiaryContainer';
import SettingsContainer from './components/Settings/SettingsContainer';

function App() {
  const [currentView, setCurrentView] = useState('chat');

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatContainer />;
      case 'diary':
        return <DiaryContainer />;
      case 'settings':
        return <SettingsContainer />;
      case 'about':
        return <AboutSection />;
      default:
        return <ChatContainer />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">
            🤖 AI日記アプリ
          </h1>
          <p className="text-gray-600">
            AIとの会話を通じて素敵な日記を作成しよう
          </p>
        </header>

        {/* ナビゲーション */}
        <nav className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
            <button
              onClick={() => setCurrentView('chat')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'chat'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              💬 チャット
            </button>
            <button
              onClick={() => setCurrentView('diary')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'diary'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              📓 日記
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              ⚙️ 設定
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'about'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              ℹ️ アプリについて
            </button>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main>
          {renderView()}
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 AI日記アプリ - Powered by Claude Code & Vercel</p>
        </footer>
      </div>
    </div>
  );
}

// アプリについてセクション
const AboutSection = () => (
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🚀</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        AI日記アプリについて
      </h2>
      <p className="text-gray-600 mb-8">
        このアプリはAIとの会話を通じて、日々の出来事を記録し、<br />
        素敵な日記を自動生成するアプリケーションです。
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-bold text-blue-800 mb-2">AIチャット</h3>
          <p className="text-sm text-blue-600">
            OpenAI GPT-4o-mini を使用した<br />
            自然で親しみやすい会話
          </p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-3xl mb-3">📓</div>
          <h3 className="font-bold text-green-800 mb-2">自動日記生成</h3>
          <p className="text-sm text-green-600">
            チャット履歴から<br />
            美しい日記を自動作成
          </p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-3xl mb-3">📱</div>
          <h3 className="font-bold text-purple-800 mb-2">レスポンシブ</h3>
          <p className="text-sm text-purple-600">
            スマートフォン、タブレット、<br />
            デスクトップに完全対応
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-700">
          <strong>💡 使い方:</strong> 「チャット」タブでAIと今日の出来事について話してみてください！
        </p>
      </div>
    </div>
  </div>
);

export default App;