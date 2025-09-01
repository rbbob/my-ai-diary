import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedTime = format(message.timestamp, 'HH:mm', { locale: ja });

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      friendly: '😊',
      curious: '🤔',
      excited: '✨',
      supportive: '🤗',
      thoughtful: '💭'
    };
    return moodEmojis[mood] || '🤖';
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">あ</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">{getMoodEmoji(message.mood)}</span>
          </div>
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl break-words ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          {/* メッセージを改行で分割して表示 */}
          {message.content.split('\n').map((line, index) => (
            <div key={index}>
              {line}
              {index < message.content.split('\n').length - 1 && <br />}
            </div>
          ))}
        </div>
        
        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-1">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;