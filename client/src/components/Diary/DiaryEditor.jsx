import React, { useState, useEffect } from 'react';

const DiaryEditor = ({ diary, isNew, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'まあまあ',
    weather: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (diary) {
      setFormData({
        title: diary.title || '',
        content: diary.content || '',
        mood: diary.mood || 'まあまあ',
        weather: diary.weather || '',
        tags: diary.tags || []
      });
    }
  }, [diary]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('日記の内容を入力してください');
      return;
    }

    const updatedDiary = {
      ...diary,
      title: formData.title.trim(),
      content: formData.content.trim(),
      mood: formData.mood,
      weather: formData.weather || null,
      tags: formData.tags,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedDiary);
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const moods = [
    { value: '最高', emoji: '😄', color: 'bg-green-500' },
    { value: '良い', emoji: '😊', color: 'bg-green-400' },
    { value: 'まあまあ', emoji: '😐', color: 'bg-gray-400' },
    { value: '悪い', emoji: '😞', color: 'bg-orange-400' },
    { value: '最悪', emoji: '😢', color: 'bg-red-400' }
  ];

  const weathers = [
    { value: '', label: '選択しない', emoji: '' },
    { value: '晴れ', label: '晴れ', emoji: '☀️' },
    { value: '曇り', label: '曇り', emoji: '☁️' },
    { value: '雨', label: '雨', emoji: '🌧️' },
    { value: '雪', label: '雪', emoji: '❄️' },
    { value: '台風', label: '台風', emoji: '🌪️' }
  ];

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイトル */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            📝 タイトル
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="今日の出来事のタイトルを入力..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
            required
          />
        </div>

        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 日付
          </label>
          <input
            type="date"
            value={diary?.date || new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* 気分と天気 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 気分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              😊 今日の気分
            </label>
            <div className="space-y-2">
              {moods.map((mood) => (
                <label key={mood.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="mood"
                    value={mood.value}
                    checked={formData.mood === mood.value}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`flex items-center px-3 py-2 rounded-md border-2 transition-all ${
                    formData.mood === mood.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <span className="text-xl mr-2">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.value}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 天気 */}
          <div>
            <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-3">
              🌤️ 天気
            </label>
            <select
              id="weather"
              value={formData.weather}
              onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {weathers.map((weather) => (
                <option key={weather.value} value={weather.value}>
                  {weather.emoji} {weather.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 本文 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            ✍️ 日記の内容
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="今日の出来事、感じたこと、考えたことを自由に書いてみてください..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            required
          />
          <div className="mt-2 text-right text-sm text-gray-500">
            {formData.content.length} 文字
          </div>
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏷️ タグ
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="新しいタグを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              追加
            </button>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {isNew ? '✅ 保存' : '💾 更新'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiaryEditor;