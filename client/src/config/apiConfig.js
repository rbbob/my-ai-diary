const isProduction = import.meta.env.MODE === 'production';

export const API_CONFIG = {
  // バックエンドAPIのベースURL
  // 一時的にローカルプロキシを使用してエラーを回避
  BASE_URL: '/api',
  
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