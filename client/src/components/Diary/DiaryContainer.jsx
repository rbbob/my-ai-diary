import React, { useState, useEffect } from 'react';
import DiaryList from './DiaryList';
import DiaryEditor from './DiaryEditor';
import DiaryCalendar from './DiaryCalendar';

const DiaryContainer = () => {
  const [diaries, setDiaries] = useState([]);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'calendar', 'edit', 'create'
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

  const generateDiaryFromChat = async () => {
    setIsGenerating(true);
    
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

      // 日記生成API呼び出し
      const response = await fetch('/api/diary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          date: new Date().toISOString().split('T')[0]
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
        date: new Date().toISOString().split('T')[0],
        title: diaryData.title || '今日の日記',
        content: diaryData.content || '日記の生成に失敗しました。',
        mood: diaryData.mood || 'まあまあ',
        weather: diaryData.weather || null,
        generated: true,
        createdAt: new Date().toISOString(),
        tags: diaryData.tags || []
      };

      const updatedDiaries = [newDiary, ...diaries];
      saveDiaries(updatedDiaries);
      
      setSelectedDiary(newDiary);
      setView('edit');
      
    } catch (error) {
      console.error('Diary generation error:', error);
      alert('日記の生成に失敗しました: ' + error.message);
    } finally {
      setIsGenerating(false);
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

  const handleCreateNew = () => {
    const newDiary = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      mood: 'まあまあ',
      weather: null,
      generated: false,
      createdAt: new Date().toISOString(),
      tags: []
    };
    setSelectedDiary(newDiary);
    setView('create');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDiary(null);
    setSelectedDate(null);
  };

  const handleCalendarDateClick = (date) => {
    setSelectedDate(date);
    // その日の日記があるかチェック
    const diaryForDate = diaries.find(d => d.date === date);
    if (diaryForDate) {
      setSelectedDiary(diaryForDate);
      setView('edit');
    } else {
      // その日の日記がない場合は新規作成
      const newDiary = {
        id: Date.now(),
        date: date,
        title: '',
        content: '',
        mood: 'まあまあ',
        weather: null,
        generated: false,
        createdAt: new Date().toISOString(),
        tags: []
      };
      setSelectedDiary(newDiary);
      setView('create');
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
            onCreateNew={handleCreateNew}
            onGenerateFromChat={generateDiaryFromChat}
            isGenerating={isGenerating}
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <span className="text-2xl mr-2">📓</span>
              日記
            </h2>
            <p className="text-green-100 text-sm">
              あなたの思い出を美しく記録しましょう
            </p>
          </div>
          
          {(view === 'list' || view === 'calendar') && (
            <div className="flex space-x-2">
              <button
                onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors"
              >
                {view === 'list' ? '📅 カレンダー' : '📋 リスト'}
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded-md text-sm font-medium transition-colors"
              >
                ✏️ 新規作成
              </button>
              <button
                onClick={generateDiaryFromChat}
                disabled={isGenerating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 rounded-md text-sm font-medium transition-colors"
              >
                {isGenerating ? '🔄 生成中...' : '🤖 AI日記生成'}
              </button>
            </div>
          )}
          
          {view !== 'list' && view !== 'calendar' && (
            <button
              onClick={handleBackToList}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded-md text-sm font-medium transition-colors"
            >
              ← 戻る
            </button>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="min-h-96">
        {renderView()}
      </div>
    </div>
  );
};

export default DiaryContainer;