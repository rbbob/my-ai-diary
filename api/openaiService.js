// 環境変数を最初に読み込み
import { OpenAI } from 'openai';

// 動的OpenAIクライアントの取得
function getOpenAIClient(providedApiKey = null) {
  const dynamicApiKey = providedApiKey || global.userApiKey || process.env.OPENAI_API_KEY;
  
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
function isOpenAIAvailable(providedApiKey = null) {
  const dynamicApiKey = providedApiKey || global.userApiKey || process.env.OPENAI_API_KEY;
  
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
  return !!getOpenAIClient(providedApiKey);
}

/**
 * チャット応答を生成
 */
async function generateChatResponse(messages, userProfile = {}, providedApiKey = null) {
  if (!isOpenAIAvailable(providedApiKey)) {
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
    const openai = getOpenAIClient(providedApiKey);
    const dynamicModel = global.userModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
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
async function generateDiaryFromChat(messages, date) {
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
    // チャットメッセージから内容を抽出
    const chatContent = messages
      .filter(msg => msg.text && msg.text.trim())
      .map(msg => `${msg.isUser ? 'ユーザー' : 'AI'}: ${msg.text}`)
      .join('\n');

    console.log('📋 Extracted chat content:', chatContent);
    console.log('📊 Message count:', messages.length);

    if (!chatContent.trim()) {
      return {
        success: false,
        error: 'チャット履歴が空です。'
      };
    }

    const systemPrompt = `あなたは日記作成のエキスパートです。以下のチャット履歴を基に、ユーザーが実際に話した内容や体験をそのまま活用して日記を作成してください。

**重要な指示：**
- チャット履歴の内容を正確に反映する
- ユーザーが話した具体的な出来事、感情、体験をそのまま使用する
- 創作や想像で内容を変更しないこと
- チャット内容がない場合のみフォールバック内容を使用する

**要件:**
1. 日記は一人称で書く
2. チャット履歴に出てきた具体的な出来事をそのまま記載
3. ユーザーの言葉や感情表現をできる限り保持
4. 自然な日記の形式に整理する
5. JSON形式で返す: {"title": "日記タイトル", "content": "日記本文", "mood": "気分(最高/良い/まあまあ/悪い/最悪)", "weather": "天気(明記されていればそのまま、不明な場合はnull)"}

**日付:** ${date}

**チャット履歴:**
${chatContent}

上記のチャット履歴から、ユーザーが実際に体験したことや話したことをベースに日記を作成してください。`;

    // 動的OpenAIクライアントを取得
    const openai = getOpenAIClient();
    const dynamicModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    const response = await openai.chat.completions.create({
      model: dynamicModel,
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

export {
  isOpenAIAvailable,
  generateChatResponse,
  generateDiaryFromChat
};