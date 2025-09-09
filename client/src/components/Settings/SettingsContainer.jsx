import React, { useState, useEffect } from 'react';

const SettingsContainer = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // LocalStorageから設定を読み込み
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
    setApiKey(savedApiKey);
    setModel(savedModel);
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage('APIキーを入力してください');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // サーバーにAPIキーを送信
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openai_api_key: apiKey,
          openai_model: model
        }),
      });

      if (!response.ok) {
        throw new Error('設定の保存に失敗しました');
      }

      const data = await response.json();

      // LocalStorageに保存
      localStorage.setItem('openai_api_key', apiKey);
      localStorage.setItem('openai_model', model);

      setMessage('設定を保存しました！');
      
      // 3秒後にメッセージをクリア
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Settings Error:', error);
      setMessage('設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setMessage('APIキーを入力してください');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // テスト用の軽量なAPI呼び出し
      const response = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openai_api_key: apiKey,
          openai_model: model
        }),
      });

      if (!response.ok) {
        throw new Error('APIキーのテストに失敗しました');
      }

      const data = await response.json();
      
      if (data.valid) {
        setMessage('✅ APIキーは有効です！');
      } else {
        setMessage('❌ APIキーが無効です');
      }
      
    } catch (error) {
      console.error('Test Error:', error);
      setMessage('❌ APIキーのテストに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('すべての設定をクリアしますか？')) {
      setApiKey('');
      setModel('gpt-4o-mini');
      localStorage.removeItem('openai_api_key');
      localStorage.removeItem('openai_model');
      setMessage('✨ 設定をクリアしました');
      
      // 3秒後にメッセージをクリア
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleShowKey = () => {
    const input = document.getElementById('api-key');
    if (input.type === 'password') {
      input.type = 'text';
      setTimeout(() => {
        input.type = 'password';
      }, 3000); // 3秒後に再度隠す
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="text-2xl mr-2">⚙️</span>
        設定
      </h2>

      <div className="space-y-6">
        {/* OpenAI API設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            🤖 OpenAI API 設定
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                APIキー
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  OpenAI Platform
                </a>でAPIキーを取得してください
              </p>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                モデル
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (推奨)</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-center"
            >
              {isLoading ? '🔄 テスト中...' : '🧪 テスト'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 min-w-[120px] px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-center"
            >
              {isLoading ? '🔄 保存中...' : '💾 保存'}
            </button>
            
            <button
              onClick={handleShowKey}
              disabled={isLoading}
              className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-center"
            >
              👁️ キー表示
            </button>
            
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="flex-1 min-w-[120px] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-center"
            >
              🗑️ クリア
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('✅') || message.includes('保存しました') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* アプリ情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            ℹ️ アプリ情報
          </h3>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>バージョン:</strong> 1.0.0</p>
            <p><strong>開発:</strong> AI日記アプリ</p>
            <p><strong>データ保存:</strong> ローカルストレージ</p>
            <p><strong>AI機能:</strong> OpenAI API</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContainer;