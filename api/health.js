const { isOpenAIAvailable } = require('./openaiService');

/**
 * ヘルスチェック用API
 */
async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    openai_configured: isOpenAIAvailable(),
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  };

  console.log('Health check:', healthData);

  res.status(200).json(healthData);
}

module.exports = handler;
export default handler;