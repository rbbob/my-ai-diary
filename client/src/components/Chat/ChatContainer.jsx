import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { messageStorage, settingsStorage, appDataStorage } from '../../utils/localStorage';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

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
    
    // AI応答をシミュレート
    setIsTyping(true);
    setTimeout(() => {
      const settings = settingsStorage.getSettings();
      const aiResponses = [
        'それは興味深いですね！もう少し詳しく教えてください 🤔',
        'なるほど！それについてどう思いましたか？',
        'すばらしい経験ですね ✨ 他にも何か印象的なことはありましたか？',
        'それは大変でしたね。でも乗り越えられたのは素晴らしいです！',
        'とても良い一日だったみたいですね 😊 他にも何かありましたか？',
        `${settings.userName}さんのお話、いつも楽しみにしています！`,
        '興味深いお話ですね。もう少し詳しく聞かせてください。',
        'それはどんな気持ちでしたか？'
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: randomResponse,
        timestamp: new Date(),
        mood: 'supportive'
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // AI応答もLocalStorageに保存
      messageStorage.saveMessages(finalMessages);
      
      // AI応答分の統計も更新
      appDataStorage.updateAppData({
        totalMessages: appData.totalMessages + 2 // ユーザー + AI
      });
      
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3秒のランダム遅延
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