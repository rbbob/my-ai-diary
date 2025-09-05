import OpenAI from 'openai';
import dotenv from 'dotenv';
import { userProfileService, conversationMemory, promptEnhancer } from './memoryService.js';

// 環境変数を読み込み
dotenv.config();

// OpenAI クライアントの初期化（APIキーがない場合はnull）
let openai = null;

console.log('Debug: OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('Debug: API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : 'N/A');

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI API initialized successfully');
} else {
  console.log('⚠️ OpenAI API key not configured - using fallback mode');
  console.log('  - Key present:', !!process.env.OPENAI_API_KEY);
  console.log('  - Key not placeholder:', process.env.OPENAI_API_KEY !== 'your-openai-api-key-here');
  console.log('  - Key starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));
}

// チャット応答生成
export const generateChatResponse = async (messages, userSettings = {}) => {
  try {
    // APIキーが設定されていない場合はフォールバック応答
    if (!openai) {
      const { userName = 'ユーザー' } = userSettings;
      
      // メッセージ内容に基づいた文脈理解応答
      const lastMessage = messages[messages.length - 1]?.content || '';
      const lowerMessage = lastMessage.toLowerCase();
      
      console.log('Debug - Last message:', lastMessage);
      console.log('Debug - Lower message:', lowerMessage);
      console.log('Debug - Contains 誰:', lowerMessage.includes('誰'));
      
      let response = '';
      
      // 挨拶の判定
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('おはよう') || lowerMessage.includes('こんばんは') || lowerMessage.includes('hello')) {
        response = `${userName}さん、こんにちは！今日はいかがお過ごしですか？`;
      }
      // 自己紹介の要求
      else if (lowerMessage.includes('誰') || lowerMessage.includes('何者') || lowerMessage.includes('名前')) {
        response = `私は${userName}さんの日記パートナーのAIアシスタントです。毎日の会話を通じて、素敵な日記を作成するお手伝いをしています。`;
      }
      // 天気について
      else if (lowerMessage.includes('天気') || lowerMessage.includes('暑い') || lowerMessage.includes('寒い') || lowerMessage.includes('雨')) {
        response = 'そうですね。天気によって気分も変わりますよね。今日はどんな気持ちで過ごされましたか？';
      }
      // 感情表現
      else if (lowerMessage.includes('嬉しい') || lowerMessage.includes('楽しい') || lowerMessage.includes('よかった')) {
        response = 'それは素晴らしいですね！そのときのお気持ちをもう少し詳しく聞かせてください。';
      }
      else if (lowerMessage.includes('悲しい') || lowerMessage.includes('辛い') || lowerMessage.includes('大変')) {
        response = 'それは大変でしたね。どんなことがあったのか、お話しできる範囲で教えてください。';
      }
      // 活動・予定について
      else if (lowerMessage.includes('泳ぎ') || lowerMessage.includes('プール') || lowerMessage.includes('運動') || lowerMessage.includes('スポーツ')) {
        response = '泳ぎに行かれるんですね！それは素晴らしい運動ですね。楽しみにしていらっしゃいますか？';
      }
      else if (lowerMessage.includes('映画') || lowerMessage.includes('本') || lowerMessage.includes('読書')) {
        response = 'いいですね！どんな作品ですか？楽しみにしていらっしゃいますか？';
      }
      else if (lowerMessage.includes('仕事') || lowerMessage.includes('会社') || lowerMessage.includes('職場')) {
        response = 'お仕事のお話ですね。今日はどんな一日でしたか？';
      }
      else if (lowerMessage.includes('友達') || lowerMessage.includes('友人') || lowerMessage.includes('家族')) {
        response = '素敵な時間を過ごされたようですね。どんなお話をされたのですか？';
      }
      // 食べ物について
      else if (lowerMessage.includes('食べ') || lowerMessage.includes('料理') || lowerMessage.includes('美味しい') || lowerMessage.includes('ランチ') || lowerMessage.includes('夕食')) {
        response = '美味しそうですね！どんなお味でしたか？';
      }
      // 疲れについて
      else if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        response = 'お疲れさまです。今日はどんなことで忙しかったのですか？';
      }
      // 質問形式
      else if (lowerMessage.includes('？') || lowerMessage.includes('?')) {
        response = 'いい質問ですね。それについて、どんなふうにお考えですか？';
      }
      // 短い返事（「あ」「うん」など）
      else if (lastMessage.length <= 2) {
        response = '何かお話ししたいことがあれば、遠慮なくどうぞ。どんな小さなことでも構いません。';
      }
      // デフォルト応答
      else {
        const generalResponses = [
          'そうですね。それについてもう少し詳しく教えてください。',
          'なるほど。そのときはどんなお気持ちでしたか？',
          '興味深いお話ですね。どんな体験だったのでしょうか？'
        ];
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      }
      
      return {
        content: response,
        fallback: true
      };
    }
    const { userName = 'ユーザー', aiName = 'アシスタント', aiPersonality = 'friendly' } = userSettings;
    
    // OpenAI Plus強化: 詳細な性格設定とメモリー活用
    const personalityPrompts = {
      friendly: `あなたは${aiName}という名前の親しみやすいAIパートナーです。${userName}さんの長年の友人として、これまでの会話や性格を覚えています。温かく親しみやすい口調で、${userName}さんの気持ちに寄り添って会話してください。時々絵文字も使って楽しい雰囲気を作りましょう。`,
      professional: `あなたは${aiName}という名前の信頼できるAIアドバイザーです。${userName}さんとの長いお付き合いを通じて、その人となりを理解しています。常に敬語を使い、礼儀正しく、かつ深い理解に基づいたアドバイスを提供してください。`,
      casual: `あなたは${aiName}という名前の気の置けないAI友達です。${userName}さんとは昔からの友達のような関係で、お互いのことをよく知っています。気軽にくだけた口調で、まるで幼馴染のように自然に会話してください。`,
      supportive: `あなたは${aiName}という名前の心の支えとなるAIカウンセラーです。${userName}さんの過去の悩みや成長を見守ってきました。いつも励まし、共感し、${userName}さんの強みを思い出させる応援をしてください。`
    };

    // OpenAI Plus: 学習されたプロファイルを活用した個人化プロンプト
    const basePrompt = personalityPrompts[aiPersonality] + `\n\nあなたはDaily Companionの心を持ったAIパートナーです。今日の会話は後で素敵な日記になります。${userName}さんの感情や体験を丁寧に聞き、心に残る瞬間を引き出してください。返答は自然で、2-4文程度で答えてください。`;
    
    const enhancedPrompt = await promptEnhancer.generatePersonalizedPrompt(basePrompt, userSettings);
    
    const systemMessage = {
      role: 'system',
      content: enhancedPrompt
    };

    // メッセージ履歴を整形（最新10件まで）
    const formattedMessages = [
      systemMessage,
      ...messages.slice(-10).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    // GPT-4o-miniによる高品質チャット応答
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // より安定したモデル
      messages: formattedMessages,
      max_tokens: 400, // より詳細な応答
      temperature: 0.8, // より創造的で人間らしい応答
      presence_penalty: 0.2,
      frequency_penalty: 0.2,
      top_p: 0.9 // より自然な応答生成
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('OpenAI API returned empty response');
    }

    // OpenAI Plus: 会話から学習してプロファイル更新
    try {
      await userProfileService.learnFromConversation(messages, userSettings);
      await conversationMemory.saveImportantConversation([...messages, { role: 'assistant', content: aiResponse }], 'medium');
    } catch (error) {
      console.error('Profile learning error:', error);
      // 学習エラーでも会話は継続
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
export const generateDiaryEntry = async (messages, userSettings = {}, targetDate = null) => {
  try {
    console.log('Diary generation - OpenAI available:', !!openai);
    console.log('Target date for diary:', targetDate);
    
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
    
    // 対象日付を設定（指定されない場合は今日）
    const targetDateForDiary = targetDate || new Date().toLocaleDateString('ja-JP', { 
      timeZone: 'Asia/Tokyo',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-'); // YYYY-MM-DD形式
    
    // 今日の日付も取得（メッセージフィルタリング用）
    const today = new Date().toLocaleDateString('ja-JP', { 
      timeZone: 'Asia/Tokyo',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-'); // YYYY-MM-DD形式
    
    console.log('=== DATE CHECK ===');
    console.log('Target date for diary:', targetDateForDiary);
    console.log('Today (JST):', today);
    console.log('===================');
    
    // 対象日付のメッセージのみフィルタリング（タイムスタンプ付きメッセージの場合）
    const targetDateMessages = messages.filter(msg => {
      if (msg.timestamp) {
        const msgDate = new Date(msg.timestamp).toLocaleDateString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, '-');
        return msgDate === targetDateForDiary;
      }
      // タイムスタンプがない場合：今日の日記なら含める（後方互換性）
      return targetDateForDiary === today;
    });
    
    console.log('=== MESSAGE FILTERING ===');
    console.log('Total messages:', messages.length);
    console.log(`Messages for ${targetDateForDiary}:`, targetDateMessages.length);
    console.log('============================');
    
    // 対象日付のユーザーメッセージのみを使用
    const userMessagesFromTargetDate = targetDateMessages.filter(msg => msg.role === 'user');
    
    if (userMessagesFromTargetDate.length === 0) {
      const dateStr = targetDateForDiary === today ? '今日' : targetDateForDiary;
      throw new Error(`${dateStr}のチャット履歴がありません。その日に何か話してから日記を生成してください。`);
    }
    
    const conversationText = userMessagesFromTargetDate
      .map(msg => msg.content)
      .join('\n');

    console.log('=== DIARY GENERATION DEBUG ===');
    console.log('Total messages:', messages.length);
    console.log('User messages count:', messages.filter(msg => msg.role === 'user').length);
    console.log(`User messages count for ${targetDateForDiary}:`, userMessagesFromTargetDate.length);
    console.log(`Conversation text for ${targetDateForDiary}:`, conversationText);
    console.log('================================');

    if (!conversationText.trim()) {
      throw new Error('No user messages found for diary generation');
    }

    // シンプルで動的なプロンプト生成（キャッシュされたプロファイルに依存しない）
    const todayDisplay = new Date().toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    });

    // 最新の会話から感情やトピックを動的に分析
    const recentMessages = messages.slice(-10); // 最新10件のメッセージ
    console.log('Recent messages for context:', recentMessages.map(m => `${m.role}: ${m.content}`));

    const currentTime = new Date().toLocaleString('ja-JP');
    const uniqueTimestamp = Date.now();
    // 対象日付の表示用フォーマット
    const targetDateDisplay = new Date(targetDateForDiary).toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    });

    const diaryPrompt = `【重要】${targetDateForDiary}（${targetDateDisplay}）の${userName}さんの会話内容「のみ」から、その日の日記を生成してください。
[生成時刻: ${currentTime}]
[生成ID: ${uniqueTimestamp}]

## ${targetDateForDiary}（${targetDateDisplay}）の会話内容:
${conversationText}

## 指示:
- ${userName}さんの${targetDateForDiary}の実際の体験や気持ちに基づいて日記を書いてください
- 会話に出てきた具体的な出来事、場所、人、感情を反映してください  
- 一人称（私）で、自然で親しみやすい文体で書いてください
- 200-400文字程度の読みやすい日記形式にしてください
- ${targetDateForDiary}に話された内容から離れないでください
- 必ず${targetDateForDiary}の会話内容に基づいた日記を生成してください

以下のJSON形式で返してください:
{
  "title": "${targetDateForDiary}の内容を反映した日記タイトル（15文字以内）",
  "summary": "${targetDateForDiary}の会話内容に基づいた日記本文",
  "mood": "happy|excited|neutral|sad|anxious|peaceful のいずれか",
  "highlights": ["${targetDateForDiary}に話された具体的な出来事1", "出来事2", "出来事3"],
  "tags": ["会話に出たキーワード1", "キーワード2", "キーワード3"]
}`;

    // GPT-4o-miniによる日記生成（JSON対応）
    const randomSeed = Math.floor(Math.random() * 1000000) + uniqueTimestamp;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // JSON response_formatをサポートするモデル
      messages: [
        {
          role: 'system',
          content: `あなたは${userName}さんの日記作成アシスタントです。

【重要な制約事項】:
1. ${targetDateForDiary}（${targetDateDisplay}）の会話内容のみを使って日記を作成してください
2. ${targetDateForDiary}以外の古い情報や内容は一切使用しないでください
3. 提供された「${targetDateForDiary}の会話内容」以外の情報は使わないでください
4. ${targetDateForDiary}の実際の体験や感情のみを反映してください
5. 必ずJSON形式で返答してください

[生成ID: ${uniqueTimestamp}]
[対象日: ${targetDateForDiary}（${targetDateDisplay}）]`
        },
        {
          role: 'user',
          content: diaryPrompt
        }
      ],
      max_tokens: 800, // より詳細な日記生成
      temperature: 0.95, // より創造的で個性的な文章（キャッシュ回避）
      top_p: 0.95,
      presence_penalty: 0.3, // 新しい内容を促進
      frequency_penalty: 0.3, // 繰り返しを避ける
      response_format: { type: 'json_object' },
      // より確実なランダムシード
      seed: randomSeed
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('OpenAI API returned empty response for diary generation');
    }

    console.log('=== DIARY GENERATION RESULT ===');
    console.log('Generated Response:', aiResponse);
    console.log('===============================');
    
    const diaryData = JSON.parse(aiResponse);
    
    // 必要なフィールドの検証
    if (!diaryData.title || !diaryData.summary) {
      throw new Error('Invalid diary data structure');
    }

    console.log('=== FINAL DIARY DATA ===');
    console.log('Title:', diaryData.title);
    console.log('Summary length:', diaryData.summary.length);
    console.log('Mood:', diaryData.mood);
    console.log('========================');

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
    
    // GPT-4o-miniによる感情分析
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // より安定したモデル
      messages: [
        {
          role: 'system',
          content: 'あなたは感情分析の専門家です。ユーザーのメッセージから微細な感情の変化を読み取り、happy, excited, neutral, sad, anxious, peaceful のいずれかで最も適切な感情を返してください。'
        },
        {
          role: 'user',
          content: `以下のメッセージから感情を分析してください:\n${recentMessages}`
        }
      ],
      max_tokens: 20,
      temperature: 0.2 // より一貫した分析
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