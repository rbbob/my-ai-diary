import React from 'react';
import { exportToCSV, exportToPDF, exportToDOCX } from '../../utils/exportUtils';

const DiaryList = ({ diaries, onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      '最高': '😄',
      '良い': '😊',
      'まあまあ': '😐',
      '悪い': '😞',
      '最悪': '😢'
    };
    return moodMap[mood] || '😐';
  };

  const getWeatherEmoji = (weather) => {
    if (!weather) return null;
    const weatherMap = {
      '晴れ': '☀️',
      '曇り': '☁️',
      '雨': '🌧️',
      '雪': '❄️',
      '台風': '🌪️'
    };
    return weatherMap[weather] || '🌤️';
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (diaries.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          まだ日記がありません
        </h3>
        <p className="text-gray-600 mb-6 text-lg">
          AIとチャットしてから、📅<strong>カレンダー表示</strong>に切り替えて<br/>
          日付をクリックすると日記が自動生成されます ✨
        </p>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            💡 <strong>使い方：</strong><br/>
            1. まずAIとチャットで今日の出来事を話す<br/>
            2. カレンダー表示タブをクリック<br/>
            3. 日付をクリックして日記を自動生成
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            📚 日記一覧 ({diaries.length}件)
          </h3>
          <p className="text-sm text-gray-500">
            クリックして詳細を確認・編集できます
          </p>
        </div>
        
        {diaries.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(diaries)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
              title="CSVファイルでエクスポート"
            >
              <span className="mr-1">📊</span>
              CSV
            </button>
            <button
              onClick={() => exportToPDF(diaries)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
              title="PDFファイルでエクスポート"
            >
              <span className="mr-1">📄</span>
              PDF
            </button>
            <button
              onClick={() => exportToDOCX(diaries)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
              title="Word文書（DOCX）でエクスポート"
            >
              <span className="mr-1">📝</span>
              Word
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {diaries.map((diary) => (
          <div
            key={diary.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
            onClick={() => onEdit(diary)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-800">
                    {diary.title || '無題の日記'}
                  </h4>
                  {diary.generated && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      🤖 AI生成
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                  <span>📅 {formatDate(diary.date)}</span>
                  <span>{getMoodEmoji(diary.mood)} {diary.mood}</span>
                  {diary.weather && (
                    <span>{getWeatherEmoji(diary.weather)} {diary.weather}</span>
                  )}
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  {truncateContent(diary.content)}
                </p>
                
                {diary.tags && diary.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {diary.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(diary);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="編集"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(diary.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {diaries.length > 5 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            全 {diaries.length} 件の日記があります
          </p>
        </div>
      )}
    </div>
  );
};

export default DiaryList;