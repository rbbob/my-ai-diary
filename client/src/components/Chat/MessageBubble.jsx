import React from 'react';

const MessageBubble = ({ message }) => {
  const { text, isUser, timestamp } = message;
  
  // 時刻フォーマット
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
        isUser 
          ? 'bg-indigo-600 text-white' 
          : 'bg-white text-gray-800 border border-gray-200'
      }`}>
        {/* アイコン（AIメッセージの場合） */}
        {!isUser && (
          <div className="flex items-center mb-1">
            <span className="text-lg mr-2">🤖</span>
            <span className="text-xs text-gray-500 font-medium">AI</span>
          </div>
        )}
        
        {/* メッセージテキスト */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {text}
        </p>
        
        {/* タイムスタンプ */}
        <div className={`text-xs mt-1 ${
          isUser ? 'text-indigo-200' : 'text-gray-400'
        }`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;