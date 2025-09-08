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
          className={`aspect-square p-2 cursor-pointer rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
            selected 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
              : hasEntry 
                ? 'bg-gradient-to-br from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200' 
                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
          } ${todayClass ? 'ring-3 ring-green-400 ring-offset-2' : ''}`}
        >
          <div className="h-full flex flex-col items-center justify-center">
            <span className={`text-lg font-bold mb-1 ${
              selected ? 'text-white' : todayClass ? 'text-green-600' : hasEntry ? 'text-gray-800' : 'text-gray-600'
            }`}>
              {date}
            </span>
            {hasEntry && (
              <span className="text-xl animate-pulse">
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
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      {/* カレンダーヘッダー */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-3 hover:bg-white/20 rounded-lg transition-all duration-200 font-medium"
          >
            <span className="text-xl">←</span> 前月
          </button>
          
          <h2 className="text-2xl font-bold text-center">
            {year}年 {monthNames[month]}
          </h2>
          
          <button
            onClick={() => changeMonth(1)}
            className="p-3 hover:bg-white/20 rounded-lg transition-all duration-200 font-medium"
          >
            次月 <span className="text-xl">→</span>
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 bg-gray-50">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`p-4 text-center font-bold ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2 p-4 bg-gray-50/30">
        {renderCalendarDays()}
      </div>

      {/* 説明・凡例 */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center mb-4">
          <p className="text-gray-700 font-medium">📅 日付をクリックしてAI日記を自動生成・編集</p>
          <p className="text-gray-500 text-sm">空の日付：クリックでAI日記生成 | 絵文字がある日：クリックで編集</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-lg shadow-sm"></div>
            <span className="font-medium text-gray-700">選択中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 ring-3 ring-green-500 rounded-lg shadow-sm bg-white"></div>
            <span className="font-medium text-gray-700">今日</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span className="font-medium text-gray-700">日記あり</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">😄😊😐😞😢</span>
            <span className="font-medium text-gray-700">気分表示</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryCalendar;