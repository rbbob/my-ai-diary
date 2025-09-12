import React from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

const VoiceInputButton = React.forwardRef(({ onTranscript, onStart, disabled }, ref) => {
  const {
    transcript,
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    resetTranscript
  } = useSpeechRecognition();

  const [hasAppliedTranscript, setHasAppliedTranscript] = React.useState(false);
  const [allowManualEdit, setAllowManualEdit] = React.useState(true);

  // 外部からの状態リセットを可能にする
  React.useImperativeHandle(ref, () => ({
    clearVoiceInput: () => {
      stopRecording();
      resetTranscript();
      setHasAppliedTranscript(false);
      setAllowManualEdit(true);
    }
  }), [stopRecording, resetTranscript]);

  // 音声認識中はリアルタイムでテキストを更新
  React.useEffect(() => {
    if (transcript && onTranscript && isRecording && allowManualEdit) {
      console.log('📝 Updating transcript while recording:', transcript);
      onTranscript(transcript);
    }
  }, [transcript, onTranscript, isRecording, allowManualEdit]);

  // 録音終了時に最終結果を一度だけ送信
  React.useEffect(() => {
    if (!isRecording && transcript && !hasAppliedTranscript && onTranscript && allowManualEdit) {
      console.log('✅ Applying final transcript:', transcript);
      onTranscript(transcript);
      setHasAppliedTranscript(true);
      
      // 1秒後に手動編集を許可し、音声での上書きを停止
      const timer = setTimeout(() => {
        console.log('✏️ Enabling manual edit mode');
        setAllowManualEdit(false); // 音声による上書きを停止
        
        // さらに1秒後にトランスクリプトをクリア
        setTimeout(() => {
          console.log('🧹 Cleaning up transcript');
          resetTranscript();
          setHasAppliedTranscript(false);
        }, 1000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, transcript, hasAppliedTranscript, onTranscript, allowManualEdit, resetTranscript]);

  const handleClick = () => {
    if (isRecording) {
      console.log('🛑 Stopping recording');
      stopRecording();
    } else {
      console.log('🎤 Starting recording');
      resetTranscript();
      setHasAppliedTranscript(false);
      setAllowManualEdit(true); // 新しい録音では音声入力を許可
      if (onStart) {
        onStart(); // 録音開始を通知
      }
      startRecording();
    }
  };

  // ブラウザが音声認識に対応していない場合
  if (!isSupported) {
    return (
      <div className="relative group">
        <button
          type="button"
          disabled
          className="px-3 py-2 text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
          title="お使いのブラウザは音声認識に対応していません"
        >
          🎤
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          音声認識非対応
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`px-3 py-2 rounded-md transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        title={
          isRecording 
            ? '音声認識を停止' 
            : disabled 
            ? '送信中は音声入力できません'
            : '音声入力開始'
        }
      >
        {isRecording ? (
          <span className="flex items-center">
            🎤
            <span className="ml-1 text-xs">録音中</span>
          </span>
        ) : (
          '🎤'
        )}
      </button>

      {/* 音声認識中のリアルタイム表示 - 録音中のみ表示 */}
      {isRecording && transcript && (
        <div className="absolute top-full left-0 mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md shadow-lg z-10 max-w-xs">
          <div className="text-xs text-blue-600 mb-1">認識中...</div>
          <div className="text-sm text-gray-800">{transcript}</div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="absolute top-full left-0 mt-1 px-3 py-2 bg-red-50 border border-red-200 rounded-md shadow-lg z-10 max-w-sm">
          <div className="text-xs text-red-600 mb-1">エラー</div>
          <div className="text-sm text-gray-800">{error}</div>
          <button
            onClick={resetTranscript}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
          >
            閉じる
          </button>
        </div>
      )}

      {/* 音声認識の使い方ヒント */}
      {!isRecording && !error && !transcript && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          クリックして音声入力
        </div>
      )}
    </div>
  );
});

VoiceInputButton.displayName = 'VoiceInputButton';

export default VoiceInputButton;