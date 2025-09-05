import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/chatService';
import { FaUser, FaBrain, FaHeart, FaPen, FaChartBar, FaTrash, FaSync } from 'react-icons/fa';

export default function ProfileSection() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // プロファイル読み込み
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [profileResponse, statsResponse] = await Promise.all([
        profileService.getProfile(),
        profileService.getProfileStats()
      ]);

      if (profileResponse.success) {
        setProfile(profileResponse.data);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      setError('プロファイルの読み込みに失敗しました');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // プロファイルリセット
  const handleResetProfile = async () => {
    if (!confirm('学習されたプロファイルをリセットしますか？この操作は元に戻せません。')) {
      return;
    }

    try {
      const response = await profileService.resetProfile();
      if (response.success) {
        await loadProfileData(); // 再読み込み
        alert('プロファイルをリセットしました');
      }
    } catch (err) {
      setError('プロファイルのリセットに失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={loadProfileData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'High': return '🎯';
      case 'Medium': return '🔍';
      default: return '🌱';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaUser className="text-purple-500 mr-3" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">あなたのAIプロファイル</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            {showDetails ? '簡単表示' : '詳細表示'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          AIがあなたとの会話から学習した性格や興味を表示しています
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* 学習統計 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.conversationCount}</div>
              <div className="text-sm text-blue-800">会話数</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.learnedTraits}</div>
              <div className="text-sm text-green-800">性格特徴</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.learnedInterests}</div>
              <div className="text-sm text-purple-800">興味・関心</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(stats.personalityConfidence)}`}>
                {getConfidenceIcon(stats.personalityConfidence)} {stats.personalityConfidence}
              </div>
              <div className="text-sm text-gray-600 mt-1">学習度</div>
            </div>
          </div>
        )}

        {/* 性格特徴 */}
        {profile && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-3">
                <FaBrain className="text-blue-500 mr-2" />
                <h4 className="font-semibold text-gray-800">学習された性格特徴</h4>
              </div>
              {profile.personality.traits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.personality.traits.map((trait, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {trait}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">まだ学習していません。会話を続けると特徴が見えてきます。</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-3">
                <FaHeart className="text-red-500 mr-2" />
                <h4 className="font-semibold text-gray-800">興味・関心</h4>
              </div>
              {profile.personality.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.personality.interests.map((interest, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">会話を通じて興味のあることを教えてください。</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-3">
                <FaPen className="text-green-500 mr-2" />
                <h4 className="font-semibold text-gray-800">文体の傾向</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">トーン:</span>
                  <span className="ml-2 text-gray-600">
                    {profile.writingStyle.tone === 'emotional' ? '感情豊か' :
                     profile.writingStyle.tone === 'analytical' ? '分析的' :
                     profile.writingStyle.tone === 'poetic' ? '詩的' : '学習中'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">長さ:</span>
                  <span className="ml-2 text-gray-600">
                    {profile.writingStyle.length === 'short' ? '簡潔' :
                     profile.writingStyle.length === 'long' ? '詳細' : '普通'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">構造:</span>
                  <span className="ml-2 text-gray-600">
                    {profile.writingStyle.structure === 'narrative' ? '物語調' :
                     profile.writingStyle.structure === 'bullet' ? '箇条書き' : '振り返り'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細情報 */}
        {showDetails && stats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaChartBar className="mr-2" />
              詳細統計
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">最終更新:</span>
                <span className="text-gray-800">{new Date(stats.lastUpdated).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">文体学習度:</span>
                <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(stats.writingStyleConfidence)}`}>
                  {stats.writingStyleConfidence}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* アクション */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={loadProfileData}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaSync className="mr-2" size={14} />
            更新
          </button>
          <button
            onClick={handleResetProfile}
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaTrash className="mr-2" size={14} />
            プロファイルリセット
          </button>
        </div>
      </div>
    </div>
  );
}