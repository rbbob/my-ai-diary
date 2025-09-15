import { generateChatResponse } from './openaiService.js';

/**
 * Vercel サーバーレス関数のメインハンドラ
 */
async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, messages = [], userProfile = {}, apiKey, model } = req.body;

    // ユーザー設定のAPIキーが送信された場合は動的に設定
    if (apiKey && apiKey.startsWith('sk-')) {
      global.userApiKey = apiKey;
      global.getDynamicApiKey = () => global.userApiKey;
    }
    if (model) {
      global.userModel = model;
      global.getDynamicModel = () => global.userModel;
    }

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

    console.log(`💬 Chat request: ${message.substring(0, 50)}...`);

    // AI応答を生成
    const aiResponse = await generateChatResponse(chatHistory, userProfile, apiKey);

    // 応答を返す
    res.status(200).json({
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
}

export default handler;