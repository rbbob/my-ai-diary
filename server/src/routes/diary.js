import express from 'express';
import { generateDiaryEntry } from '../services/openaiService.js';

const router = express.Router();

// 日記生成
router.post('/generate', async (req, res) => {
  try {
    const { messages = [], userSettings = {}, date } = req.body;

    if (!messages.length) {
      return res.status(400).json({
        success: false,
        error: 'Messages are required for diary generation'
      });
    }

    // 日記生成
    const diaryData = await generateDiaryEntry(messages, userSettings);

    // 日記エントリーオブジェクトを作成
    const diaryEntry = {
      diaryId: `diary_${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      title: diaryData.title,
      summary: diaryData.summary,
      mood: diaryData.mood,
      highlights: diaryData.highlights || [],
      tags: diaryData.tags || [],
      wordCount: diaryData.wordCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedFrom: 'ai',
      usage: diaryData.usage,
      fallback: diaryData.fallback || false
    };

    res.json({
      success: true,
      data: diaryEntry
    });

  } catch (error) {
    console.error('Diary Generation API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate diary',
      details: error.message
    });
  }
});

// 日記リスト取得（将来の拡張用）
router.get('/entries', async (req, res) => {
  try {
    // 現在はクライアントサイドのLocalStorageを使用
    // 将来的にはデータベース連携を追加予定
    res.json({
      success: true,
      message: 'Diary entries are stored client-side',
      data: []
    });
  } catch (error) {
    console.error('Diary List API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get diary entries',
      details: error.message
    });
  }
});

export default router;