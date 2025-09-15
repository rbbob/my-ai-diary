/**
 * Vercel サーバーレス関数: 設定保存
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
    const { openai_api_key, openai_model } = req.body;

    // バリデーション
    if (!openai_api_key || !openai_api_key.startsWith('sk-')) {
      return res.status(400).json({
        error: '有効なOpenAI APIキーを入力してください（sk-で始まる）'
      });
    }

    // 設定をグローバル変数として保存（Vercel Functions用）
    global.userApiKey = openai_api_key;
    global.userModel = openai_model || 'gpt-4o-mini';

    // APIキーの動的取得関数を設定
    global.getDynamicApiKey = () => global.userApiKey;
    global.getDynamicModel = () => global.userModel;

    console.log('✅ API key configured successfully');

    res.status(200).json({
      success: true,
      message: '設定を保存しました',
      model: global.userModel
    });

  } catch (error) {
    console.error('❌ Config API Error:', error);
    res.status(500).json({
      error: '設定の保存中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default handler;