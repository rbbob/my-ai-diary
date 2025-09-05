// 通知関連のユーティリティ機能

export class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
  }

  // 通知許可を要求
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません');
      return false;
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
    }

    return this.permission === 'granted';
  }

  // 通知を表示
  showNotification(title, options = {}) {
    if (!this.canShowNotification()) {
      console.warn('通知の権限がありません');
      return null;
    }

    const defaultOptions = {
      badge: '/favicon.ico',
      icon: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // 5秒後に自動で閉じる
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('通知の作成に失敗しました:', error);
      return null;
    }
  }

  // 通知を表示できるかチェック
  canShowNotification() {
    return 'Notification' in window && this.permission === 'granted';
  }

  // 日記リマインダー通知
  showDiaryReminder() {
    const messages = [
      '今日の出来事を記録してみませんか？ ✨',
      'あなたの一日を振り返ってみましょう 📝',
      '日記を書いて今日を完璧に締めくくりましょう 🌙',
      '素敵な一日でしたね。記録に残しませんか？ 💫'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return this.showNotification('AI日記リマインダー', {
      body: randomMessage,
      tag: 'diary-reminder',
      onClick: () => {
        window.focus();
        // アプリの日記セクションに移動
        window.location.hash = '#diary';
      }
    });
  }

  // 継続記録の祝福通知
  showStreakNotification(days) {
    let message, icon;
    
    if (days === 1) {
      message = '日記を始めました！素晴らしいスタートです 🌟';
      icon = '🌟';
    } else if (days === 3) {
      message = '3日連続で日記を書いています！調子いいですね 🔥';
      icon = '🔥';
    } else if (days === 7) {
      message = '1週間継続達成！習慣化への大きな一歩です 🎉';
      icon = '🎉';
    } else if (days === 30) {
      message = '30日継続達成！もう立派な習慣ですね 🏆';
      icon = '🏆';
    } else if (days % 10 === 0) {
      message = `${days}日継続中！あなたの継続力は素晴らしいです 💪`;
      icon = '💪';
    } else {
      return null; // 特定の日数以外は通知しない
    }

    return this.showNotification('継続記録更新！', {
      body: message,
      tag: 'streak-notification'
    });
  }

  // 長期間書いていない時の優しい促し
  showEncouragementNotification(daysSince) {
    let message;
    
    if (daysSince <= 3) {
      message = 'しばらく日記を書いていませんね。お疲れ様です 😊';
    } else if (daysSince <= 7) {
      message = 'お忙しかったですね。少し時間ができた時に振り返ってみませんか？ 🌸';
    } else {
      message = 'お元気ですか？また一緒に日記を始めませんか？ 🤗';
    }

    return this.showNotification('AI日記より', {
      body: message,
      tag: 'encouragement',
      requireInteraction: true
    });
  }

  // 週間振り返りリマインダー
  showWeeklyReviewReminder() {
    return this.showNotification('週間振り返り', {
      body: '今週を振り返って、印象的な出来事を記録してみませんか？ 📅',
      tag: 'weekly-review'
    });
  }
}

// リマインダー管理クラス
export class ReminderScheduler {
  constructor(notificationManager) {
    this.notificationManager = notificationManager;
    this.scheduledReminders = new Map();
  }

  // 日次リマインダーを設定
  scheduleDailyReminder(hour, minute) {
    this.clearDailyReminder();

    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // 今日の時刻が過ぎている場合は明日に設定
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilReminder = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        this.notificationManager.showDiaryReminder();
        scheduleNext(); // 次の日のリマインダーを設定
      }, timeUntilReminder);

      this.scheduledReminders.set('daily', timeoutId);
    };

    scheduleNext();
  }

  // 日次リマインダーをクリア
  clearDailyReminder() {
    const timeoutId = this.scheduledReminders.get('daily');
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledReminders.delete('daily');
    }
  }

  // 継続記録チェック（アプリ起動時に呼び出し）
  checkStreak(diaryEntries) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日書いた日記があるかチェック
    const todayEntry = diaryEntries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (!todayEntry) {
      return; // 今日書いていないので継続記録通知は出さない
    }

    // 継続日数を計算
    const streak = this.calculateStreak(diaryEntries);
    
    // 継続記録通知を表示
    this.notificationManager.showStreakNotification(streak);
  }

  // 継続日数を計算
  calculateStreak(diaryEntries) {
    const sortedEntries = diaryEntries
      .map(entry => new Date(entry.date))
      .sort((a, b) => b - a);

    if (sortedEntries.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(sortedEntries[0]);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);

      if (prevDate.getTime() === expectedPrevDate.getTime()) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // 長期間書いていないユーザーへの促し
  checkForEncouragement(diaryEntries) {
    if (diaryEntries.length === 0) {
      return;
    }

    const lastEntry = diaryEntries
      .map(entry => new Date(entry.date))
      .sort((a, b) => b - a)[0];

    const daysSinceLastEntry = Math.floor(
      (Date.now() - lastEntry.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastEntry >= 3) {
      this.notificationManager.showEncouragementNotification(daysSinceLastEntry);
    }
  }
}

// シングルトンインスタンス
export const notificationManager = new NotificationManager();
export const reminderScheduler = new ReminderScheduler(notificationManager);