import React, { useState, useRef, useEffect, useContext } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { messageStorage, settingsStorage, appDataStorage } from '../../utils/localStorage';
import { ToastContext } from '../../App';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useContext(ToastContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 初期化時にLocalStorageからメッセージを読み込み
  useEffect(() => {
    const savedMessages = messageStorage.getMessages();
    const appData = appDataStorage.getAppData();
    const settings = settingsStorage.getSettings();
    
    if (savedMessages.length === 0) {
      // 初回起動時のウェルカムメッセージ
      const welcomeMessage = {
        id: Date.now(),
        role: 'ai',
        content: `こんにちは！Daily Companionへようこそ 😊\n私は${settings.aiName}です。今日はどんな一日でしたか？`,
        timestamp: new Date(),
        mood: 'friendly'
      };
      setMessages([welcomeMessage]);
      messageStorage.saveMessages([welcomeMessage]);
      setIsFirstLaunch(true);
      
      // 起動回数をカウント
      appDataStorage.incrementLaunchCount();
    } else {
      // 保存済みメッセージを復元
      const messagesWithDates = savedMessages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content) => {
    if (!content.trim()) return;

    // ユーザーメッセージを追加
    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // LocalStorageに保存
    messageStorage.saveMessages(updatedMessages);
    
    // 統計更新
    const appData = appDataStorage.getAppData();
    appDataStorage.updateAppData({
      totalMessages: appData.totalMessages + 1
    });
    
    // API経由でAI応答を取得
    setIsTyping(true);
    
    const getChatResponse = async () => {
      try {
        const settings = settingsStorage.getSettings();
        
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            messages: updatedMessages,
            userSettings: settings
          }),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        
        if (data.success) {
          const aiMessage = {
            id: Date.now() + 1,
            role: 'ai',
            content: data.data.message.content,
            timestamp: new Date(),
            mood: data.data.message.mood || 'neutral'
          };
          
          const finalMessages = [...updatedMessages, aiMessage];
          setMessages(finalMessages);
          
          // AI応答もLocalStorageに保存
          messageStorage.saveMessages(finalMessages);
          
          // AI応答分の統計も更新
          appDataStorage.updateAppData({
            totalMessages: appData.totalMessages + 2 // ユーザー + AI
          });
        }
      } catch (error) {
        console.error('Chat API Error:', error);
        
        // より詳細なエラー情報を提供
        let errorText = 'すみません、応答中にエラーが発生しました。';
        if (error.message.includes('fetch')) {
          errorText = 'サーバーに接続できませんでした。インターネット接続を確認してください。';
        } else if (error.message.includes('timeout')) {
          errorText = '応答時間が長すぎます。もう一度お試しください。';
        }
        
        toast?.error(errorText);
        
        // エラー時のフォールバック応答
        const errorMessage = {
          id: Date.now() + 1,
          role: 'ai',
          content: 'すみません、一時的にお答えできませんが、またお話しいただければと思います。',
          timestamp: new Date(),
          mood: 'neutral'
        };
        
        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        messageStorage.saveMessages(finalMessages);
      } finally {
        setIsTyping(false);
      }
    };
    
    // 少し遅延してからAPI呼び出し
    setTimeout(getChatResponse, 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* チャットメッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* タイピングインジケーター */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatContainer;