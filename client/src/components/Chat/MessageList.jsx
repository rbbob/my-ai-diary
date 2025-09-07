import React from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
        />
      ))}
      
      {/* ローディング表示 */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 max-w-xs">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm text-gray-500 ml-2">AIが考え中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;