// ユーザープロファイル管理API
import express from 'express';
import { userProfileService, conversationMemory } from '../services/memoryService.js';

const router = express.Router();

// プロファイル取得
router.get('/', async (req, res) => {
  try {
    const profile = await userProfileService.loadProfile();
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'プロファイルの取得に失敗しました'
    });
  }
});

// プロファイル統計情報
router.get('/stats', async (req, res) => {
  try {
    const profile = await userProfileService.loadProfile();
    
    const stats = {
      conversationCount: profile.learningData.conversationCount,
      learnedTraits: profile.personality.traits.length,
      learnedInterests: profile.personality.interests.length,
      lastUpdated: profile.learningData.lastUpdated,
      writingStyleConfidence: profile.writingStyle.tone !== 'unknown' ? 'High' : 'Learning',
      personalityConfidence: profile.personality.traits.length > 2 ? 'High' : 
                           profile.personality.traits.length > 0 ? 'Medium' : 'Learning'
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(500).json({
      success: false,
      error: '統計情報の取得に失敗しました'
    });
  }
});

// プロファイルリセット
router.post('/reset', async (req, res) => {
  try {
    // デフォルトプロファイルで上書き
    const defaultProfile = {
      personality: {
        traits: [],
        interests: [],
        communicationStyle: 'unknown',
        emotionalTendency: 'neutral'
      },
      writingStyle: {
        tone: 'unknown',
        length: 'medium',
        structure: 'narrative'
      },
      preferences: {
        topicsFocus: [],
        timeReflection: 'evening',
        moodTracking: true
      },
      learningData: {
        conversationCount: 0,
        lastUpdated: new Date().toISOString(),
        memoryVersion: '1.0'
      }
    };
    
    await userProfileService.saveProfile(defaultProfile);
    
    res.json({
      success: true,
      message: 'プロファイルをリセットしました'
    });
  } catch (error) {
    console.error('Profile reset error:', error);
    res.status(500).json({
      success: false,
      error: 'プロファイルのリセットに失敗しました'
    });
  }
});

// 学習した記憶の履歴
router.get('/memories', async (req, res) => {
  try {
    const memories = await conversationMemory.searchRelevantMemories('', 20); // 最新20件
    
    res.json({
      success: true,
      data: memories.map(memory => ({
        id: memory.id,
        date: memory.date,
        importance: memory.importance,
        summary: memory.summary || '会話記録',
        keywords: memory.keywords || [],
        emotional_context: memory.emotional_context
      }))
    });
  } catch (error) {
    console.error('Memories fetch error:', error);
    res.status(500).json({
      success: false,
      error: '記憶の取得に失敗しました'
    });
  }
});

export default router;