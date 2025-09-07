import OpenAI from 'openai';

// OpenAI クライアントの初期化
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('⚠️  OPENAI_API_KEY is not set. OpenAI features will be disabled.');
}

/**
 * OpenAI API が利用可能かチェック
 */
function isOpenAIAvailable() {
  return !!openai && !!process.env.OPENAI_API_KEY;
}

/**
 * チャット応答を生成
 */
async function generateChatResponse(messages, userProfile = {}) {
  if (!isOpenAIAvailable()) {
    // フォールバック応答
    const fallbackResponses = [
      "申し訳ございませんが、現在AI機能が利用できません。OpenAI APIキーの設定を確認してください。",
      "OpenAI APIが設定されていないため、通常の応答ができません。環境変数をご確認ください。",
      "AI機能を使用するには、OpenAI API キーの設定が必要です。"
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  try {
    // システムメッセージを構築
    let systemMessage = `あなたは親しみやすく、理解力があり、建設的なAIアシスタントです。`;
    
    if (userProfile.name) {
      systemMessage += `ユーザーの名前は${userProfile.name}です。`;
    }
    
    systemMessage += `
日常会話を通じて、ユーザーの一日の出来事や気持ちを聞き出してください。
回答は日本語で、自然で親しみやすい口調で行ってください。
ユーザーが困っていることがあれば、優しくサポートしてください。
日記を作成するのに役立つような質問も適度に織り交ぜてください。`;

    // OpenAI API呼び出し
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }))
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'すみません、応答を生成できませんでした。';

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 429) {
      return 'API利用制限に達しました。少し時間をおいてから再試行してください。';
    } else if (error.status === 401) {
      return 'API認証に失敗しました。OpenAI APIキーの設定を確認してください。';
    } else {
      return 'AI応答の生成中にエラーが発生しました。後ほど再試行してください。';
    }
  }
}

/**
 * Vercel サーバーレス関数のメインハンドラ
 */
export default async function handler(req, res) {
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

    console.log(`💬 Chat request: ${message.substring(0, 50)}...`);

    // AI応答を生成
    const aiResponse = await generateChatResponse(chatHistory, userProfile);

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