import React, { useState, useEffect } from 'react';

const APIStatus = () => {
  const [apiStatus, setApiStatus] = useState({
    status: 'checking',
    openai_configured: false,
    model: null,
    error: null
  });

  useEffect(() => {
    checkAPIStatus();
    
    // LocalStorageの変更を監視
    const handleStorageChange = (e) => {
      if (e.key === 'openai_api_key' || e.key === 'openai_model') {
        console.log('🔄 LocalStorage API settings changed, rechecking status...');
        setTimeout(checkAPIStatus, 500); // 少し遅延して実行
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAPIStatus = async () => {
    try {
      // まずLocalStorageの設定をチェック
      const localApiKey = localStorage.getItem('openai_api_key');
      const localModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
      
      // LocalStorageにAPIキーがある場合は、それをサーバーに送信してチェック
      if (localApiKey && localApiKey.startsWith('sk-')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒タイムアウト

        const response = await fetch('/api/test-key', {
          method: 'POST',
          signal: controller.signal,
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify({
            openai_api_key: localApiKey,
            openai_model: localModel
          })
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ LocalStorage API key test successful:', data);
          setApiStatus({
            status: 'online',
            openai_configured: data.valid,
            model: localModel,
            error: null
          });
          return;
        }
      }

      // LocalStorageにAPIキーがない場合はサーバーのヘルスチェック
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/health', {
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Status check successful:', data);
        setApiStatus({
          status: 'online',
          openai_configured: data.openai_configured,
          model: data.model,
          error: null
        });
      } else {
        throw new Error(`API接続失敗: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn('❌ API Status check failed:', error.message);
      
      let errorMessage = 'API接続エラー';
      
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        errorMessage = 'タイムアウト';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = '接続失敗';
      } else if (error.message.includes('message port closed') || 
                 error.message.includes('message channel closed')) {
        errorMessage = 'ブラウザ通信エラー';
      }

      setApiStatus({
        status: 'offline',
        openai_configured: false,
        model: null,
        error: errorMessage
      });
    }
  };

  const getStatusColor = () => {
    switch (apiStatus.status) {
      case 'online': return apiStatus.openai_configured ? 'text-green-600' : 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus.status) {
      case 'online': return apiStatus.openai_configured ? '🟢' : '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    if (apiStatus.status === 'checking') return 'API状態確認中...';
    if (apiStatus.status === 'offline') return 'API オフライン';
    if (apiStatus.openai_configured) return `AI機能 有効 (${apiStatus.model})`;
    return 'API オンライン (OpenAI未設定)';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <button
        onClick={checkAPIStatus}
        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
      >
        🔄 更新
      </button>
    </div>
  );
};

export default APIStatus;