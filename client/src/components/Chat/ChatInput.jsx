import React, { useState } from 'react';
import { BsSend, BsPlusCircle, BsEmojiSmile } from 'react-icons/bs';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // サンプル提案メッセージ
  const suggestions = [
    '今日の気分はどう？',
    '最近の出来事について',
    'お疲れさまでした',
    '今日学んだこと'
  ];

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {/* 提案メッセージ（空の時のみ表示） */}
      {!message.trim() && (
        <div className="mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setMessage(suggestion)}
                className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                disabled={disabled}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* 添付ボタン */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={disabled}
        >
          <BsPlusCircle className="w-6 h-6" />
        </button>

        {/* メッセージ入力エリア */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all max-h-32 min-h-[48px]"
            rows="1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
          
          {/* 絵文字ボタン */}
          <button
            type="button"
            className="absolute right-3 bottom-3 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={disabled}
          >
            <BsEmojiSmile className="w-5 h-5" />
          </button>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`flex-shrink-0 p-3 rounded-full transition-all ${
            message.trim() && !disabled
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <BsSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;