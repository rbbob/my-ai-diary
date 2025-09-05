// 入力検証ユーティリティ関数

export const validateMessage = (message) => {
  const errors = [];
  
  // 空文字チェック
  if (!message || message.trim().length === 0) {
    errors.push('メッセージを入力してください');
  }
  
  // 最小文字数チェック
  if (message && message.trim().length < 1) {
    errors.push('メッセージは1文字以上入力してください');
  }
  
  // 最大文字数チェック（チャット用）
  if (message && message.length > 1000) {
    errors.push('メッセージは1000文字以内で入力してください');
  }
  
  // 不適切なコンテンツのチェック（基本的なスパム防止）
  const spamPatterns = [
    /(.)\1{10,}/, // 同じ文字の連続（10文字以上）
    /^https?:\/\//, // URL（必要に応じて）
  ];
  
  spamPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      errors.push('不適切な内容が含まれている可能性があります');
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUsername = (username) => {
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('ユーザー名を入力してください');
  }
  
  if (username && username.length > 30) {
    errors.push('ユーザー名は30文字以内で入力してください');
  }
  
  if (username && username.length < 1) {
    errors.push('ユーザー名は1文字以上入力してください');
  }
  
  // 特殊文字チェック
  const invalidChars = /[<>\"'&]/;
  if (username && invalidChars.test(username)) {
    errors.push('ユーザー名に使用できない文字が含まれています');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAIName = (aiName) => {
  const errors = [];
  
  if (!aiName || aiName.trim().length === 0) {
    errors.push('AI名を入力してください');
  }
  
  if (aiName && aiName.length > 20) {
    errors.push('AI名は20文字以内で入力してください');
  }
  
  // 特殊文字チェック
  const invalidChars = /[<>\"'&]/;
  if (aiName && invalidChars.test(aiName)) {
    errors.push('AI名に使用できない文字が含まれています');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAPIKey = (apiKey) => {
  const errors = [];
  
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      isValid: true, // APIキーは任意
      errors: []
    };
  }
  
  // OpenAI APIキーの基本的な形式チェック
  if (apiKey && !apiKey.startsWith('sk-')) {
    errors.push('有効なOpenAI APIキーを入力してください（sk-で始まる必要があります）');
  }
  
  if (apiKey && apiKey.length < 20) {
    errors.push('APIキーの形式が正しくありません');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// リアルタイムバリデーション用のデバウンス関数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// エラー表示用のヘルパー関数
export const getFirstError = (errors) => {
  return errors && errors.length > 0 ? errors[0] : null;
};