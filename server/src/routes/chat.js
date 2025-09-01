import express from 'express';
import { generateChatResponse, analyzeMood } from '../services/openaiService.js';

const router = express.Router();

// チャットメッセージに対する応答生成
router.post('/message', async (req, res) => {
  try {
    const { message, messages = [], userSettings = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // 新しいユーザーメッセージを含めたメッセージ履歴を作成
    const updatedMessages = [
      ...messages,
      {
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      }
    ];

    // OpenAI APIで応答生成
    const aiResponse = await generateChatResponse(updatedMessages, userSettings);

    // 気分分析
    const currentMood = await analyzeMood(updatedMessages);

    res.json({
      success: true,
      data: {
        message: {
          id: Date.now(),
          role: 'ai',
          content: aiResponse.content,
          timestamp: new Date(),
          mood: currentMood
        },
        usage: aiResponse.usage,
        fallback: aiResponse.fallback || false
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

// 会話履歴の気分分析
router.post('/analyze-mood', async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (!messages.length) {
      return res.status(400).json({
        success: false,
        error: 'Messages are required for mood analysis'
      });
    }

    const mood = await analyzeMood(messages);

    res.json({
      success: true,
      data: { mood }
    });

  } catch (error) {
    console.error('Mood Analysis API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze mood',
      details: error.message
    });
  }
});

export default router;