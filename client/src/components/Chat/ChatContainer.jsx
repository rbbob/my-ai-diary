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
  const [isGeneratingDiary, setIsGeneratingDiary] = useState(false);
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

  // 日記生成機能
  const generateDiaryFromChat = async () => {
    setIsGeneratingDiary(true);
    
    try {
      // 日記生成API呼び出し
      const response = await fetch('/api/diary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error('日記生成に失敗しました');
      }

      const data = await response.json();
      
      // 新しい日記エントリーを作成
      const newDiary = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: data.title || '今日の日記',
        content: data.content || '日記の生成に失敗しました。',
        mood: data.mood || 'まあまあ',
        weather: data.weather || null,
        generated: true,
        createdAt: new Date().toISOString(),
        tags: data.tags || []
      };

      // LocalStorageに保存
      const existingDiaries = JSON.parse(localStorage.getItem('diary_entries') || '[]');
      const updatedDiaries = [newDiary, ...existingDiaries];
      localStorage.setItem('diary_entries', JSON.stringify(updatedDiaries));
      
      // 成功メッセージをチャットに追加
      const successMessage = {
        id: Date.now() + 1,
        text: `✨ 日記「${data.title}」を生成しました！📓 日記タブで確認できます。`,
        isUser: false,
        timestamp: new Date().toISOString(),
        isSystem: true
      };

      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Diary generation error:', error);
      
      // エラーメッセージをチャットに追加
      const errorMessage = {
        id: Date.now() + 1,
        text: "申し訳ございません。日記の生成に失敗しました。OpenAI APIキーが正しく設定されているか確認してください。",
        isUser: false,
        timestamp: new Date().toISOString(),
        isSystem: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingDiary(false);
    }
  };

  return (
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
              AIと会話して今日の出来事を話しましょう
            </p>
            <div className="mt-3">
              <APIStatus />
            </div>
          </div>
          
          {messages.length > 2 && (
            <div className="ml-4">
              <button
                onClick={generateDiaryFromChat}
                disabled={isGeneratingDiary}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
                title="この会話から日記を自動生成します"
              >
                {isGeneratingDiary ? '🔄 生成中...' : '📓 日記生成'}
              </button>
            </div>
          )}
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