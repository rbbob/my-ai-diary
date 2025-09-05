import React, { useState, useEffect } from 'react';
import { FaKey, FaCheckCircle, FaExclamationTriangle, FaSync, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default function APIKeySection() {
  const [apiStatus, setApiStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API状態を確認
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await api.get('/config/openai-status');
      if (response.data.success) {
        setApiStatus(response.data.data);
      }
    } catch (error) {
      console.error('API status check failed:', error);
      setApiStatus({ configured: false, fallbackMode: true });
    }
  };

  // APIキー設定
  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setError('OpenAI APIキーは "sk-" で始まる必要があります');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/config/set-openai-key', {
        apiKey: apiKey.trim()
      });

      if (response.data.success) {
        setSuccess('APIキーが設定されました！');
        setApiKey(''); // セキュリティのため入力をクリア
        
        if (response.data.requiresRestart) {
          setTimeout(() => {
            handleRestartServer();
          }, 2000);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'APIキーの設定に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // サーバー再起動
  const handleRestartServer = async () => {
    try {
      setSuccess('サーバーを再起動しています...');
      
      await api.post('/config/restart-server');
      
      // 再起動待機
      setTimeout(() => {
        checkApiStatus();
        setSuccess('サーバーが再起動されました！新しいAPIキーが有効になりました。');
      }, 3000);
      
    } catch (error) {
      // 再起動時は通信エラーが正常なので無視
      setTimeout(() => {
        checkApiStatus();
        setSuccess('サーバーが再起動されました！');
      }, 3000);
    }
  };

  const getStatusDisplay = () => {
    if (!apiStatus) return { color: 'gray', text: '確認中...', icon: FaSync };
    
    if (apiStatus.configured) {
      return { 
        color: 'green', 
        text: 'OpenAI API 接続済み', 
        icon: FaCheckCircle,
        detail: `モデル: ${apiStatus.model}`
      };
    } else {
      return { 
        color: 'yellow', 
        text: 'フォールバックモード', 
        icon: FaExclamationTriangle,
        detail: 'APIキーを設定すると高品質なAI機能が利用できます'
      };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FaKey className="text-blue-500 mr-3" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">OpenAI API 設定</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          APIキーを設定すると、より高品質なAI機能が利用できます
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* 現在の状態 */}
        <div className={`p-4 rounded-lg border-l-4 border-${status.color}-400 bg-${status.color}-50`}>
          <div className="flex items-center">
            <status.icon className={`text-${status.color}-600 mr-3`} size={20} />
            <div>
              <div className={`font-semibold text-${status.color}-800`}>
                {status.text}
              </div>
              {status.detail && (
                <div className={`text-sm text-${status.color}-700 mt-1`}>
                  {status.detail}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* APIキー入力 */}
        {(!apiStatus?.configured) && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API キー
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  OpenAI Platform
                </a>
                でAPIキーを取得してください
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <FaCheckCircle className="mr-2" />
                  <span className="text-sm">{success}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSetApiKey}
              disabled={loading || !apiKey.trim()}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <FaSync className="animate-spin mr-2" />
                  設定中...
                </div>
              ) : (
                'APIキーを設定'
              )}
            </button>
          </div>
        )}

        {/* API設定済みの場合の操作 */}
        {apiStatus?.configured && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🎉 OpenAI API 設定完了！</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ GPT-4による高品質な会話</li>
                <li>✅ あなたの性格を学習・記憶</li>
                <li>✅ 個人化された日記生成</li>
                <li>✅ 長期記憶による継続的な関係</li>
              </ul>
            </div>
            
            <button
              onClick={checkApiStatus}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaSync className="inline mr-2" />
              接続状態を確認
            </button>
          </div>
        )}

        {/* 簡単設定ガイド */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">💡 簡単設定ガイド</h4>
          <ol className="text-sm text-gray-700 space-y-2">
            <li>1. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">OpenAI Platform</a> にアクセス</li>
            <li>2. "Create new secret key" をクリック</li>
            <li>3. キーをコピーして上の入力欄に貼り付け</li>
            <li>4. "APIキーを設定" をクリック</li>
            <li>5. 自動でサーバーが再起動されて完了！</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            ※ OpenAI Plus (20ドル/月) をお持ちの場合、API使用料は別途かかります（通常月2-5ドル程度）
          </p>
        </div>
      </div>
    </div>
  );
}