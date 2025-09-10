import React, { useState, useEffect } from 'react';
import DiaryList from './DiaryList';
import DiaryEditor from './DiaryEditor';
import DiaryCalendar from './DiaryCalendar';

const DiaryContainer = () => {
  const [diaries, setDiaries] = useState([]);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [view, setView] = useState('calendar'); // 'list', 'calendar', 'edit', 'create'
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // 強制更新用

  useEffect(() => {
    loadDiaries();
    
    // LocalStorageの変更を監視（他のタブでの変更も検知）
    const handleStorageChange = (e) => {
      if (e.key === 'diary_entries') {
        console.log('🔄 LocalStorageの日記データが変更されました - 自動更新中...');
        loadDiaries();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadDiaries = async () => {
    console.log('🔄 日記一覧を更新中...', new Date().toLocaleTimeString());
    try {
      const savedDiaries = localStorage.getItem('diary_entries');
      if (savedDiaries) {
        const parsed = JSON.parse(savedDiaries);
        const diaryArray = Array.isArray(parsed) ? parsed : [];
        console.log(`📚 ${diaryArray.length}件の日記を読み込みました`, diaryArray);
        // 日付順にソート（新しいものから）
        const sortedDiaries = diaryArray.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        setDiaries([...sortedDiaries]); // 新しい配列を作成して確実に更新
        setRefreshKey(prev => prev + 1); // 強制再レンダリング
      } else {
        console.log('📝 保存された日記がありません');
        setDiaries([]);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('日記の読み込みエラー:', error);
      setDiaries([]);
      setRefreshKey(prev => prev + 1);
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

      // LocalStorageからAPIキー設定を取得
      const apiKey = localStorage.getItem('openai_api_key');
      const model = localStorage.getItem('openai_model') || 'gpt-4o-mini';

      // 指定された日付で日記生成API呼び出し
      const response = await fetch('/api/diary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          messages: messages,
          date: targetDate,
          apiKey: apiKey,
          model: model
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

  const handleRegenerateDiary = async (date) => {
    const confirmRegenerate = confirm(`${date}の日記を最新のチャット内容で再生成しますか？\n\n現在の内容は失われます。`);
    if (confirmRegenerate) {
      // 既存の日記を削除
      const updatedDiaries = diaries.filter(d => d.date !== date);
      saveDiaries(updatedDiaries);
      // 新しい日記を生成
      await generateDiaryForDate(date);
      // カレンダー表示に戻る
      setView('calendar');
      setSelectedDiary(null);
    }
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
      // 既存の日記がある場合は編集画面に移動（編集画面に再生成ボタンを追加予定）
      setSelectedDiary(diaryForDate);
      setView('edit');
    } else {
      // 新しい日記を生成
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
            onRegenerate={handleRegenerateDiary}
          />
        );
      default:
        return (
          <DiaryList
            key={refreshKey}
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