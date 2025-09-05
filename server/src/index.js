import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import diaryRoutes from './routes/diary.js';
import profileRoutes from './routes/profile.js';
import configRoutes from './routes/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Daily Companion サーバーが正常に動作しています！',
    version: '1.0.0',
    features: ['chat', 'diary', 'openai']
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Daily Companion サーバーがポート ${PORT} で起動しました`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});