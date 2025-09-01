// LocalStorage管理ユーティリティ

const STORAGE_KEYS = {
  MESSAGES: 'daily_companion_messages',
  DIARY_ENTRIES: 'daily_companion_diary_entries', 
  USER_SETTINGS: 'daily_companion_user_settings',
  APP_DATA: 'daily_companion_app_data'
};

// 基本的なLocalStorage操作
export const storage = {
  // データを取得
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  // データを保存
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);
      return false;
    }
  },

  // データを削除
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  // 全データをクリア
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// メッセージ関連
export const messageStorage = {
  // 全メッセージ取得
  getMessages: () => {
    return storage.get(STORAGE_KEYS.MESSAGES) || [];
  },

  // メッセージ保存
  saveMessages: (messages) => {
    return storage.set(STORAGE_KEYS.MESSAGES, messages);
  },

  // メッセージ追加
  addMessage: (message) => {
    const messages = messageStorage.getMessages();
    const newMessages = [...messages, message];
    return messageStorage.saveMessages(newMessages);
  },

  // メッセージクリア
  clearMessages: () => {
    return storage.remove(STORAGE_KEYS.MESSAGES);
  }
};

// 日記関連
export const diaryStorage = {
  // 全日記エントリー取得
  getDiaryEntries: () => {
    return storage.get(STORAGE_KEYS.DIARY_ENTRIES) || [];
  },

  // 日記エントリー保存
  saveDiaryEntries: (entries) => {
    return storage.set(STORAGE_KEYS.DIARY_ENTRIES, entries);
  },

  // 日記エントリー追加
  addDiaryEntry: (entry) => {
    const entries = diaryStorage.getDiaryEntries();
    const newEntries = [...entries, entry];
    return diaryStorage.saveDiaryEntries(newEntries);
  },

  // 特定日の日記取得
  getDiaryByDate: (date) => {
    const entries = diaryStorage.getDiaryEntries();
    return entries.find(entry => entry.date === date);
  },

  // 日記エントリー更新
  updateDiaryEntry: (updatedEntry) => {
    const entries = diaryStorage.getDiaryEntries();
    const updatedEntries = entries.map(entry => 
      entry.diaryId === updatedEntry.diaryId ? updatedEntry : entry
    );
    return diaryStorage.saveDiaryEntries(updatedEntries);
  },

  // 日記エントリー削除
  deleteDiaryEntry: (diaryId) => {
    const entries = diaryStorage.getDiaryEntries();
    const filteredEntries = entries.filter(entry => entry.diaryId !== diaryId);
    return diaryStorage.saveDiaryEntries(filteredEntries);
  }
};

// 設定関連
export const settingsStorage = {
  // デフォルト設定
  defaultSettings: {
    userName: 'ユーザー',
    aiName: 'アシスタント',
    aiPersonality: 'friendly',
    language: 'ja',
    timezone: 'Asia/Tokyo',
    autoGenerate: true,
    generateTime: '23:59',
    notificationsEnabled: true,
    theme: 'light',
    lastActiveDate: new Date().toISOString()
  },

  // 設定取得
  getSettings: () => {
    const settings = storage.get(STORAGE_KEYS.USER_SETTINGS);
    if (!settings) {
      // 初回起動時はデフォルト設定を保存
      settingsStorage.saveSettings(settingsStorage.defaultSettings);
      return settingsStorage.defaultSettings;
    }
    // デフォルト設定とマージ（新しい設定項目への対応）
    return { ...settingsStorage.defaultSettings, ...settings };
  },

  // 設定保存
  saveSettings: (settings) => {
    const updatedSettings = {
      ...settings,
      lastActiveDate: new Date().toISOString()
    };
    return storage.set(STORAGE_KEYS.USER_SETTINGS, updatedSettings);
  },

  // 個別設定更新
  updateSetting: (key, value) => {
    const settings = settingsStorage.getSettings();
    const updatedSettings = { ...settings, [key]: value };
    return settingsStorage.saveSettings(updatedSettings);
  }
};

// アプリデータ関連
export const appDataStorage = {
  // アプリメタデータ取得
  getAppData: () => {
    return storage.get(STORAGE_KEYS.APP_DATA) || {
      version: '1.0.0',
      firstLaunch: new Date().toISOString(),
      launchCount: 0,
      totalMessages: 0,
      totalDiaryEntries: 0
    };
  },

  // アプリデータ更新
  updateAppData: (data) => {
    const currentData = appDataStorage.getAppData();
    const updatedData = { ...currentData, ...data };
    return storage.set(STORAGE_KEYS.APP_DATA, updatedData);
  },

  // 起動回数増加
  incrementLaunchCount: () => {
    const appData = appDataStorage.getAppData();
    return appDataStorage.updateAppData({
      launchCount: appData.launchCount + 1,
      lastLaunch: new Date().toISOString()
    });
  }
};

// データエクスポート/インポート
export const dataPortability = {
  // 全データをエクスポート
  exportAllData: () => {
    const allData = {
      messages: messageStorage.getMessages(),
      diaryEntries: diaryStorage.getDiaryEntries(),
      settings: settingsStorage.getSettings(),
      appData: appDataStorage.getAppData(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_companion_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  },

  // データをインポート
  importData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // データ形式の検証
          if (!data.version || !data.exportDate) {
            reject(new Error('無効なバックアップファイルです'));
            return;
          }
          
          // データの復元
          if (data.messages) messageStorage.saveMessages(data.messages);
          if (data.diaryEntries) diaryStorage.saveDiaryEntries(data.diaryEntries);
          if (data.settings) settingsStorage.saveSettings(data.settings);
          if (data.appData) appDataStorage.updateAppData(data.appData);
          
          resolve(data);
        } catch (error) {
          reject(new Error('ファイルの読み込みに失敗しました: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みエラー'));
      };
      
      reader.readAsText(file);
    });
  }
};

export default {
  storage,
  messageStorage,
  diaryStorage,
  settingsStorage,
  appDataStorage,
  dataPortability,
  STORAGE_KEYS
};