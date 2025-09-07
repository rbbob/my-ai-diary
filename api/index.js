import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { generateChatResponse, generateDiaryFromChat } from '../server/src/services/openaiService.js';

// 環境変数の読み込み
dotenv.config();

const app = express();

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
  max: process.env.RATE_LIMIT_MAX || 100,
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

// チャットAPI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, messages = [], userProfile = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'メッセージが必要です。'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'メッセージが長すぎます。2000文字以下にしてください。'
      });
    }

    const chatHistory = [...messages, { text: message, isUser: true }].slice(-10);
    const aiResponse = await generateChatResponse(chatHistory, userProfile);

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: 'チャット処理中にエラーが発生しました。',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 日記生成API
app.post('/api/diary/generate', async (req, res) => {
  try {
    const { messages, date } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'チャット履歴が必要です。'
      });
    }

    if (!date) {
      return res.status(400).json({
        error: '日付が必要です。'
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: '日付はYYYY-MM-DD形式で入力してください。'
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: '日記を生成するためのチャット履歴がありません。'
      });
    }

    const result = await generateDiaryFromChat(messages, date);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      success: true,
      diary: result.diary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Diary generation API Error:', error);
    res.status(500).json({
      error: '日記生成中にエラーが発生しました。',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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

export default app;