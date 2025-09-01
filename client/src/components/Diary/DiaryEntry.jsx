import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BsCalendar, BsClock, BsChat, BsArrowLeft } from 'react-icons/bs';

const DiaryEntry = ({ entry, onBack }) => {
  if (!entry) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">日記を選択してください</p>
        </div>
      </div>
    );
  }

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      happy: '😊',
      excited: '🤩', 
      neutral: '😐',
      sad: '😢',
      anxious: '😰',
      peaceful: '😌'
    };
    return moodEmojis[mood] || '📝';
  };

  const getMoodText = (mood) => {
    const moodTexts = {
      happy: '幸せ',
      excited: 'わくわく', 
      neutral: '普通',
      sad: '悲しい',
      anxious: '不安',
      peaceful: '穏やか'
    };
    return moodTexts[mood] || '記録';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="mr-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors md:hidden flex items-center"
        >
          <BsArrowLeft className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-600">カレンダー</span>
        </button>
        
        <div className="flex-1">
          <div className="flex items-center mb-2 md:hidden">
            <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
              📖 日記詳細
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {entry.title}
          </h1>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
            <div className="flex items-center">
              <BsCalendar className="w-4 h-4 mr-1" />
              {format(new Date(entry.date), 'yyyy年M月d日(E)', { locale: ja })}
            </div>
            <div className="flex items-center">
              <BsClock className="w-4 h-4 mr-1" />
              {format(new Date(entry.createdAt), 'HH:mm', { locale: ja })}
            </div>
            <div className="flex items-center">
              <span className="mr-1">{getMoodEmoji(entry.mood)}</span>
              {getMoodText(entry.mood)}
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 日記本文 */}
        <div className="prose max-w-none mb-8">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {entry.summary}
          </div>
        </div>

        {/* ハイライト */}
        {entry.highlights && entry.highlights.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">✨</span>
              今日のハイライト
            </h3>
            <ul className="space-y-2">
              {entry.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* タグ */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🏷️</span>
              タグ
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <BsChat className="mr-2" />
            詳細情報
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">文字数:</span>
              <span className="ml-2 font-medium">{entry.wordCount}文字</span>
            </div>
            <div>
              <span className="text-gray-500">作成日:</span>
              <span className="ml-2 font-medium">
                {format(new Date(entry.createdAt), 'M/d HH:mm', { locale: ja })}
              </span>
            </div>
            {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
              <div className="col-span-2">
                <span className="text-gray-500">更新日:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(entry.updatedAt), 'M/d HH:mm', { locale: ja })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntry;