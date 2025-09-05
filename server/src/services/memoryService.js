// OpenAI Plus プラン活用：長期記憶・性格学習システム
import fs from 'fs/promises';
import path from 'path';

// メモリーデータの保存先
const MEMORY_DIR = path.join(process.cwd(), 'data', 'memory');
const USER_PROFILE_FILE = path.join(MEMORY_DIR, 'user_profile.json');
const CONVERSATION_MEMORY_FILE = path.join(MEMORY_DIR, 'conversation_memory.json');

// ディレクトリ作成
async function ensureMemoryDirectory() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch (error) {
    console.log('Memory directory already exists or created');
  }
}

// ユーザープロファイル管理
export const userProfileService = {
  // プロファイル読み込み
  async loadProfile() {
    try {
      await ensureMemoryDirectory();
      const data = await fs.readFile(USER_PROFILE_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // 初回時はデフォルトプロファイル
      return {
        personality: {
          traits: [], // ['内向的', '創造的', '分析的']
          interests: [], // ['読書', '映画', 'プログラミング']
          communicationStyle: 'unknown', // 'formal', 'casual', 'friendly'
          emotionalTendency: 'neutral' // 'positive', 'analytical', 'sensitive'
        },
        writingStyle: {
          tone: 'unknown', // 'poetic', 'factual', 'emotional'
          length: 'medium', // 'short', 'medium', 'long'
          structure: 'narrative' // 'bullet', 'narrative', 'reflective'
        },
        preferences: {
          topicsFocus: [], // 学習した興味のあるトピック
          timeReflection: 'evening', // 振り返りの好みの時間
          moodTracking: true
        },
        learningData: {
          conversationCount: 0,
          lastUpdated: new Date().toISOString(),
          memoryVersion: '1.0'
        }
      };
    }
  },

  // プロファイル保存
  async saveProfile(profile) {
    try {
      await ensureMemoryDirectory();
      profile.learningData.lastUpdated = new Date().toISOString();
      await fs.writeFile(USER_PROFILE_FILE, JSON.stringify(profile, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save user profile:', error);
      return false;
    }
  },

  // 会話からプロファイル学習
  async learnFromConversation(messages, userSettings) {
    const profile = await this.loadProfile();
    
    // 会話回数カウント
    profile.learningData.conversationCount += 1;

    // 性格分析（GPT-4による高度分析）
    await this.analyzePersonality(messages, profile);

    // 興味・関心の抽出
    await this.extractInterests(messages, profile);

    // 文体分析
    await this.analyzeWritingStyle(messages, profile);

    // プロファイル保存
    await this.saveProfile(profile);
    
    return profile;
  },

  // GPT-4による性格分析
  async analyzePersonality(messages, profile) {
    // 実装: メッセージから性格特徴を抽出
    const userMessages = messages.filter(m => m.role === 'user').slice(-10);
    
    if (userMessages.length > 0) {
      // 簡易版：キーワードベース分析（GPT-4連携は後で実装）
      const text = userMessages.map(m => m.content).join(' ');
      
      // 感情的傾向の検出
      if (text.includes('嬉しい') || text.includes('楽しい') || text.includes('良かった')) {
        if (!profile.personality.traits.includes('ポジティブ')) {
          profile.personality.traits.push('ポジティブ');
        }
      }
      
      // 分析的傾向
      if (text.includes('なぜ') || text.includes('どうして') || text.includes('分析')) {
        if (!profile.personality.traits.includes('分析的')) {
          profile.personality.traits.push('分析的');
        }
      }
    }
  },

  // 興味・関心の抽出
  async extractInterests(messages, profile) {
    const userMessages = messages.filter(m => m.role === 'user').slice(-5);
    const text = userMessages.map(m => m.content).join(' ');
    
    // 一般的な興味カテゴリの検出
    const interestKeywords = {
      '読書': ['本', '小説', '読書', '作家', '物語'],
      '映画': ['映画', '動画', '映像', 'ドラマ', 'アニメ'],
      '音楽': ['音楽', '歌', 'バンド', 'コンサート'],
      '料理': ['料理', '食事', '食べ物', 'レシピ', '調理'],
      '旅行': ['旅行', '観光', '旅', 'スポット'],
      '仕事': ['仕事', '会社', 'プロジェクト', '業務'],
      '運動': ['運動', 'スポーツ', 'ジム', 'ランニング'],
      '学習': ['勉強', '学習', '学ぶ', '習い事']
    };

    for (const [interest, keywords] of Object.entries(interestKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        if (!profile.personality.interests.includes(interest)) {
          profile.personality.interests.push(interest);
        }
      }
    }
  },

  // 文体分析
  async analyzeWritingStyle(messages, profile) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length > 0) {
      const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
      
      // 文章の長さ傾向
      if (avgLength < 50) {
        profile.writingStyle.length = 'short';
      } else if (avgLength > 150) {
        profile.writingStyle.length = 'long';
      } else {
        profile.writingStyle.length = 'medium';
      }

      // 感情表現の検出
      const text = userMessages.map(m => m.content).join('');
      const emotionalWords = ['嬉しい', '悲しい', '感動', '驚き', '怒り', '楽しい'];
      const emotionalCount = emotionalWords.filter(word => text.includes(word)).length;
      
      if (emotionalCount > userMessages.length * 0.3) {
        profile.writingStyle.tone = 'emotional';
      } else if (text.includes('なぜなら') || text.includes('したがって')) {
        profile.writingStyle.tone = 'analytical';
      }
    }
  }
};

// 会話記憶システム
export const conversationMemory = {
  // 重要な会話の保存
  async saveImportantConversation(messages, importance = 'medium') {
    try {
      await ensureMemoryDirectory();
      
      let memoryData = [];
      try {
        const data = await fs.readFile(CONVERSATION_MEMORY_FILE, 'utf8');
        memoryData = JSON.parse(data);
      } catch {
        // 新規作成
      }

      const memory = {
        id: Date.now(),
        date: new Date().toISOString(),
        messages: messages.slice(-10), // 最近10件
        importance, // 'high', 'medium', 'low'
        summary: '', // 後でGPT-4で生成
        keywords: [], // 後でGPT-4で抽出
        emotional_context: 'neutral'
      };

      memoryData.push(memory);
      
      // 古い記憶の整理（最新100件まで）
      if (memoryData.length > 100) {
        memoryData = memoryData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 100);
      }

      await fs.writeFile(CONVERSATION_MEMORY_FILE, JSON.stringify(memoryData, null, 2));
      return memory.id;
    } catch (error) {
      console.error('Failed to save conversation memory:', error);
      return null;
    }
  },

  // 関連記憶の検索
  async searchRelevantMemories(query, limit = 5) {
    try {
      const data = await fs.readFile(CONVERSATION_MEMORY_FILE, 'utf8');
      const memories = JSON.parse(data);
      
      // 簡易検索（後でベクトル検索に拡張可能）
      const relevant = memories.filter(memory => 
        memory.summary.includes(query) || 
        memory.keywords.some(keyword => query.includes(keyword))
      );

      return relevant.slice(0, limit);
    } catch (error) {
      return [];
    }
  }
};

// プロンプト強化システム
export const promptEnhancer = {
  // ユーザープロファイルベースのプロンプト生成
  async generatePersonalizedPrompt(basePrompt, userSettings) {
    const profile = await userProfileService.loadProfile();
    
    // 性格特徴の組み込み
    let personalityDesc = '';
    if (profile.personality.traits.length > 0) {
      personalityDesc = `${userSettings.userName}さんは${profile.personality.traits.join('、')}な性格です。`;
    }

    // 興味・関心の組み込み
    let interestsDesc = '';
    if (profile.personality.interests.length > 0) {
      interestsDesc = `特に${profile.personality.interests.join('、')}に興味を持っています。`;
    }

    // 文体の組み込み
    let styleDesc = '';
    if (profile.writingStyle.tone !== 'unknown') {
      styleDesc = `文章は${profile.writingStyle.tone === 'emotional' ? '感情豊かに' : 
                    profile.writingStyle.tone === 'analytical' ? '分析的に' : '自然に'}書く傾向があります。`;
    }

    const enhancedPrompt = `${basePrompt}

【${userSettings.userName}さんの特徴】
${personalityDesc}
${interestsDesc}
${styleDesc}

この特徴を理解して、${userSettings.userName}さんらしい自然な対話を心がけてください。`;

    return enhancedPrompt;
  }
};

export default {
  userProfileService,
  conversationMemory,
  promptEnhancer
};