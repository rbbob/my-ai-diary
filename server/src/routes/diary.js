import express from 'express';
import { generateDiaryFromChat } from '../services/openaiService.js';

const router = express.Router();

/**
 * POST /api/diary/generate
 * チャット履歴から日記エントリーを生成
 */
router.post('/generate', async (req, res) => {
  try {
    const { messages, date, apiKey, model } = req.body;

    // バリデーション
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

    // 日付形式のバリデーション
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: '日付はYYYY-MM-DD形式で入力してください。'
      });
    }

    console.log(`📝 Diary generation request for date: ${date}, messages: ${messages.length}`);

    // メッセージが空の場合
    if (messages.length === 0) {
      return res.status(400).json({
        error: '日記を生成するためのチャット履歴がありません。'
      });
    }

    // 動的なAPIキーとモデルを設定
    if (apiKey) {
      global.getDynamicApiKey = () => apiKey;
    }
    if (model) {
      global.getDynamicModel = () => model;
    }

    // 日記を生成
    const result = await generateDiaryFromChat(messages, date);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    // 成功応答
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

/**
 * GET /api/diary/status
 * 日記生成機能の状態を確認
 */
router.get('/status', (req, res) => {
  res.json({
    available: true,
    openai_configured: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    features: {
      chat_to_diary: true,
      json_response: true
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/diary/validate
 * 日記データの形式をバリデーション
 */
router.post('/validate', (req, res) => {
  try {
    const { diary } = req.body;

    if (!diary) {
      return res.status(400).json({
        valid: false,
        error: '日記データが必要です。'
      });
    }

    const requiredFields = ['title', 'content', 'date'];
    const missingFields = requiredFields.filter(field => !diary[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        valid: false,
        error: `必須フィールドが不足しています: ${missingFields.join(', ')}`
      });
    }

    // 日付形式のバリデーション
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(diary.date)) {
      return res.status(400).json({
        valid: false,
        error: '日付はYYYY-MM-DD形式で入力してください。'
      });
    }

    res.json({
      valid: true,
      message: '日記データは有効です。'
    });

  } catch (error) {
    console.error('Diary validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'バリデーション中にエラーが発生しました。'
    });
  }
});

export default router;