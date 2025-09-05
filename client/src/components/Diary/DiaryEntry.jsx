import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BsCalendar, BsClock, BsChat, BsArrowLeft, BsPlusCircle, BsPencil, BsCheck, BsX, BsTrash } from 'react-icons/bs';
import { messageStorage, diaryStorage, reminderStorage } from '../../utils/localStorage';
import { ToastContext } from '../../App';
import { getTodayInJST } from '../../utils/dateUtils';
import { reminderScheduler, notificationManager } from '../../utils/notifications';

const DiaryEntry = ({ entry, selectedDate, onBack, onDiaryGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(entry);
  const toast = useContext(ToastContext);

  // entryが更新された時に現在の表示を更新
  useEffect(() => {
    if (entry) {
      console.log('=== ENTRY UPDATED ===');
      console.log('New entry title:', entry.title);
      console.log('New entry summary length:', entry.summary?.length);
      console.log('====================');
      setCurrentEntry(entry);
    }
  }, [entry]);

  const generateDiary = async () => {
    if (isGenerating) return; // 重複実行を防止
    
    try {
      setIsGenerating(true);
      
      // チャット履歴を取得
      const messages = messageStorage.getMessages();
      if (messages.length === 0) {
        toast?.warning('日記を生成するためのチャット履歴がありません。まずチャットで何か話してみてください。');
        return;
      }
      
      // 選択された日付またはtoday（今日の日記生成の場合）
      const targetDate = selectedDate ? 
        selectedDate.toLocaleDateString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit'
        }).replace(/\//g, '-') : 
        getTodayInJST();
      
      const targetDateMessages = messages.filter(msg => {
        if (msg.timestamp) {
          const msgDate = new Date(msg.timestamp).toLocaleDateString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-');
          return msgDate === targetDate && msg.role === 'user';
        }
        // タイムスタンプがない古いメッセージは今日の日記生成時のみ含める
        return targetDate === getTodayInJST() && msg.role === 'user';
      });
      
      if (targetDateMessages.length === 0) {
        const isToday = targetDate === getTodayInJST();
        const dateDisplay = isToday ? '今日' : targetDate;
        toast?.warning(`${dateDisplay}のチャット履歴がありません。${dateDisplay}に何か話してから日記を生成してください。`);
        return;
      }

      // 日記生成APIを呼び出し（一意性を確保するためタイムスタンプ付き）
      const response = await fetch('/api/diary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          date: targetDate,
          generateTimestamp: Date.now() // キャッシュ回避用
        }),
      });

      if (!response.ok) {
        throw new Error('日記生成に失敗しました');
      }

      const result = await response.json();
      
      if (result.success) {
        // 生成された日記をローカルストレージに保存
        const diaryEntry = {
          ...result.data,
          date: targetDate
        };
        
        // 既存の日記リストを取得して新しい日記を追加
        const existingDiaries = diaryStorage.getDiaryEntries();
        console.log('=== CLIENT DIARY SAVE DEBUG ===');
        console.log('Existing diaries count:', existingDiaries.length);
        console.log('Target date:', targetDate);
        console.log('New diary title:', diaryEntry.title);
        console.log('New diary summary length:', diaryEntry.summary?.length);
        
        const filteredDiaries = existingDiaries.filter(d => d.date !== targetDate);
        console.log('After filtering same date, count:', filteredDiaries.length);
        
        const updatedDiaries = [diaryEntry, ...filteredDiaries];
        console.log('Final diary count:', updatedDiaries.length);
        console.log('==============================');
        
        diaryStorage.saveDiaryEntries(updatedDiaries);
        
        // 継続記録の通知チェック
        const reminderSettings = reminderStorage.getReminderSettings();
        if (reminderSettings.streakNotifications && notificationManager.canShowNotification()) {
          // 新しい日記リストを使って継続記録をチェック
          reminderScheduler.checkStreak(updatedDiaries);
        }
        
        // 親コンポーネントに新しい日記を通知
        if (onDiaryGenerated) {
          onDiaryGenerated(diaryEntry);
        }
        
        // 現在の表示を即座に更新
        setCurrentEntry(diaryEntry);
        
        toast?.success(`日記が生成されました！タイトル: ${result.data.title}`, 6000);
      } else {
        throw new Error(result.error || '日記生成に失敗しました');
      }
    } catch (error) {
      console.error('日記生成エラー:', error);
      toast?.error(`日記の生成中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 編集モードを開始
  const startEditing = () => {
    setEditedEntry({
      ...currentEntry,
      tags: Array.isArray(currentEntry.tags) ? currentEntry.tags : []
    });
    setIsEditing(true);
  };

  // 編集をキャンセル
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedEntry(null);
  };

  // 編集内容を保存
  const saveEditing = async () => {
    if (!editedEntry.title?.trim()) {
      toast?.error('タイトルは必須です');
      return;
    }
    if (!editedEntry.summary?.trim()) {
      toast?.error('日記本文は必須です');
      return;
    }
    if (!editedEntry.date) {
      toast?.error('日付は必須です');
      return;
    }

    try {
      setIsSaving(true);

      // 日付が変更された場合の重複チェック
      if (editedEntry.date !== currentEntry.date) {
        const existingDiaries = diaryStorage.getDiaryEntries();
        const duplicateEntry = existingDiaries.find(diary => 
          diary.date === editedEntry.date && diary.diaryId !== currentEntry.diaryId
        );
        
        if (duplicateEntry) {
          toast?.error(`${editedEntry.date}の日記は既に存在します。先に既存の日記を削除するか、別の日付を選択してください。`);
          return;
        }
      }

      const updatedEntry = {
        ...editedEntry,
        updatedAt: new Date().toISOString(),
        wordCount: editedEntry.summary.length
      };

      // LocalStorageを更新
      const existingDiaries = diaryStorage.getDiaryEntries();
      const updatedDiaries = existingDiaries.map(diary => 
        diary.diaryId === entry.diaryId ? updatedEntry : diary
      );
      diaryStorage.saveDiaryEntries(updatedDiaries);

      // 親コンポーネントに更新を通知
      if (onDiaryGenerated) {
        onDiaryGenerated(updatedEntry);
      }

      setIsEditing(false);
      setEditedEntry(null);
      toast?.success('日記を更新しました');
      
    } catch (error) {
      console.error('日記更新エラー:', error);
      toast?.error(`日記の更新中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 日記削除
  const deleteDiary = async () => {
    try {
      const existingDiaries = diaryStorage.getDiaryEntries();
      const updatedDiaries = existingDiaries.filter(diary => 
        diary.diaryId !== entry.diaryId
      );
      diaryStorage.saveDiaryEntries(updatedDiaries);

      toast?.success('日記を削除しました');
      
      // 親コンポーネントに削除を通知（日記一覧に戻る）
      if (onBack) {
        onBack();
      }
      
    } catch (error) {
      console.error('日記削除エラー:', error);
      toast?.error(`日記の削除中にエラーが発生しました: ${error.message}`);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    deleteDiary();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // フィールド値の変更
  const handleFieldChange = (field, value) => {
    setEditedEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // タグの変更（カンマ区切り文字列からarray変換）
  const handleTagsChange = (tagsString) => {
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleFieldChange('tags', tagsArray);
  };

  if (!currentEntry) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg mb-6">今日の日記を作成しませんか？</p>
          <button
            onClick={generateDiary}
            disabled={isGenerating}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                日記を生成中...
              </>
            ) : (
              <>
                <BsPlusCircle className="w-5 h-5 mr-2" />
                チャットから日記を生成
              </>
            )}
          </button>
          <p className="text-sm text-gray-400 mt-2">
            チャットでの会話から自動で日記を作成します
          </p>
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
          {isEditing ? (
            <input
              type="text"
              value={editedEntry.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
              placeholder="タイトルを入力..."
              maxLength={100}
            />
          ) : (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentEntry.title}
            </h1>
          )}
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <BsCalendar className="w-4 h-4 mr-1" />
              {isEditing ? (
                <input
                  type="date"
                  value={editedEntry.date || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              ) : (
                format(new Date(currentEntry.date), 'yyyy年M月d日(E)', { locale: ja })
              )}
            </div>
            <div className="flex items-center">
              <BsClock className="w-4 h-4 mr-1" />
              {format(new Date(currentEntry.createdAt), 'HH:mm', { locale: ja })}
            </div>
            <div className="flex items-center">
              <span className="mr-1">{getMoodEmoji(currentEntry.mood)}</span>
              {getMoodText(currentEntry.mood)}
            </div>
          </div>
        </div>
        
        {/* 編集ボタン */}
        <div className="flex items-center space-x-2 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={saveEditing}
                disabled={isSaving}
                className="flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <BsCheck className="w-4 h-4 mr-1" />
                )}
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <BsX className="w-4 h-4 mr-1" />
                キャンセル
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <BsPencil className="w-4 h-4 mr-1" />
                編集
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <BsTrash className="w-4 h-4 mr-1" />
                削除
              </button>
            </>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 日記本文 */}
        <div className="prose max-w-none mb-8">
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日記本文
              </label>
              <textarea
                value={editedEntry.summary || ''}
                onChange={(e) => handleFieldChange('summary', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="日記の内容を書いてください..."
                rows="8"
                maxLength={2000}
              />
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                {editedEntry.summary?.length || 0} / 2000
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
              {currentEntry.summary}
            </div>
          )}
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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">🏷️</span>
            タグ
          </h3>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={Array.isArray(editedEntry.tags) ? editedEntry.tags.join(', ') : ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="タグをカンマ区切りで入力（例: 仕事, 趣味, 感謝）"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                カンマ区切りで複数のタグを入力できます
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(entry.tags && entry.tags.length > 0) ? (
                entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-sm italic">
                  タグがありません
                </span>
              )}
            </div>
          )}
        </div>

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
      
      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <BsTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  日記を削除
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  この操作は元に戻すことができません
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                「<span className="font-semibold">{entry.title}</span>」を削除してもよろしいですか？
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(new Date(entry.date), 'yyyy年M月d日(E)', { locale: ja })}の日記
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryEntry;