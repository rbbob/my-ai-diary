import React, { useState, useMemo } from 'react';

const DiaryCalendar = ({ diaries, onDateClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 現在の月の情報を取得
  const { year, month, daysInMonth, firstDayOfWeek, today } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0: Sunday, 1: Monday, ...
    const today = new Date();
    
    return { year, month, daysInMonth, firstDayOfWeek, today };
  }, [currentMonth]);

  // 月名の配列
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 曜日の配列
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // 日記があるかチェック
  const hasDiary = (date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return diaries.some(diary => diary.date === dateStr);
  };

  // 日記の気分を取得
  const getDiaryMood = (date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const diary = diaries.find(diary => diary.date === dateStr);
    return diary?.mood;
  };

  // 気分に応じた絵文字
  const getMoodEmoji = (mood) => {
    const moodMap = {
      '最高': '😄',
      '良い': '😊',
      'まあまあ': '😐',
      '悪い': '😞',
      '最悪': '😢'
    };
    return moodMap[mood] || '📝';
  };

  // 選択された日付かチェック
  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  // 今日かチェック
  const isToday = (date) => {
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === date;
  };

  // 月を変更
  const changeMonth = (increment) => {
    setCurrentMonth(new Date(year, month + increment, 1));
  };

  // 日付がクリックされたとき
  const handleDateClick = (date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    onDateClick(dateStr);
  };

  // カレンダーの日付グリッドを生成
  const renderCalendarDays = () => {
    const days = [];
    
    // 前月の空白を埋める
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1">
          {/* 空のセル */}
        </div>
      );
    }
    
    // 実際の日付
    for (let date = 1; date <= daysInMonth; date++) {
      const hasEntry = hasDiary(date);
      const mood = getDiaryMood(date);
      const selected = isSelectedDate(date);
      const todayClass = isToday(date);
      
      days.push(
        <div
          key={date}
          onClick={() => handleDateClick(date)}
          className={`aspect-square p-1 cursor-pointer rounded-lg transition-all hover:bg-blue-50 ${
            selected ? 'bg-blue-500 text-white' : ''
          } ${todayClass ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="h-full flex flex-col items-center justify-center text-sm">
            <span className={`font-medium ${selected ? 'text-white' : ''}`}>
              {date}
            </span>
            {hasEntry && (
              <span className="text-xs mt-1">
                {getMoodEmoji(mood)}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          ← 前月
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800">
          {year}年 {monthNames[month]}
        </h3>
        
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          次月 →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {renderCalendarDays()}
      </div>

      {/* 凡例 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>選択中</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 ring-2 ring-green-500 rounded"></div>
            <span>今日</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📝</span>
            <span>日記あり</span>
          </div>
          <div className="flex items-center gap-2">
            <span>😄😊😐😞😢</span>
            <span>気分</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryCalendar;