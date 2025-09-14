import dotenv from 'dotenv';
import OpenAI from 'openai';

// 環境変数を最初に読み込み
dotenv.config();

// 動的OpenAIクライアントの取得
function getOpenAIClient() {
  const dynamicApiKey = global.getDynamicApiKey ? global.getDynamicApiKey() : process.env.OPENAI_API_KEY;
  
  if (!dynamicApiKey) {
    console.warn('⚠️  OpenAI API Key not available. Using fallback mode.');
    return null;
  }

  return new OpenAI({
    apiKey: dynamicApiKey,
  });
}

/**
 * OpenAI API が利用可能かチェック
 */
export function isOpenAIAvailable() {
  const dynamicApiKey = global.getDynamicApiKey ? global.getDynamicApiKey() : process.env.OPENAI_API_KEY;
  
  console.log('🔍 Checking OpenAI availability:', { 
    hasKey: !!dynamicApiKey, 
    keyPrefix: dynamicApiKey?.substring(0, 10) + '...',
    isTestKey: dynamicApiKey === 'test-api-key'
  });
  
  // APIキーが無効またはtest-api-keyの場合はfalseを返す
  if (!dynamicApiKey || dynamicApiKey === 'test-api-key' || !dynamicApiKey.startsWith('sk-')) {
    console.log('🚫 OpenAI API not available - using demo mode');
    return false;
  }
  
  console.log('✅ OpenAI API available');
  return !!getOpenAIClient();
}

/**
 * チャット応答を生成
 */
