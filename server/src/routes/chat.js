import express from 'express';
import { generateChatResponse } from '../services/openaiService.js';

const router = express.Router();

/**
 * POST /api/chat
 * チャットメッセージを処理してAI応答を生成
 */
router.post('/', async (req, res) => {
  try {
    const { message, messages = [], userProfile = {} } = req.body;

    // バリデーション
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

    // メッセージ履歴を構築（最新10件まで）
    const chatHistory = [...messages, { text: message, isUser: true }].slice(-10);

    console.log(`💬 Chat request from user: ${message.substring(0, 50)}...`);

    // AI応答を生成
    const aiResponse = await generateChatResponse(chatHistory, userProfile);

    // 応答を返す
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

/**
 * GET /api/chat/status
 * チャット機能の状態を確認
 */
router.get('/status', (req, res) => {
  res.json({
    available: true,
    openai_configured: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    timestamp: new Date().toISOString()
  });
});

export default router;