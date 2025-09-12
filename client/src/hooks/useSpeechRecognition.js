import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Web Speech API対応チェック
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // 基本設定
      recognitionRef.current.lang = 'ja-JP';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      // イベントリスナー設定
      recognitionRef.current.onstart = () => {
        console.log('🎤 音声認識開始');
        setIsRecording(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        // 最終結果または中間結果を設定
        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        // 3秒間無音が続いたら自動停止
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
          }
        }, 3000);
      };

      recognitionRef.current.onend = () => {
        console.log('🔇 音声認識終了');
        setIsRecording(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('🚨 音声認識エラー:', event.error);
        setIsRecording(false);
        setError(getErrorMessage(event.error));
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRecording]);

  const getErrorMessage = (errorType) => {
    switch (errorType) {
      case 'not-allowed':
        return 'マイクへのアクセスが拒否されました。ブラウザの設定でマイクを有効にしてください。';
      case 'no-speech':
        return '音声が検出されませんでした。もう一度お試しください。';
      case 'audio-capture':
        return 'マイクにアクセスできません。マイクが接続されているか確認してください。';
      case 'network':
        return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      case 'aborted':
        return '音声認識が中断されました。';
      default:
        return `音声認識エラー: ${errorType}`;
    }
  };

  const startRecording = async () => {
    if (!isSupported) {
      setError('お使いのブラウザは音声認識に対応していません。Chrome、Edge、Safariをお試しください。');
      return;
    }

    if (isRecording) {
      return;
    }

    try {
      // マイクへのアクセス許可をリクエスト
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      console.error('マイクアクセスエラー:', err);
      setError('マイクへのアクセスが拒否されました。ブラウザの設定でマイクを有効にしてください。');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false); // 確実に停止状態にする
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } catch (error) {
        console.error('停止エラー:', error);
        setIsRecording(false); // エラーが発生しても停止状態にする
      }
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    transcript,
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    resetTranscript
  };
};

export default useSpeechRecognition;