export async function generateChatResponse(messages, userProfile = {}) {
  if (!isOpenAIAvailable()) {
    console.log('💬 Demo mode: Generating sample chat response');
    
    // デモモードでより自然な会話応答を生成
    const lastMessage = messages[messages.length - 1]?.text?.toLowerCase() || '';
    
    // キーワードベースの応答選択
    let demoResponses = [];
    
    if (lastMessage.includes('おはよう') || lastMessage.includes('朝')) {
      demoResponses = [
        "おはようございます！今日も素敵な一日にしましょう。どんな予定がありますか？",
        "おはようございます！朝の気分はいかがですか？今日の予定を聞かせてください。"
      ];
    } else if (lastMessage.includes('疲れ') || lastMessage.includes('大変')) {
      demoResponses = [
        "お疲れ様です。大変だったんですね。詳しく聞かせてもらえますか？",
        "疲れているようですね。今日は何か特別なことがあったのでしょうか？"
      ];
    } else if (lastMessage.includes('楽し') || lastMessage.includes('嬉し')) {
      demoResponses = [
        "それは素晴らしいですね！どんな楽しいことがあったのか詳しく教えてください。",
        "嬉しそうですね！その気持ちをもっと聞かせてください。"
      ];
    } else if (lastMessage.includes('食べ') || lastMessage.includes('料理') || lastMessage.includes('ランチ') || lastMessage.includes('夕食')) {
      demoResponses = [
        "おいしそうですね！どんなお食事でしたか？味はいかがでしたか？",
        "食事のお話ですね。誰と一緒に食べましたか？"
      ];
    } else if (lastMessage.includes('仕事') || lastMessage.includes('会社')) {
      demoResponses = [
        "お仕事はいかがでしたか？今日は順調に進みましたか？",
        "職場でのことですね。同僚の方々とのコミュニケーションはうまくいっていますか？"
      ];
    } else {
      // 一般的な応答
      demoResponses = [
        "なるほど、興味深いお話ですね。もう少し詳しく聞かせていただけますか？",
        "そうなんですね！その時の気持ちはどうでしたか？",
        "それはどんな体験でしたか？もう少し教えてください。",
        "興味深いですね。その後はどうなりましたか？",
        "そのお話、もっと詳しく聞きたいです。どんな気分でしたか？"
      ];
    }
    
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
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

    // 動的OpenAIクライアントを取得
    const openai = getOpenAIClient();
    const dynamicModel = global.getDynamicModel ? global.getDynamicModel() : (process.env.OPENAI_MODEL || 'gpt-4o-mini');
    
    // OpenAI API呼び出し
    const response = await openai.chat.completions.create({
      model: dynamicModel,
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
    // デモモードでサンプル日記を生成
    console.log('📝 Demo mode: Generating sample diary');
    return {
      success: true,
      diary: {
        title: `${date}の日記（デモ）`,
        content: `今日はAI日記アプリのテストを行った。チャット機能とカレンダー機能が正常に動作することを確認できた。OpenAI APIキーを設定すれば、実際のAI機能を使用できるようになる。アプリのデザインも美しく、使いやすいインターフェースが完成している。`,
        mood: 'まあまあ',
        weather: null,
        tags: ['テスト', 'AI日記', 'アプリ開発']
      }
    };
  }

  try {
    // 指定された日付のメッセージのみを厳密にフィルタリング
    const targetDate = new Date(date + 'T00:00:00');
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    console.log(`🎯 Target date: ${date}`);
    console.log(`📅 Target date range: ${targetDate.toISOString()} to ${nextDate.toISOString()}`);
    
    // メッセージを日付でフィルタリング（同日のメッセージのみ）
    const relevantMessages = messages.filter(msg => {
      if (!msg.timestamp) return false;
      const msgDate = new Date(msg.timestamp);
      const isRelevant = msgDate >= targetDate && msgDate < nextDate;
      if (isRelevant) {
        console.log(`✅ Relevant message: ${msgDate.toISOString()} - ${msg.text?.substring(0, 50)}...`);
      }
      return isRelevant;
    });

    console.log(`📋 Filtering messages for date ${date}:`);
    console.log(`📊 Total messages: ${messages.length}`);
    console.log(`📊 Relevant messages for ${date}: ${relevantMessages.length}`);

    // 該当日のメッセージがない場合はエラーを返す
    if (relevantMessages.length === 0) {
      return {
        success: false,
        error: `${date}のチャット履歴が見つかりません。該当日にチャットを行ってから日記を生成してください。`
      };
    }

    // 当日のメッセージのみを使用
    let messagesToUse = relevantMessages;

    // チャットメッセージから内容を抽出（タイムスタンプ付き）
    const chatContent = messagesToUse
      .filter(msg => msg.text && msg.text.trim())
      .map(msg => {
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ja-JP') : '時刻不明';
        return `[${timestamp}] ${msg.isUser ? 'ユーザー' : 'AI'}: ${msg.text}`;
      })
      .join('\n');

    console.log('📋 Extracted chat content for', date);
    console.log('📊 Message count used:', messagesToUse.length);
    console.log('🕐 Time range:', messagesToUse.length > 0 ? 
      `${new Date(messagesToUse[0].timestamp).toLocaleString()} - ${new Date(messagesToUse[messagesToUse.length-1].timestamp).toLocaleString()}` : 'No messages');

    if (!chatContent.trim()) {
      return {
        success: false,
        error: 'チャット履歴が空です。'
      };
    }

    const systemPrompt = `あなたは日記作成のエキスパートです。${date}の日記を作成してください。

**最重要指示：**
- 以下のチャット履歴は${date}当日のもののみです
- 他の日の内容は一切含まれていません
- ${date}当日の内容のみを使用して日記を作成してください
- 過去の日記の内容を推測したり含めたりしないでください

**厳格な要件:**
1. ${date}当日のチャット内容のみを使用
2. 他の日付の内容は絶対に含めない
3. 推測や想像での内容追加は禁止
4. チャット履歴に基づいた事実のみ記載
5. 日記は一人称で自然な文体に整理
6. JSON形式で返答: {"title": "${date}の出来事", "content": "日記本文", "mood": "気分(最高/良い/まあまあ/悪い/最悪)", "weather": "天気(不明な場合はnull)", "tags": ["当日の活動に基づくタグ"]}

**${date}当日のチャット履歴のみ:**
${chatContent}

上記の${date}当日のチャット内容のみを使用して、その日の日記を作成してください。他の日の内容は含めないでください。`;

    // 動的OpenAIクライアントを取得
    const openai = getOpenAIClient();
    const dynamicModel = global.getDynamicModel ? global.getDynamicModel() : (process.env.OPENAI_MODEL || 'gpt-4o-mini');
    
    const response = await openai.chat.completions.create({
      model: dynamicModel,
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      success: true,
      diary: {
        title: result.title || `${date}の日記`,
        content: result.content || 'チャット履歴から日記を生成できませんでした。',
        mood: result.mood || 'まあまあ',
        weather: result.weather || null,
        tags: result.tags || [],
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