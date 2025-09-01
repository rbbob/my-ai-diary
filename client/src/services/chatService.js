import axios from 'axios';

// APIベースURL
const API_BASE = '/api';

// Axiosインスタンス設定
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 429) {
      throw new Error('APIリクエストが多すぎます。しばらく待ってから再試行してください。');
    } else if (error.response?.status >= 500) {
      throw new Error('サーバーエラーが発生しました。しばらく待ってから再試行してください。');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('リクエストがタイムアウトしました。ネットワーク接続を確認してください。');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('予期しないエラーが発生しました。');
    }
  }
);

// チャット関連のAPI
export const chatService = {
  // メッセージ送信とAI応答取得
  sendMessage: async (message, messages = [], userSettings = {}) => {
    try {
      const response = await api.post('/chat/message', {
        message,
        messages,
        userSettings
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 気分分析
  analyzeMood: async (messages) => {
    try {
      const response = await api.post('/chat/analyze-mood', {
        messages
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 日記関連のAPI
export const diaryService = {
  // 日記生成
  generateDiary: async (messages, userSettings = {}, date = null) => {
    try {
      const response = await api.post('/diary/generate', {
        messages,
        userSettings,
        date
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 日記一覧取得（将来拡張用）
  getDiaryEntries: async () => {
    try {
      const response = await api.get('/diary/entries');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// ヘルスチェック
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  chatService,
  diaryService,
  healthCheck
};