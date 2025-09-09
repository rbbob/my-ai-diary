// 日記エクスポート機能のユーティリティ

/**
 * 日記データをCSV形式でエクスポート
 */
export const exportToCSV = (diaries) => {
  if (!diaries || diaries.length === 0) {
    alert('エクスポートする日記がありません。');
    return;
  }

  // CSV ヘッダー
  const headers = ['日付', 'タイトル', '内容', '気分', '天気', 'AI生成', '作成日時', 'タグ'];
  
  // CSV データ作成
  const csvData = diaries.map(diary => [
    diary.date || '',
    diary.title || '',
    diary.content ? diary.content.replace(/"/g, '""').replace(/\n/g, ' ') : '', // エスケープ処理
    diary.mood || '',
    diary.weather || '',
    diary.generated ? 'はい' : 'いいえ',
    diary.createdAt ? new Date(diary.createdAt).toLocaleString('ja-JP') : '',
    diary.tags ? diary.tags.join(', ') : ''
  ]);

  // CSV文字列を作成
  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // BOMを追加してExcelでの文字化けを防止
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // ダウンロード
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `AI日記_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`📊 ${diaries.length}件の日記をCSVでエクスポートしました`);
};

/**
 * モバイルデバイス判定
 */
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

/**
 * 日記データをPDF形式でエクスポート（HTML to PDF）
 */
export const exportToPDF = (diaries) => {
  if (!diaries || diaries.length === 0) {
    alert('エクスポートする日記がありません。');
    return;
  }

  // 気分の絵文字マップ
  const getMoodEmoji = (mood) => {
    const moodMap = {
      '最高': '😄',
      '良い': '😊',
      'まあまあ': '😐',
      '悪い': '😞',
      '最悪': '😢'
    };
    return moodMap[mood] || '😐';
  };

  // 天気の絵文字マップ
  const getWeatherEmoji = (weather) => {
    if (!weather) return '';
    const weatherMap = {
      '晴れ': '☀️',
      '曇り': '☁️',
      '雨': '🌧️',
      '雪': '❄️',
      '台風': '🌪️'
    };
    return weatherMap[weather] || '🌤️';
  };

  // モバイル用の追加スタイル
  const mobileStyles = isMobile() ? `
    .mobile-instructions {
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: #4f46e5;
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .mobile-instructions button {
      background: white;
      color: #4f46e5;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin: 5px;
      cursor: pointer;
      font-weight: bold;
    }
    body {
      padding-top: 80px;
      font-size: 14px;
    }
    @media print {
      .mobile-instructions {
        display: none;
      }
      body {
        padding-top: 0;
      }
    }
  ` : '';

  // モバイル用の指示
  const mobileInstructions = isMobile() ? `
    <div class="mobile-instructions">
      <p>📱 モバイル版PDF保存方法</p>
      <p>1. 画面右上の「共有」ボタンをタップ<br/>
      2. 「PDFを作成」または「印刷」を選択<br/>
      3. 「PDFとして保存」をタップ</p>
      <button onclick="window.print()">🖨️ 印刷画面を開く</button>
      <button onclick="window.close()">✕ 閉じる</button>
    </div>
  ` : '';

  // HTML テンプレート作成
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI日記 - ${new Date().toLocaleDateString('ja-JP')}</title>
      <style>
        @page {
          margin: 15mm;
          size: A4;
        }
        body {
          font-family: 'MS Gothic', 'Hiragino Sans', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          margin: 0;
          padding: 10px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4f46e5;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          color: #666;
          margin: 10px 0 0 0;
        }
        .diary-entry {
          page-break-inside: avoid;
          margin-bottom: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }
        .diary-header {
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .diary-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 5px 0;
        }
        .diary-meta {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .diary-content {
          font-size: 16px;
          line-height: 1.8;
          white-space: pre-wrap;
          margin-bottom: 15px;
        }
        .diary-tags {
          font-size: 12px;
          color: #4f46e5;
        }
        .tag {
          background: #e0e7ff;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 5px;
        }
        .ai-generated {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background: #f3f4f6;
          border-radius: 8px;
          text-align: center;
        }
        ${mobileStyles}
        @media (max-width: 768px) {
          .diary-entry {
            padding: 15px;
            margin-bottom: 20px;
          }
          .diary-meta {
            flex-direction: column;
            gap: 5px;
          }
          .header h1 {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      ${mobileInstructions}
      
      <div class="header">
        <h1>📓 AI日記</h1>
        <p>エクスポート日: ${new Date().toLocaleDateString('ja-JP')} | 合計: ${diaries.length}件</p>
      </div>

      ${diaries.map(diary => `
        <div class="diary-entry">
          <div class="diary-header">
            <h2 class="diary-title">${diary.title || '無題の日記'}</h2>
            <div class="diary-meta">
              <span>📅 ${new Date(diary.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
              <span>${getMoodEmoji(diary.mood)} ${diary.mood || 'まあまあ'}</span>
              ${diary.weather ? `<span>${getWeatherEmoji(diary.weather)} ${diary.weather}</span>` : ''}
              ${diary.generated ? '<span class="ai-generated">🤖 AI生成</span>' : ''}
            </div>
          </div>
          <div class="diary-content">${diary.content || ''}</div>
          ${diary.tags && diary.tags.length > 0 ? `
            <div class="diary-tags">
              ${diary.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div class="summary">
        <p><strong>📊 統計情報</strong></p>
        <p>総日記数: ${diaries.length}件 | AI生成: ${diaries.filter(d => d.generated).length}件 | 手動作成: ${diaries.filter(d => !d.generated).length}件</p>
      </div>

      <script>
        // モバイルの場合は自動で印刷ダイアログを表示しない
        if (!${isMobile()}) {
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 1000);
          };
          window.onafterprint = () => {
            window.close();
          };
        }
      </script>
    </body>
    </html>
  `;

  // 新しいウィンドウで表示
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  if (isMobile()) {
    console.log(`📱 モバイル版PDF表示: ${diaries.length}件の日記`);
  } else {
    console.log(`📄 ${diaries.length}件の日記をPDFでエクスポートしました`);
  }
};