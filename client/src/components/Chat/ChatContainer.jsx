import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import APIStatus from './APIStatus';
import ErrorBoundary from './ErrorBoundary';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // グローバルエラーハンドラーを追加
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      
      // メッセージポートエラーまたはブラウザ拡張機能エラーの場合
      if (errorMessage.includes('message port closed') ||
          errorMessage.includes('message channel closed') ||
          errorMessage.includes('Port closed') ||
          event.filename?.includes('content.js') ||
          event.filename?.includes('extension')) {
        
        console.log('🔇 Suppressing browser/extension message port error:', errorMessage);
        event.preventDefault(); // エラーがコンソールに表示されるのを防ぐ
        return;
      }
      
      // その他のエラーはログに記録
      console.warn('🚨 Unhandled Promise Rejection:', event.reason);
    };

    const handleError = (event) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // メッセージポートエラーまたはブラウザ拡張機能エラーの場合
      if (errorMessage.includes('message port closed') ||
          errorMessage.includes('content.js') ||
          event.filename?.includes('extension')) {
        
        console.log('🔇 Suppressing browser/extension error:', errorMessage);
        event.preventDefault();
        return;
      }
      
      console.warn('🚨 Unhandled Error:', event.error || event.message);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // メッセージの重複をチェック
  const removeDuplicateMessages = (messages) => {
    const seen = new Set();
    return messages.filter(message => {
      const key = `${message.id}-${message.text}-${message.isUser}`;
      if (seen.has(key)) {
        console.warn('🔄 Duplicate message removed:', message);
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // メッセージをLocalStorageに保存
  const saveMessages = (messagesToSave) => {
    const deduplicated = removeDuplicateMessages(messagesToSave);
    localStorage.setItem('chat_messages', JSON.stringify(deduplicated));
    setMessages(deduplicated);
  };

  // LocalStorageからメッセージを読み込み（初回のみ）
  useEffect(() => {
    if (isInitialized) return;

    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('📨 Loading saved messages:', parsed.length);
          const cleanMessages = removeDuplicateMessages(parsed);
          setMessages(cleanMessages);
        } else {
          // 保存されたデータが空の場合はデフォルトメッセージ
          setMessages([{
            id: 1,
            text: "こんにちは！AI日記アプリへようこそ。今日はどんな一日でしたか？",
            isUser: false,
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // エラーの場合もデフォルトメッセージ
        setMessages([{
          id: 1,
          text: "こんにちは！AI日記アプリへようこそ。今日はどんな一日でしたか？",
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
      }
    } else {
      // LocalStorageにデータが無い場合
      setMessages([{
        id: 1,
        text: "こんにちは！AI日記アプリへようこそ。今日はどんな一日でしたか？",
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    }

    setIsInitialized(true);
  }, [isInitialized]);

  // メッセージリストを最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // リトライ機能付きAPI呼び出し
  const fetchWithRetry = async (url, options, maxRetries = 5) => {
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // より短いタイムアウトでより多くのリトライ
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          // ブラウザキャッシュを無効化
          cache: 'no-cache',
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ Request succeeded on attempt ${i + 1}`);
        return result;

      } catch (error) {
        lastError = error;
        console.warn(`❌ Attempt ${i + 1}/${maxRetries} failed:`, error.message);
        
        // 最後の試行の場合はエラーを投げる
        if (i === maxRetries - 1) {
          console.error('🚫 All retry attempts failed:', error);
          throw error;
        }
        
        // 指数バックオフ（より短い間隔）
        const delay = Math.min(500 * Math.pow(1.5, i), 2000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // この行は実際には到達しないが、型安全のため
    throw lastError;
  };

  // メッセージ送信処理
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const timestamp = new Date().toISOString();
    const baseId = Date.now();

    // ユーザーメッセージを追加
    const userMessage = {
      id: `user-${baseId}`,
      text: messageText,
      isUser: true,
      timestamp: timestamp
    };

    const newMessagesWithUser = [...messages, userMessage];
    setMessages(newMessagesWithUser);
    setIsLoading(true);

    try {
      // LocalStorageからAPIキー設定を取得
      const apiKey = localStorage.getItem('openai_api_key');
      const model = localStorage.getItem('openai_model') || 'gpt-4o-mini';

      console.log('🔍 Sending chat request:', messageText);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          message: messageText,
          messages: messages,
          apiKey: apiKey,
          model: model
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Chat response received:', data);
      
      // AIレスポンスを追加
      const aiMessage = {
        id: `ai-${baseId}`,
        text: data.response || "すみません、応答を生成できませんでした。",
        isUser: false,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessagesWithUser, aiMessage];
      saveMessages(updatedMessages);

    } catch (error) {
      console.error('Chat API Error:', error);
      
      let errorMessage = "申し訳ございません。エラーが発生しました。";
      
      // より具体的なエラー判定
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        errorMessage = "⏱️ リクエストがタイムアウトしました。もう一度お試しください。";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = "🔌 サーバーに接続できません。ネットワーク接続を確認してください。";
      } else if (error.message.includes('message port closed') || 
                 error.message.includes('message channel closed') ||
                 error.message.includes('Port closed')) {
        errorMessage = "🔄 ブラウザ通信エラーが発生しました。ページを再読み込みしてください。";
      } else if (error.message.includes('All retry attempts failed') || 
                 error.message.includes('Attempt') && error.message.includes('failed')) {
        errorMessage = "🔁 複数回試行しましたが、接続に失敗しました。しばらく待ってからお試しください。";
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = "🚫 サーバーエラーが発生しました。しばらく待ってからお試しください。";
      } else if (error.message.includes('HTTP 429')) {
        errorMessage = "⚡ アクセス制限に達しました。少し時間をおいてからお試しください。";
      }
      
      // フォールバック応答
      const fallbackMessage = {
        id: `error-${baseId}`,
        text: errorMessage,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessagesWithUser, fallbackMessage];
      saveMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-indigo-600 text-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold flex items-center">
                <span className="text-2xl mr-2">💬</span>
                AIチャット
              </h2>
              <p className="text-indigo-100 text-sm">
                AIと会話して今日の出来事を話しましょう。日記の生成はカレンダーから行えます。
              </p>
              <div className="mt-3">
                <APIStatus />
              </div>
            </div>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="border-t bg-white p-4">
          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ChatContainer;