import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import APIStatus from './APIStatus';

const ChatContainer = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "こんにちは！AI日記アプリへようこそ。今日はどんな一日でしたか？",
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // メッセージリストを最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // メッセージ送信処理
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // ユーザーメッセージを追加
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // API呼び出し（後で実装）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          messages: messages
        }),
      });

      if (!response.ok) {
        throw new Error('API呼び出しに失敗しました');
      }

      const data = await response.json();
      
      // AIレスポンスを追加
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response || "すみません、応答を生成できませんでした。",
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat API Error:', error);
      
      // フォールバック応答
      const fallbackMessage = {
        id: Date.now() + 1,
        text: "申し訳ございません。現在AI機能に接続できません。サーバーが起動しているか確認してください。",
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-indigo-600 text-white p-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="text-2xl mr-2">💬</span>
          AIチャット
        </h2>
        <p className="text-indigo-100 text-sm">
          AIと会話して今日の出来事を話しましょう
        </p>
        <div className="mt-3">
          <APIStatus />
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
  );
};

export default ChatContainer;