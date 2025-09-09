import React, { useState, useEffect } from 'react';
import DiaryList from './DiaryList';
import DiaryEditor from './DiaryEditor';
import DiaryCalendar from './DiaryCalendar';

const DiaryContainer = () => {
  const [diaries, setDiaries] = useState([]);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [view, setView] = useState('calendar'); // 'list', 'calendar', 'edit', 'create'
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadDiaries();
  }, []);

  const loadDiaries = () => {
    const savedDiaries = localStorage.getItem('diary_entries');
    if (savedDiaries) {
      try {
        const parsed = JSON.parse(savedDiaries);
        setDiaries(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error loading diaries:', error);
        setDiaries([]);
      }
    }
  };

  const saveDiaries = (updatedDiaries) => {
    localStorage.setItem('diary_entries', JSON.stringify(updatedDiaries));
    setDiaries(updatedDiaries);
  };

  const generateDiaryForDate = async (targetDate) => {
    try {
      // チャット履歴を取得
      const chatMessages = localStorage.getItem('chat_messages');
      if (!chatMessages) {
        alert('チャット履歴がありません。まずはAIとチャットしてみてください！');
        return;
      }

      const messages = JSON.parse(chatMessages);
      if (messages.length === 0) {
        alert('チャット履歴が空です。AIとの会話を始めてから日記を生成してください。');
        return;
      }

      // 指定された日付で日記生成API呼び出し
      const response = await fetch('/api/diary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          date: targetDate
        }),
      });

      if (!response.ok) {
        throw new Error('日記生成に失敗しました');
      }

      const data = await response.json();
      
      // サーバーレスポンスから日記データを取得
      const diaryData = data.diary || data;
      
      // 新しい日記エントリーを作成
      const newDiary = {
        id: Date.now(),
        date: targetDate,
        title: diaryData.title || `${targetDate}の日記`,
        content: diaryData.content || '日記の生成に失敗しました。',
        mood: diaryData.mood || 'まあまあ',
        weather: diaryData.weather || null,
        generated: true,
        createdAt: new Date().toISOString(),
        tags: diaryData.tags || []
      };

      const updatedDiaries = [newDiary, ...diaries];
      saveDiaries(updatedDiaries);
      
      // 生成された日記をカレンダーで選択状態にする
      setSelectedDate(targetDate);
      // カレンダービューのままにする
      
    } catch (error) {
      console.error('Diary generation error:', error);
      alert('日記の生成に失敗しました: ' + error.message);
    }
  };


  const handleSaveDiary = (diary) => {
    const updatedDiaries = diaries.map(d => 
      d.id === diary.id ? diary : d
    );
    saveDiaries(updatedDiaries);
    setView('list');
    setSelectedDiary(null);
  };

  const handleDeleteDiary = (diaryId) => {
    if (confirm('この日記を削除しますか？')) {
      const updatedDiaries = diaries.filter(d => d.id !== diaryId);
      saveDiaries(updatedDiaries);
      if (selectedDiary && selectedDiary.id === diaryId) {
        setSelectedDiary(null);
        setView('list');
      }
    }
  };

  const handleEditDiary = (diary) => {
    setSelectedDiary(diary);
    setView('edit');
  };


  const handleBackToList = () => {
    setView('calendar');
    setSelectedDiary(null);
    setSelectedDate(null);
  };

  const handleCalendarDateClick = async (date) => {
    setSelectedDate(date);
    // その日の日記があるかチェック
    const diaryForDate = diaries.find(d => d.date === date);
    if (diaryForDate) {
      // 既存の日記は編集
      setSelectedDiary(diaryForDate);
      setView('edit');
    } else {
      // 日記がない場合は、その日付でAI日記を自動生成
      await generateDiaryForDate(date);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'calendar':
        return (
          <DiaryCalendar
            diaries={diaries}
            onDateClick={handleCalendarDateClick}
            selectedDate={selectedDate}
          />
        );
      case 'edit':
      case 'create':
        return (
          <DiaryEditor
            diary={selectedDiary}
            isNew={view === 'create'}
            onSave={handleSaveDiary}
            onCancel={handleBackToList}
          />
        );
      default:
        return (
          <DiaryList
            diaries={diaries}
            onEdit={handleEditDiary}
            onDelete={handleDeleteDiary}
          />
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* メインヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center mb-2">
            <span className="text-4xl mr-3">📓</span>
            AI日記アプリ
          </h1>
          <p className="text-blue-100 text-lg">
            AIと一緒に、今日の思い出を美しく記録しましょう
          </p>
        </div>
      </div>

      {/* 表示切り替えタブ */}
      {(view === 'list' || view === 'calendar') && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex justify-center">
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`px-6 py-3 font-medium transition-all ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">📝</span>
                日記一覧
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-6 py-3 font-medium transition-all ${
                  view === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">📅</span>
                カレンダー
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* 編集画面での戻るボタン */}
      {view !== 'list' && view !== 'calendar' && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <button
            onClick={handleBackToList}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            ← カレンダーに戻る
          </button>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="min-h-96">
        {renderView()}
      </div>
    </div>
  );
};

export default DiaryContainer;