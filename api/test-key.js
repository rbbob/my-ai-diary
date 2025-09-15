const { OpenAI } = require('openai');

/**
 * Vercel サーバーレス関数: APIキーテスト
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
        valid: false,
        error: '無効なAPIキー形式です'
      });
    }

    // OpenAI クライアントを作成
    const openai = new OpenAI({
      apiKey: openai_api_key,
    });

    // 軽量なAPI呼び出しでテスト（モデル一覧取得）
    const models = await openai.models.list();
    
    // 指定されたモデルが使用可能かチェック
    const selectedModel = openai_model || 'gpt-4o-mini';
    const modelExists = models.data.some(model => model.id === selectedModel);

    console.log('✅ API key test successful');

    res.status(200).json({
      valid: true,
      message: 'APIキーは有効です',
      model: selectedModel,
      modelAvailable: modelExists,
      availableModels: models.data.filter(m => 
        m.id.includes('gpt') && !m.id.includes('instruct')
      ).map(m => m.id).slice(0, 10) // 上位10モデルのみ
    });

  } catch (error) {
    console.error('❌ API key test failed:', error);
    
    let errorMessage = 'APIキーのテストに失敗しました';
    
    if (error.status === 401) {
      errorMessage = '無効なAPIキーです';
    } else if (error.status === 429) {
      errorMessage = 'API利用制限に達しています';
    } else if (error.status === 403) {
      errorMessage = 'APIキーにアクセス権限がありません';
    }

    res.status(200).json({
      valid: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = handler;
export default handler;