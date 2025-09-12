import React, { useState, useRef } from 'react';
import VoiceInputButton from './VoiceInputButton';

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const voiceInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      setIsManuallyEdited(false); // 手動編集フラグをリセット
      // 音声入力の状態もクリア
      if (voiceInputRef.current) {
        voiceInputRef.current.clearVoiceInput();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (!isManuallyEdited) {
      setMessage(transcript);
    }
  };

  const handleVoiceStart = () => {
    setIsManuallyEdited(false); // 音声入力開始時にフラグをリセット
  };

  const handleManualChange = (e) => {
    setMessage(e.target.value);
    setIsManuallyEdited(true); // 手動編集フラグを設定
    // 音声入力を停止
    if (voiceInputRef.current) {
      voiceInputRef.current.clearVoiceInput();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={handleManualChange}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力してください..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          rows="2"
          disabled={isLoading}
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">
            {message.length}/2000文字
          </span>
          <span className="text-xs text-gray-400">
            Enter: 送信 / Shift+Enter: 改行
          </span>
        </div>
      </div>
      
      {/* 音声入力ボタン */}
      <VoiceInputButton 
        ref={voiceInputRef}
        onTranscript={handleVoiceTranscript} 
        onStart={handleVoiceStart}
        disabled={isLoading} 
      />
      
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          !message.trim() || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            送信中
          </div>
        ) : (
          <div className="flex items-center">
            <span className="mr-1">送信</span>
            <span className="text-lg">📤</span>
          </div>
        )}
      </button>
    </form>
  );
};

export default MessageInput;