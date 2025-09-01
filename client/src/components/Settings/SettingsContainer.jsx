import React, { useState, useEffect } from 'react';
import { BsPersonCircle, BsRobot, BsPalette, BsDownload, BsUpload, BsTrash, BsInfo } from 'react-icons/bs';
import { settingsStorage, appDataStorage, dataPortability, storage } from '../../utils/localStorage';

const SettingsContainer = () => {
  const [settings, setSettings] = useState({});
  const [appData, setAppData] = useState({});

  // 初期化時にLocalStorageから設定を読み込み
  useEffect(() => {
    const savedSettings = settingsStorage.getSettings();
    const savedAppData = appDataStorage.getAppData();
    
    setSettings(savedSettings);
    setAppData(savedAppData);
  }, []);

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    // LocalStorageに即座に保存
    settingsStorage.saveSettings(updatedSettings);
  };

  // データエクスポート
  const handleExportData = () => {
    try {
      dataPortability.exportAllData();
      alert('データのエクスポートが完了しました！');
    } catch (error) {
      alert('エクスポートに失敗しました: ' + error.message);
    }
  };

  // データインポート
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dataPortability.importData(file)
      .then(() => {
        alert('データのインポートが完了しました！ページを再読み込みします。');
        window.location.reload();
      })
      .catch((error) => {
        alert('インポートに失敗しました: ' + error.message);
      });
  };

  // 全データ削除
  const handleClearAllData = () => {
    if (window.confirm('本当に全てのデータを削除しますか？この操作は元に戻せません。')) {
      if (window.confirm('最後の確認です。全てのチャット履歴と日記が削除されます。')) {
        try {
          storage.clear();
          alert('全データを削除しました。ページを再読み込みします。');
          window.location.reload();
        } catch (error) {
          alert('削除に失敗しました: ' + error.message);
        }
      }
    }
  };

  const personalityOptions = [
    { value: 'friendly', label: 'フレンドリー', description: '親しみやすく話しかけてくれます' },
    { value: 'professional', label: '丁寧', description: '礼儀正しく話してくれます' },
    { value: 'casual', label: 'カジュアル', description: '気軽に話してくれます' },
    { value: 'supportive', label: 'サポート重視', description: '励ましてくれます' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">設定</h2>

        {/* プロフィール設定 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BsPersonCircle className="mr-2 text-blue-500" />
            プロフィール
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                あなたの名前
              </label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => handleSettingChange('userName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="名前を入力"
              />
            </div>
          </div>
        </div>

        {/* AI設定 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BsRobot className="mr-2 text-purple-500" />
            AIアシスタント
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AIの名前
              </label>
              <input
                type="text"
                value={settings.aiName}
                onChange={(e) => handleSettingChange('aiName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AIの名前を入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AIの性格
              </label>
              <select
                value={settings.aiPersonality}
                onChange={(e) => handleSettingChange('aiPersonality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {personalityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {personalityOptions.find(p => p.value === settings.aiPersonality)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* 日記設定 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BsPalette className="mr-2 text-green-500" />
            日記設定
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  自動日記生成
                </label>
                <p className="text-xs text-gray-500">
                  毎日自動で日記を生成します
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('autoGenerate', !settings.autoGenerate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoGenerate ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoGenerate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings.autoGenerate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成時刻
                </label>
                <input
                  type="time"
                  value={settings.generateTime}
                  onChange={(e) => handleSettingChange('generateTime', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* データ管理 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BsDownload className="mr-2 text-orange-500" />
            データ管理
          </h3>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <button 
              onClick={handleExportData}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <BsDownload className="mr-2" />
              データをエクスポート
            </button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <BsUpload className="mr-2" />
                データをインポート
              </button>
            </div>
            
            <button 
              onClick={handleClearAllData}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <BsTrash className="mr-2" />
              全データを削除
            </button>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BsInfo className="mr-2 text-gray-500" />
            アプリ情報
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>バージョン:</span>
              <span className="font-medium">{appData.version || '1.0.0'}</span>
            </div>
            <div className="flex justify-between">
              <span>起動回数:</span>
              <span className="font-medium">{appData.launchCount || 0}回</span>
            </div>
            <div className="flex justify-between">
              <span>総メッセージ数:</span>
              <span className="font-medium">{appData.totalMessages || 0}件</span>
            </div>
            <div className="flex justify-between">
              <span>日記エントリー数:</span>
              <span className="font-medium">{appData.totalDiaryEntries || 0}件</span>
            </div>
            <div className="flex justify-between">
              <span>開発:</span>
              <span className="font-medium">Claude Code</span>
            </div>
          </div>
        </div>

        {/* フィードバック */}
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">フィードバック</h4>
            <p className="text-sm text-blue-700 mb-3">
              アプリの改善にご協力ください。ご意見やご要望をお聞かせください。
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
              フィードバックを送信
            </button>
          </div>
        </div>

        {/* プライバシー */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
          <p>あなたのデータは端末内に安全に保存されます</p>
          <p className="mt-1">プライバシーポリシー | 利用規約</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsContainer;