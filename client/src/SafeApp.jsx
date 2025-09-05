import React, { useState } from 'react'
import ErrorBoundary from './components/Common/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'

// 安全で最小限のアプリバージョン
function SafeApp() {
  const [currentView, setCurrentView] = useState('stats');

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI日記アプリ（安全モード）
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentView('stats')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'stats'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    統計
                  </button>
                  <button
                    onClick={() => setCurrentView('export')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'export'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    エクスポート
                  </button>
                  <button
                    onClick={() => setCurrentView('settings')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'settings'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    設定
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {currentView === 'stats' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    統計画面（安全モード）
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    現在安全モードで動作しています。完全な機能を利用するには、APIサーバーのデプロイが必要です。
                  </p>
                </div>
              )}

              {currentView === 'export' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    エクスポート機能
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    PDF出力などのエクスポート機能は後で実装されます。
                  </p>
                </div>
              )}

              {currentView === 'settings' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    設定画面
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    基本的な設定機能です。
                  </p>
                </div>
              )}
            </div>
          </main>

          <div className="fixed bottom-4 right-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <p className="text-sm">
                🚧 現在安全モードで動作中<br/>
                APIサーバーデプロイ後に全機能が利用可能になります
              </p>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default SafeApp