import React, { useState, useEffect } from 'react';
import { 
  BsBarChart, 
  BsPieChart, 
  BsCalendar3, 
  BsChatDots, 
  BsJournalText, 
  BsTags,
  BsGraphUp,
  BsHeart,
  BsClock
} from 'react-icons/bs';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { messageStorage, diaryStorage } from '../../utils/localStorage';

const StatsContainer = () => {
  const [stats, setStats] = useState({
    totalDiaries: 0,
    totalMessages: 0,
    avgWordsPerDiary: 0,
    moodDistribution: {},
    weeklyStats: [],
    tagRanking: [],
    dayOfWeekStats: {},
    recentTrend: []
  });

  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'week', 'month', 'all'

  useEffect(() => {
    calculateStats();
  }, [selectedPeriod]);

  const calculateStats = () => {
    let diaries = diaryStorage.getDiaryEntries();
    const messages = messageStorage.getMessages();
    
    // サンプル日記データを除外
    diaries = diaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      const year = diaryDate.getFullYear();
      const sampleIds = ['1', '2', '3'];
      return year >= 2025 && !sampleIds.includes(diary.diaryId);
    });
    
    // 期間フィルター
    const filteredDiaries = filterByPeriod(diaries);
    const filteredMessages = filterByPeriod(messages);

    // 基本統計
    const totalDiaries = filteredDiaries.length;
    const totalMessages = filteredMessages.length;
    const totalWords = filteredDiaries.reduce((sum, diary) => sum + (diary.wordCount || 0), 0);
    const avgWordsPerDiary = totalDiaries > 0 ? Math.round(totalWords / totalDiaries) : 0;

    // 感情分析
    const moodDistribution = calculateMoodDistribution(filteredDiaries);

    // 週別統計（過去8週間）
    const weeklyStats = calculateWeeklyStats(filteredDiaries);

    // タグランキング
    const tagRanking = calculateTagRanking(filteredDiaries);

    // 曜日別統計
    const dayOfWeekStats = calculateDayOfWeekStats(filteredDiaries);

    // トレンド分析
    const recentTrend = calculateRecentTrend(filteredDiaries);

    setStats({
      totalDiaries,
      totalMessages,
      avgWordsPerDiary,
      moodDistribution,
      weeklyStats,
      tagRanking,
      dayOfWeekStats,
      recentTrend
    });
  };

  const filterByPeriod = (data) => {
    if (selectedPeriod === 'all') return data;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (selectedPeriod === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    return data.filter(item => {
      const itemDate = new Date(item.date || item.timestamp);
      return itemDate >= cutoffDate;
    });
  };

  const calculateMoodDistribution = (diaries) => {
    const moodCount = {};
    diaries.forEach(diary => {
      if (diary.mood) {
        moodCount[diary.mood] = (moodCount[diary.mood] || 0) + 1;
      }
    });
    return moodCount;
  };

  const calculateWeeklyStats = (diaries) => {
    const weeks = [];
    const now = new Date();
    
    // 実際に日記がある週のみを対象にする
    if (diaries.length === 0) return weeks;
    
    // 日記がある期間を取得
    const diaryDates = diaries.map(d => new Date(d.date)).sort((a, b) => a - b);
    const firstDiaryDate = diaryDates[0];
    const lastDiaryDate = diaryDates[diaryDates.length - 1];
    
    // 最大8週間、但し実際の日記期間内のみ
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000), { locale: ja });
      const weekEnd = endOfWeek(weekStart, { locale: ja });
      
      // この週が日記期間内にある場合のみ処理
      if (weekEnd >= firstDiaryDate && weekStart <= lastDiaryDate) {
        const weekDiaries = diaries.filter(diary => {
          const diaryDate = parseISO(diary.date);
          return isWithinInterval(diaryDate, { start: weekStart, end: weekEnd });
        });

        // 日記がある週か、直近4週間は表示
        if (weekDiaries.length > 0 || i <= 3) {
          weeks.push({
            week: format(weekStart, 'M/d', { locale: ja }),
            count: weekDiaries.length,
            avgMood: calculateAvgMood(weekDiaries),
            totalWords: weekDiaries.reduce((sum, d) => sum + (d.wordCount || 0), 0)
          });
        }
      }
    }
    
    return weeks;
  };

  const calculateTagRanking = (diaries) => {
    const tagCount = {};
    diaries.forEach(diary => {
      if (diary.tags && Array.isArray(diary.tags)) {
        diary.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  };

  const calculateDayOfWeekStats = (diaries) => {
    const dayStats = {};
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    
    days.forEach(day => {
      dayStats[day] = { count: 0, totalWords: 0, avgMood: 0 };
    });

    diaries.forEach(diary => {
      const dayOfWeek = days[parseISO(diary.date).getDay()];
      dayStats[dayOfWeek].count++;
      dayStats[dayOfWeek].totalWords += (diary.wordCount || 0);
    });

    return dayStats;
  };

  const calculateRecentTrend = (diaries) => {
    const sortedDiaries = diaries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
    
    return sortedDiaries.map(diary => ({
      date: format(parseISO(diary.date), 'M/d', { locale: ja }),
      words: diary.wordCount || 0,
      mood: diary.mood
    }));
  };

  const calculateAvgMood = (diaries) => {
    if (diaries.length === 0) return 0;
    
    const moodValues = {
      'sad': 1,
      'anxious': 2,
      'neutral': 3,
      'happy': 4,
      'excited': 5,
      'peaceful': 4
    };

    const avgValue = diaries.reduce((sum, diary) => {
      return sum + (moodValues[diary.mood] || 3);
    }, 0) / diaries.length;

    return Math.round(avgValue);
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      excited: '🤩',
      neutral: '😐',
      sad: '😢',
      anxious: '😰',
      peaceful: '😌'
    };
    return emojis[mood] || '📝';
  };

  const getMoodText = (mood) => {
    const texts = {
      happy: '幸せ',
      excited: 'わくわく',
      neutral: '普通',
      sad: '悲しい',
      anxious: '不安',
      peaceful: '穏やか'
    };
    return texts[mood] || mood;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900', 
        text: 'text-purple-600 dark:text-purple-400'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-600 dark:text-orange-400'
      }
    };

    const colorClass = colorClasses[color] || colorClasses.blue;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass.bg}`}>
            <Icon className={`w-6 h-6 ${colorClass.text}`} />
          </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">統計・分析</h2>
          
          {/* 期間選択 */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">全期間</option>
              <option value="month">過去30日</option>
              <option value="week">過去7日</option>
            </select>
          </div>
        </div>

        {/* 概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BsJournalText}
            title="総日記数"
            value={stats.totalDiaries}
            subtitle="件の日記"
            color="purple"
          />
          <StatCard
            icon={BsChatDots}
            title="総メッセージ数"
            value={stats.totalMessages}
            subtitle="回の会話"
            color="blue"
          />
          <StatCard
            icon={BsBarChart}
            title="平均文字数"
            value={stats.avgWordsPerDiary}
            subtitle="文字/日記"
            color="green"
          />
          <StatCard
            icon={BsGraphUp}
            title="継続日数"
            value={stats.recentTrend.length}
            subtitle="日連続"
            color="orange"
          />
        </div>

        {/* 感情分析 */}
        {Object.keys(stats.moodDistribution).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BsHeart className="mr-2 text-pink-500" />
              感情分析
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(stats.moodDistribution).map(([mood, count]) => (
                  <div key={mood} className="text-center">
                    <div className="text-2xl mb-2">{getMoodEmoji(mood)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{getMoodText(mood)}</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{count}回</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((count / stats.totalDiaries) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 週別トレンド */}
        {stats.weeklyStats.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BsCalendar3 className="mr-2 text-blue-500" />
              週別トレンド
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-end justify-between h-32 space-x-2">
                {stats.weeklyStats.map((week, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-blue-500 rounded-t w-full min-h-2 transition-all hover:bg-blue-600"
                      style={{
                        height: `${Math.max((week.count / Math.max(...stats.weeklyStats.map(w => w.count))) * 100, 8)}%`
                      }}
                      title={`${week.count}件の日記`}
                    ></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{week.week}</div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{week.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* タグランキング */}
        {stats.tagRanking.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BsTags className="mr-2 text-green-500" />
              人気タグ
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="space-y-3">
                {stats.tagRanking.map(({ tag, count }, index) => (
                  <div key={tag} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                        #{tag}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {count}回
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 曜日別統計 */}
        {Object.keys(stats.dayOfWeekStats).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BsClock className="mr-2 text-orange-500" />
              曜日別傾向
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2 text-center">
                {Object.entries(stats.dayOfWeekStats).map(([day, data]) => (
                  <div key={day} className="p-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{day}</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{data.count}</div>
                    <div className="text-xs text-gray-500">
                      {data.count > 0 ? Math.round(data.totalWords / data.count) : 0}文字
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stats.totalDiaries === 0 && (
          <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BsBarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">統計データがありません</p>
              <p className="text-sm">日記を作成すると、ここに分析結果が表示されます</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsContainer;