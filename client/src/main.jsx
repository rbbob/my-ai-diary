import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// グローバルエラーハンドリングを最初に設定
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  
  // メッセージポートエラーやブラウザ拡張機能エラーを抑制
  if (message.includes('message port closed') ||
      message.includes('message channel closed') ||
      message.includes('content.js') ||
      message.includes('Extension context invalidated') ||
      message.includes('chrome-extension://') ||
      message.includes('Uncaught (in promise)')) {
    // 静かに無視（ログを出さない）
    return;
  }
  
  // その他のエラーは通常通り出力
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  // メッセージポートエラー関連の警告も抑制
  if (message.includes('message port closed') ||
      message.includes('content.js')) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// Promise rejection エラーハンドリング
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  
  if (errorMessage.includes('message port closed') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('content.js')) {
    event.preventDefault(); // ブラウザのデフォルトエラー表示を防ぐ
    return;
  }
});

// 一般的なエラーも処理
window.addEventListener('error', (event) => {
  if (event.filename && (
      event.filename.includes('content.js') ||
      event.filename.includes('chrome-extension://') ||
      event.filename.includes('moz-extension://')
    )) {
    event.preventDefault();
    return;
  }
  
  const errorMessage = event.error?.message || event.message || '';
  if (errorMessage.includes('message port closed')) {
    event.preventDefault();
    return;
  }
});

// より強力な抑制: ブラウザのネイティブコンソールをオーバーライド
(function() {
  const nativeLog = window.console;
  const suppressPatterns = [
    'message port closed',
    'content.js',
    'chrome-extension://',
    'Extension context invalidated'
  ];
  
  ['error', 'warn', 'log'].forEach(method => {
    const original = nativeLog[method];
    nativeLog[method] = function(...args) {
      const message = args.join(' ');
      
      // 抑制パターンにマッチする場合は何もしない
      for (const pattern of suppressPatterns) {
        if (message.includes(pattern)) {
          return;
        }
      }
      
      // それ以外は元のメソッドを呼び出す
      original.apply(nativeLog, args);
    };
  });
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
