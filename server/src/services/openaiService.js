import dotenv from 'dotenv';
import OpenAI from 'openai';

// 環境変数を最初に読み込み
dotenv.config();

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
export function isOpenAIAvailable() {
  return !!openai && !!process.env.OPENAI_API_KEY;
}

/**
 * チャット応答を生成
 */
export async function generateChatResponse(messages, userProfile = {}) {
  if (!isOpenAIAvailable()) {
    // フォールバック応答
    const fallbackResponses = [
      "申し訳ございませんが、現在AI機能が利用できません。設定を確認してください。",
      "OpenAI APIが設定されていないため、通常の応答ができません。",
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
    
    if (userProfile.personality) {
      systemMessage += `ユーザーの好みに合わせて、${userProfile.personality}な対応を心がけてください。`;
    }
    
    systemMessage += `
日常会話を通じて、ユーザーの一日の出来事や気持ちを聞き出してください。
回答は日本語で、自然で親しみやすい口調で行ってください。
ユーザーが困っていることがあれば、優しくサポートしてください。`;

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
      return 'API認証に失敗しました。設定を確認してください。';
    } else {
      return 'AI応答の生成中にエラーが発生しました。後ほど再試行してください。';
    }
  }
}

/**
 * チャット履歴から日記を生成
 */
export async function generateDiaryFromChat(messages, date) {
  if (!isOpenAIAvailable()) {
    return {
      success: false,
      error: 'OpenAI API が設定されていません。'
    };
  }

  try {
    // チャットメッセージから内容を抽出
    const chatContent = messages
      .filter(msg => msg.text && msg.text.trim())
      .map(msg => `${msg.isUser ? 'ユーザー' : 'AI'}: ${msg.text}`)
      .join('\\n');

    if (!chatContent.trim()) {
      return {
        success: false,
        error: 'チャット履歴が空です。'
      };
    }

    const systemPrompt = `あなたは日記作成のエキスパートです。提供されたチャット履歴から、その日の出来事や気持ちを整理して、自然で読みやすい日記エントリーを作成してください。

要件:
1. 日記は一人称で書く
2. その日の主な出来事や感情を含める
3. 自然で読みやすい文章にする
4. 300-500文字程度でまとめる
5. JSON形式で返す: {"title": "日記タイトル", "content": "日記本文", "mood": "今日の気分", "weather": "天気(不明な場合はnull)"}

日付: ${date}
チャット履歴:
${chatContent}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      success: true,
      diary: {
        title: result.title || `${date}の日記`,
        content: result.content || 'チャット履歴から日記を生成できませんでした。',
        mood: result.mood || '普通',
        weather: result.weather || null,
        date: date,
        createdAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Diary generation error:', error);
    return {
      success: false,
      error: '日記生成中にエラーが発生しました: ' + error.message
    };
  }
}

export default {
  isOpenAIAvailable,
  generateChatResponse,
  generateDiaryFromChat
};