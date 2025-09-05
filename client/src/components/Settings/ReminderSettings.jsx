import React, { useState, useEffect, useContext } from 'react';
import { BsBell, BsBellSlash, BsClock, BsCalendar3, BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';
import { reminderStorage } from '../../utils/localStorage';
import { notificationManager, reminderScheduler } from '../../utils/notifications';
import { ToastContext } from '../../App';

const ReminderSettings = () => {
  const [settings, setSettings] = useState(reminderStorage.defaultSettings);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const toast = useContext(ToastContext);

  useEffect(() => {
    // 設定を読み込み
    const savedSettings = reminderStorage.getReminderSettings();
    setSettings(savedSettings);
  }, []);

  // 通知許可を要求
  const requestNotificationPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await notificationManager.requestPermission();
      setNotificationPermission(Notification.permission);
      
      if (granted) {
        toast?.success('通知の許可が完了しました');
      } else {
        toast?.error('通知の許可が拒否されました。ブラウザの設定から許可してください');
      }
    } catch (error) {
      console.error('通知許可エラー:', error);
      toast?.error('通知許可の取得に失敗しました');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // 設定を更新して保存
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    reminderStorage.saveReminderSettings(newSettings);
    
    // リマインダーを再設定
    if (newSettings.dailyReminder.enabled && newSettings.enabled) {
      reminderScheduler.scheduleDailyReminder(
        newSettings.dailyReminder.hour,
        newSettings.dailyReminder.minute
      );
    } else {
      reminderScheduler.clearDailyReminder();
    }
  };

  // 日次リマインダーの有効/無効を切り替え
  const toggleDailyReminder = (enabled) => {
    const newSettings = {
      ...settings,
      dailyReminder: { ...settings.dailyReminder, enabled },
      enabled: enabled || settings.weeklyReview.enabled
    };
    updateSetting('dailyReminder', newSettings.dailyReminder);
    updateSetting('enabled', newSettings.enabled);
  };

  // 日次リマインダー時刻を更新
  const updateDailyReminderTime = (hour, minute) => {
    const newDailyReminder = { ...settings.dailyReminder, hour, minute };
    updateSetting('dailyReminder', newDailyReminder);
  };

  // テスト通知を送信
  const sendTestNotification = () => {
    if (!notificationManager.canShowNotification()) {
      toast?.warning('通知の許可が必要です');
      return;
    }

    notificationManager.showDiaryReminder();
    toast?.success('テスト通知を送信しました');
  };

  const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <BsBell className="w-5 h-5 mr-2" />
          リマインダー設定
        </h3>
      </div>

      {/* 通知許可状態 */}
      <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {notificationPermission === 'granted' ? (
              <BsCheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <BsExclamationCircle className="w-5 h-5 text-orange-500 mr-2" />
            )}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                ブラウザ通知
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notificationPermission === 'granted' 
                  ? '通知が許可されています' 
                  : '通知の許可が必要です'}
              </p>
            </div>
          </div>
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              disabled={isRequestingPermission}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              {isRequestingPermission ? '許可中...' : '許可する'}
            </button>
          )}
        </div>
      </div>

      {/* 日次リマインダー */}
      <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BsClock className="w-5 h-5 text-blue-500 mr-2" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">日記リマインダー</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                毎日決まった時間にリマインダーを送信
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dailyReminder.enabled}
              onChange={(e) => toggleDailyReminder(e.target.checked)}
              className="sr-only peer"
              disabled={notificationPermission !== 'granted'}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.dailyReminder.enabled && (
          <div className="ml-7 space-y-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                時刻:
              </label>
              <input
                type="time"
                value={`${settings.dailyReminder.hour.toString().padStart(2, '0')}:${settings.dailyReminder.minute.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(':');
                  updateDailyReminderTime(parseInt(hour), parseInt(minute));
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
            <button
              onClick={sendTestNotification}
              disabled={notificationPermission !== 'granted'}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded text-sm transition-colors"
            >
              テスト通知
            </button>
          </div>
        )}
      </div>

      {/* 継続記録通知 */}
      <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BsCheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">継続記録通知</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                継続日数の達成時に祝福メッセージを表示
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.streakNotifications}
              onChange={(e) => updateSetting('streakNotifications', e.target.checked)}
              className="sr-only peer"
              disabled={notificationPermission !== 'granted'}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      {/* 励まし通知 */}
      <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BsBellSlash className="w-5 h-5 text-orange-500 mr-2" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">励まし通知</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                しばらく日記を書いていない時に優しくお声がけ
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.encouragementNotifications}
              onChange={(e) => updateSetting('encouragementNotifications', e.target.checked)}
              className="sr-only peer"
              disabled={notificationPermission !== 'granted'}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">ご注意</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• 通知はブラウザが開いている時のみ表示されます</li>
          <li>• ブラウザの設定で通知がブロックされている場合は表示されません</li>
          <li>• タブが非アクティブでも通知は表示されます</li>
          <li>• 通知は自動的に5秒後に消えます</li>
        </ul>
      </div>
    </div>
  );
};

export default ReminderSettings;