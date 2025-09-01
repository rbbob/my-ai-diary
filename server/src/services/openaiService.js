import OpenAI from 'openai';

// OpenAI クライアントの初期化（APIキーがない場合はnull）
let openai = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI API initialized successfully');
} else {
  console.log('⚠️ OpenAI API key not configured - using fallback mode');
}

// チャット応答生成
export const generateChatResponse = async (messages, userSettings = {}) => {
  try {
    // APIキーが設定されていない場合はフォールバック応答
    if (!openai) {
      const { userName = 'ユーザー' } = userSettings;
      const fallbackResponses = [
        `${userName}さん、こんにちは！現在はデモモードで動作しています。`,
        'それは興味深いですね！OpenAI APIを設定すると、より自然な会話ができますよ。',
        'お話ありがとうございます！実際のAI機能を使うにはAPIキーが必要です。',
        'とても良いお話ですね。設定でAPIキーを追加すると本格的なAI会話が楽しめます。'
      ];
      
      return {
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        fallback: true
      };
    }
    const { userName = 'ユーザー', aiName = 'アシスタント', aiPersonality = 'friendly' } = userSettings;
    
    // AI性格に基づくシステムプロンプト
    const personalityPrompts = {
      friendly: `あなたは${aiName}という名前の親しみやすいAIアシスタントです。${userName}さんと楽しく会話をしてください。フレンドリーで温かい口調で話し、時々絵文字も使ってください。`,
      professional: `あなたは${aiName}という名前の丁寧なAIアシスタントです。${userName}さんに対して常に敬語を使い、礼儀正しく接してください。`,
      casual: `あなたは${aiName}という名前のカジュアルなAIアシスタントです。${userName}さんとは友達のように気軽に話してください。くだけた口調でOKです。`,
      supportive: `あなたは${aiName}という名前のサポート重視のAIアシスタントです。${userName}さんを常に励まし、前向きな言葉をかけてください。共感と応援を心がけてください。`
    };

    const systemMessage = {
      role: 'system',
      content: personalityPrompts[aiPersonality] + '\n\nあなたはDaily Companionというアプリの一部で、ユーザーの日常会話パートナーです。後でこの会話を元に日記を生成するので、日常の出来事や感情について聞いてみてください。返答は簡潔に、2-3文程度で答えてください。'
    };

    // メッセージ履歴を整形（最新10件まで）
    const formattedMessages = [
      systemMessage,
      ...messages.slice(-10).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: formattedMessages,
      max_tokens: 150,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('OpenAI API returned empty response');
    }

    return {
      content: aiResponse,
      usage: response.usage
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // API エラーの場合のフォールバック応答
    const fallbackResponses = [
      'すみません、一時的に応答できません。少し後でもう一度お試しください。',
      'AI機能に問題が発生しました。しばらく時間をおいてから再度お話しください。',
      'システムの調子が悪いようです。申し訳ございません。'
    ];
    
    return {
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      error: error.message,
      fallback: true
    };
  }
};

// 日記生成
export const generateDiaryEntry = async (messages, userSettings = {}) => {
  try {
    // APIキーが設定されていない場合はフォールバック日記生成
    if (!openai) {
      const { userName = 'ユーザー' } = userSettings;
      const fallbackTitle = 'AIとの会話';
      const fallbackSummary = `今日は${userName}としてAIアシスタントと会話をしました。現在はデモモードで動作していますが、実際のOpenAI APIを設定することで、より自然で個人的な日記を生成することができます。毎日の会話から自動で振り返りを作成してくれる機能は、日々の記録として役立ちそうです。`;
      
      return {
        title: fallbackTitle,
        summary: fallbackSummary,
        mood: 'neutral',
        highlights: ['AIとの会話体験', 'デモモードでの動作確認'],
        tags: ['AI', 'デモ', 'テスト'],
        wordCount: fallbackSummary.length,
        fallback: true
      };
    }
    const { userName = 'ユーザー' } = userSettings;
    
    // 会話から日記生成用のプロンプト
    const conversationText = messages
      .filter(msg => msg.role === 'user') // ユーザーメッセージのみ
      .map(msg => msg.content)
      .join('\n');

    if (!conversationText.trim()) {
      throw new Error('No user messages found for diary generation');
    }

    const diaryPrompt = `以下は${userName}さんの今日の会話内容です。この内容から、${userName}さん目線での日記を生成してください。

会話内容:
${conversationText}

要求事項:
- ${userName}さんの一人称で書く
- 2-3段落の読みやすい日記形式
- 今日の出来事、感情、気づきを含める
- 自然で親しみやすい文体
- 150-300文字程度

また、以下の情報をJSONで返してください:
{
  "title": "日記のタイトル（10文字以内）",
  "summary": "日記本文",
  "mood": "happy|excited|neutral|sad|anxious|peaceful のいずれか",
  "highlights": ["今日のハイライト1", "ハイライト2", "ハイライト3"],
  "tags": ["タグ1", "タグ2", "タグ3"]
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたは日記作成アシスタントです。ユーザーの会話から自然で読みやすい日記を生成してください。必ずJSON形式で返答してください。'
        },
        {
          role: 'user',
          content: diaryPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('OpenAI API returned empty response for diary generation');
    }

    const diaryData = JSON.parse(aiResponse);
    
    // 必要なフィールドの検証
    if (!diaryData.title || !diaryData.summary) {
      throw new Error('Invalid diary data structure');
    }

    return {
      ...diaryData,
      wordCount: diaryData.summary.length,
      usage: response.usage
    };

  } catch (error) {
    console.error('Diary Generation Error:', error);
    
    // フォールバック日記生成
    const fallbackTitle = '今日の振り返り';
    const fallbackSummary = '今日も一日お疲れさまでした。AIとの会話を通して、いろいろなことを話すことができました。毎日少しずつ、自分の気持ちや考えを整理する時間を持てて良かったです。明日も新しい一日として、楽しく過ごしていきたいと思います。';
    
    return {
      title: fallbackTitle,
      summary: fallbackSummary,
      mood: 'neutral',
      highlights: ['AIとの会話', '今日の振り返り'],
      tags: ['日常', '振り返り'],
      wordCount: fallbackSummary.length,
      error: error.message,
      fallback: true
    };
  }
};

// 気分分析（メッセージから感情を分析）
export const analyzeMood = async (messages) => {
  try {
    // APIキーが設定されていない場合はフォールバック気分分析
    if (!openai) {
      const moods = ['happy', 'neutral', 'peaceful'];
      return moods[Math.floor(Math.random() * moods.length)];
    }
    const recentMessages = messages.slice(-5).map(msg => msg.content).join('\n');
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'ユーザーのメッセージから感情を分析して、happy, excited, neutral, sad, anxious, peaceful のいずれかの感情を返してください。'
        },
        {
          role: 'user',
          content: `以下のメッセージから感情を分析してください:\n${recentMessages}`
        }
      ],
      max_tokens: 10,
      temperature: 0.3
    });

    const mood = response.choices[0]?.message?.content?.trim().toLowerCase();
    const validMoods = ['happy', 'excited', 'neutral', 'sad', 'anxious', 'peaceful'];
    
    return validMoods.includes(mood) ? mood : 'neutral';

  } catch (error) {
    console.error('Mood Analysis Error:', error);
    return 'neutral';
  }
};

export default {
  generateChatResponse,
  generateDiaryEntry,
  analyzeMood
};