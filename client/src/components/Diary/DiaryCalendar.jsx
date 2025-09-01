import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const DiaryCalendar = ({ diaryEntries = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // カレンダーの日付範囲を計算
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // 月の最初の週の日曜日から最後の週の土曜日まで
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // 前月・次月のナビゲーション
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // 日付に日記エントリーがあるかチェック
  const getDiaryEntry = (date) => {
    return diaryEntries.find(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  // 気分アイコンの取得
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

  // 日付クリック処理
  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <BsChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </h2>
            <p className="text-sm opacity-90">日記カレンダー</p>
          </div>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <BsChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const diaryEntry = getDiaryEntry(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          
          return (
            <button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              className={`
                relative p-3 min-h-[80px] text-left border-r border-b border-gray-100
                transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}
                ${isTodayDate && !isSelected ? 'bg-yellow-50 ring-1 ring-yellow-300' : ''}
              `}
            >
              {/* 日付 */}
              <div className={`text-sm font-medium mb-1 ${
                isTodayDate ? 'text-blue-600' : 
                !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {format(date, 'd')}
              </div>
              
              {/* 日記エントリーの表示 */}
              {diaryEntry && isCurrentMonth && (
                <div className="space-y-1">
                  {/* 気分アイコン */}
                  <div className="text-lg">
                    {getMoodEmoji(diaryEntry.mood)}
                  </div>
                  
                  {/* 日記のプレビュー */}
                  <div className="text-xs text-gray-600 line-clamp-2 leading-tight">
                    {diaryEntry.summary.substring(0, 20)}...
                  </div>
                  
                  {/* タップして読む */}
                  <div className="text-xs bg-purple-500 text-white px-1 py-0.5 rounded text-center">
                    タップして読む
                  </div>
                </div>
              )}
              
              {/* 日記がない日の場合 */}
              {!diaryEntry && isCurrentMonth && (
                <div className="absolute bottom-1 left-1 right-1 text-center">
                  <div className="text-xs text-gray-400">
                    日記なし
                  </div>
                </div>
              )}
              
              {/* 今日のマーカー */}
              {isTodayDate && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DiaryCalendar;