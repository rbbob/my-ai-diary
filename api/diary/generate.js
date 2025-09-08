const { generateDiaryFromChat } = require('../openaiService');

/**
 * Vercel サーバーレス関数: 日記生成
 */
module.exports = async function handler(req, res) {
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
    const { messages = [], date } = req.body;

    // バリデーション
    if (!date) {
      return res.status(400).json({
        error: '日付が必要です。'
      });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'メッセージ履歴が必要です。'
      });
    }

    console.log(`📝 Diary generation request: ${date}, ${messages.length} messages`);

    // 日記を生成
    const result = await generateDiaryFromChat(messages, date);

    if (!result.success) {
      return res.status(400).json({
        error: result.error || '日記生成に失敗しました。'
      });
    }

    console.log('✅ Diary generated successfully');

    // 日記データを返す
    res.status(200).json({
      success: true,
      diary: result.diary,
      title: result.diary.title,
      content: result.diary.content,
      mood: result.diary.mood,
      weather: result.diary.weather,
      tags: result.diary.tags,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Diary generation API Error:', error);
    res.status(500).json({
      error: '日記生成中にエラーが発生しました。',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};