const isProduction = import.meta.env.MODE === 'production';

export const API_CONFIG = {
  // バックエンドAPIのベースURL
  BASE_URL: isProduction 
    ? 'https://daily-companion-api.onrender.com/api'
    : '/api',
  
  // タイムアウト設定（ミリ秒）
  TIMEOUT: 30000,
  
  // リトライ設定
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ヘルパー関数
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;