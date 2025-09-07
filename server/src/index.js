import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// ルートのインポート
import chatRoutes from './routes/chat.js';
import diaryRoutes from './routes/diary.js';

const app = express();
const PORT = process.env.PORT || 3004;

// セキュリティミドルウェア
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5176', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: process.env.RATE_LIMIT_MAX || 100, // リクエスト制限
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// ボディパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// テストエンドポイント
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'AI Diary Server is running!',
    openai_configured: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  });
});

// APIルート
app.use('/api/chat', chatRoutes);
app.use('/api/diary', diaryRoutes);

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 AI Diary Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
});

export default app;