// 日付関連のユーティリティ関数

/**
 * 現在の日本時間での日付を YYYY-MM-DD 形式で取得
 * @returns {string} YYYY-MM-DD 形式の日付文字列
 */
export const getTodayInJST = () => {
  const now = new Date();
  // 日本時間のオフセット（+9時間）を適用
  const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return japanTime.toISOString().split('T')[0];
};

/**
 * 指定された日付を日本時間で YYYY-MM-DD 形式に変換
 * @param {Date} date - 変換したい日付
 * @returns {string} YYYY-MM-DD 形式の日付文字列
 */
export const formatDateInJST = (date) => {
  const japanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  return japanTime.toISOString().split('T')[0];
};

/**
 * YYYY-MM-DD 形式の文字列から日本時間のDateオブジェクトを作成
 * @param {string} dateString - YYYY-MM-DD 形式の日付文字列
 * @returns {Date} Dateオブジェクト
 */
export const createJSTDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  // 日本時間での日付を作成（月は0ベースなので-1）
  return new Date(year, month - 1, day);
};

/**
 * 現在時刻が日本時間で何時かを取得
 * @returns {number} 0-23の時間
 */
export const getCurrentHourInJST = () => {
  const now = new Date();
  const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return japanTime.getUTCHours();
};