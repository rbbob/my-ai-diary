import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const mediaStreamRef = useRef(null);

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
      // コンポーネントアンマウント時に音声認識を確実に停止
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.stop();
          console.log('🧹 Cleanup: Speech recognition stopped on unmount');
        } catch (error) {
          console.log('🧹 Cleanup completed with minor error:', error.message);
        }
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
      // マイクへのアクセス許可をリクエストし、MediaStreamを明示的に管理
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      console.log('🎤 MediaStream acquired for Bluetooth compatibility');
      
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
        
        // Bluetoothオーディオリソースを明示的に解放
        setTimeout(() => {
          try {
            // 新しい短時間のダミー音声認識セッションを作成して即座に停止
            // これによりBluetoothオーディオチャネルが適切に解放される
            const dummyRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            dummyRecognition.lang = 'ja-JP';
            dummyRecognition.continuous = false;
            dummyRecognition.interimResults = false;
            
            dummyRecognition.onstart = () => {
              setTimeout(() => {
                try {
                  dummyRecognition.stop();
                } catch (e) {
                  console.log('Dummy recognition cleanup completed');
                }
              }, 100);
            };
            
            dummyRecognition.onerror = () => {
              // エラーは無視（Bluetoothクリーンアップのため）
            };
            
            dummyRecognition.onend = () => {
              console.log('🔧 Bluetooth audio channel cleanup completed');
            };
            
            dummyRecognition.start();
          } catch (error) {
            console.log('Bluetooth cleanup fallback completed');
          }
        }, 500);
        
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