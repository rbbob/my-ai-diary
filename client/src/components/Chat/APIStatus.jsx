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
  }, []);

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          status: 'online',
          openai_configured: data.openai_configured,
          model: data.model,
          error: null
        });
      } else {
        throw new Error('API接続失敗');
      }
    } catch (error) {
      setApiStatus({
        status: 'offline',
        openai_configured: false,
        model: null,
        error: error.message
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