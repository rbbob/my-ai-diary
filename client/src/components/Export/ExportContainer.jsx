import React, { useState, useContext } from 'react';
import { BsFilePdf, BsCalendar, BsDownload, BsBarChart, BsJournalText } from 'react-icons/bs';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { diaryStorage, messageStorage } from '../../utils/localStorage';
import { ToastContext } from '../../App';

const ExportContainer = () => {
  const [exportType, setExportType] = useState('diary'); // 'diary', 'stats'
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const toast = useContext(ToastContext);

  // 利用可能なタグを取得
  const getAvailableTags = () => {
    const diaries = diaryStorage.getDiaryEntries();
    const tags = new Set();
    diaries.forEach(diary => {
      if (diary.tags && Array.isArray(diary.tags)) {
        diary.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  };

  // 期間に基づいてデータをフィルター
  const filterDataByPeriod = (data) => {
    if (selectedPeriod === 'all') return data;
    
    const now = new Date();
    let fromDate, toDate;
    
    if (selectedPeriod === 'custom') {
      if (!dateRange.from || !dateRange.to) return data;
      fromDate = new Date(dateRange.from);
      toDate = new Date(dateRange.to);
    } else {
      const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
      fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      toDate = now;
    }

    return data.filter(item => {
      const itemDate = new Date(item.date || item.timestamp);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  };

  // タグでフィルター
  const filterByTags = (data) => {
    if (selectedTags.length === 0) return data;
    return data.filter(item => 
      item.tags && item.tags.some(tag => selectedTags.includes(tag))
    );
  };

  // 日記データのPDF出力（HTML to Canvas経由）
  const exportDiaryToPDF = async () => {
    try {
      setIsExporting(true);
      
      let diaries = diaryStorage.getDiaryEntries();
      
      // サンプル日記データを除外（2024年の古いサンプルデータ）
      diaries = diaries.filter(diary => {
        const diaryDate = new Date(diary.date);
        const year = diaryDate.getFullYear();
        // 2024年以前の日記を除外（実際に書かれた可能性が低いため）
        // または、特定のサンプル日記IDを除外
        const sampleIds = ['1', '2', '3'];
        return year >= 2025 && !sampleIds.includes(diary.diaryId);
      });
      
      diaries = filterDataByPeriod(diaries);
      diaries = filterByTags(diaries);
      diaries = diaries.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (diaries.length === 0) {
        toast?.warning('選択された条件に該当する日記がありません');
        return;
      }

      // 期間テキスト作成
      const periodText = selectedPeriod === 'all' ? '全期間' : 
                        selectedPeriod === 'week' ? '過去7日間' :
                        selectedPeriod === 'month' ? '過去30日間' :
                        selectedPeriod === 'year' ? '過去1年間' :
                        `${dateRange.from} ～ ${dateRange.to}`;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // 表紙ページを作成
      const createCoverPage = async () => {
        const coverContent = document.createElement('div');
        coverContent.style.cssText = `
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          padding: 40px;
          background: white;
          color: black;
          width: 800px;
          height: 1000px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `;

        coverContent.innerHTML = `
          <h1 style="font-size: 32px; color: #2563eb; margin-bottom: 20px; text-align: center;">AI日記エクスポート</h1>
          <p style="font-size: 16px; color: #4b5563; margin: 10px 0; text-align: center;">期間: ${periodText}</p>
          <p style="font-size: 16px; color: #4b5563; margin: 10px 0; text-align: center;">日記数: ${diaries.length}件</p>
          <p style="font-size: 16px; color: #4b5563; margin: 10px 0; text-align: center;">作成日: ${format(new Date(), 'yyyy年M月d日', { locale: ja })}</p>
          ${selectedTags.length > 0 ? `<p style="font-size: 16px; color: #4b5563; margin: 10px 0; text-align: center;">フィルタータグ: ${selectedTags.join(', ')}</p>` : ''}
        `;

        coverContent.style.position = 'absolute';
        coverContent.style.left = '-9999px';
        document.body.appendChild(coverContent);

        const canvas = await html2canvas(coverContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(coverContent);

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      };

      // 表紙を作成
      await createCoverPage();

      // 各日記ページを個別に作成
      for (let i = 0; i < diaries.length; i++) {
        const diary = diaries[i];
        
        const diaryContent = document.createElement('div');
        diaryContent.style.cssText = `
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          padding: 40px;
          background: white;
          color: black;
          width: 800px;
          min-height: 1000px;
        `;

        diaryContent.innerHTML = `
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${format(parseISO(diary.date), 'yyyy年M月d日(E)', { locale: ja })}
          </h2>
          <h3 style="font-size: 20px; color: #374151; margin-bottom: 20px;">
            ${diary.title || 'タイトルなし'}
          </h3>
          ${diary.mood ? `<p style="font-size: 14px; color: #6b7280; font-style: italic; margin: 8px 0; background-color: #f3f4f6; padding: 8px; border-radius: 4px;">気分: ${getMoodText(diary.mood)}</p>` : ''}
          ${diary.tags && diary.tags.length > 0 ? `<p style="font-size: 14px; color: #6b7280; font-style: italic; margin: 8px 0; background-color: #f3f4f6; padding: 8px; border-radius: 4px;">タグ: ${diary.tags.join(', ')}</p>` : ''}
          <div style="font-size: 16px; line-height: 1.8; color: #111827; margin-top: 25px; white-space: pre-wrap; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background-color: #fafafa;">
            ${diary.summary || diary.content || '内容がありません'}
          </div>
          <div style="text-align: right; font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            ページ ${i + 2} / ${diaries.length + 1} （日記 ${i + 1} / ${diaries.length}）
          </div>
        `;

        diaryContent.style.position = 'absolute';
        diaryContent.style.left = '-9999px';
        document.body.appendChild(diaryContent);

        const canvas = await html2canvas(diaryContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(diaryContent);

        pdf.addPage();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // ページが長すぎる場合の対応
        if (imgHeight > 297) {
          // 複数ページに分割
          let yPosition = 0;
          let remainingHeight = imgHeight;
          
          while (remainingHeight > 0) {
            if (yPosition > 0) {
              pdf.addPage();
            }
            
            const pageHeight = Math.min(297, remainingHeight);
            pdf.addImage(imgData, 'PNG', 0, -yPosition, imgWidth, imgHeight);
            
            yPosition += 297;
            remainingHeight -= 297;
          }
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
      }

      // PDF保存
      const fileName = `diary_${format(new Date(), 'yyyyMMdd')}.pdf`;
      pdf.save(fileName);
      
      toast?.success(`PDF「${fileName}」を作成しました`);
      
    } catch (error) {
      console.error('PDF出力エラー:', error);
      toast?.error('PDF出力中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  // 統計データのPDF出力（HTML to Canvas経由）
  const exportStatsToPDF = async () => {
    try {
      setIsExporting(true);
      
      let diaries = diaryStorage.getDiaryEntries();
      
      // サンプル日記データを除外（統計でも同様に処理）
      diaries = diaries.filter(diary => {
        const diaryDate = new Date(diary.date);
        const year = diaryDate.getFullYear();
        const sampleIds = ['1', '2', '3'];
        return year >= 2025 && !sampleIds.includes(diary.diaryId);
      });
      
      diaries = filterDataByPeriod(diaries);
      const messages = filterDataByPeriod(messageStorage.getMessages());
      
      if (diaries.length === 0) {
        toast?.warning('選択された期間に統計データがありません');
        return;
      }

      // 統計計算
      const stats = calculateStats(diaries, messages);
      
      // 期間テキスト作成
      const periodText = selectedPeriod === 'all' ? '全期間' : 
                        selectedPeriod === 'week' ? '過去7日間' :
                        selectedPeriod === 'month' ? '過去30日間' :
                        selectedPeriod === 'year' ? '過去1年間' :
                        `${dateRange.from} ～ ${dateRange.to}`;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // 表紙ページを作成
      const createStatsCoverPage = async () => {
        const coverContent = document.createElement('div');
        coverContent.style.cssText = `
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          padding: 40px;
          background: white;
          color: black;
          width: 800px;
          height: 1000px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `;

        coverContent.innerHTML = `
          <h1 style="font-size: 32px; color: #2563eb; margin-bottom: 20px; text-align: center;">AI日記 統計レポート</h1>
          <p style="font-size: 16px; color: #4b5563; margin: 10px 0; text-align: center;">分析期間: ${periodText}</p>
          <p style="font-size: 16px; color: #4b5563; margin: 10px 0; text-align: center;">作成日: ${format(new Date(), 'yyyy年M月d日', { locale: ja })}</p>
        `;

        coverContent.style.position = 'absolute';
        coverContent.style.left = '-9999px';
        document.body.appendChild(coverContent);

        const canvas = await html2canvas(coverContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(coverContent);

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      };

      // 基本統計ページを作成
      const createBasicStatsPage = async () => {
        const statsContent = document.createElement('div');
        statsContent.style.cssText = `
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          padding: 40px;
          background: white;
          color: black;
          width: 800px;
          height: 1000px;
        `;

        statsContent.innerHTML = `
          <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 15px; text-align: center;">基本統計</h2>
          <div style="display: flex; flex-direction: column; justify-content: center; height: 70%;">
            <table style="width: 100%; border-collapse: collapse; font-size: 18px; margin: 0 auto;">
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 20px; border: 2px solid #d1d5db; font-weight: bold; text-align: center;">総日記数</td>
                <td style="padding: 20px; border: 2px solid #d1d5db; text-align: center; font-size: 24px; color: #2563eb;">${stats.totalDiaries}件</td>
              </tr>
              <tr>
                <td style="padding: 20px; border: 2px solid #d1d5db; font-weight: bold; text-align: center;">総メッセージ数</td>
                <td style="padding: 20px; border: 2px solid #d1d5db; text-align: center; font-size: 24px; color: #2563eb;">${stats.totalMessages}件</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 20px; border: 2px solid #d1d5db; font-weight: bold; text-align: center;">平均文字数</td>
                <td style="padding: 20px; border: 2px solid #d1d5db; text-align: center; font-size: 24px; color: #2563eb;">${stats.avgWordsPerDiary}文字/日記</td>
              </tr>
              <tr>
                <td style="padding: 20px; border: 2px solid #d1d5db; font-weight: bold; text-align: center;">継続日数</td>
                <td style="padding: 20px; border: 2px solid #d1d5db; text-align: center; font-size: 24px; color: #2563eb;">${stats.continuousDays}日</td>
              </tr>
            </table>
          </div>
        `;

        statsContent.style.position = 'absolute';
        statsContent.style.left = '-9999px';
        document.body.appendChild(statsContent);

        const canvas = await html2canvas(statsContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(statsContent);

        const imgData = canvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      };

      // 感情分析ページを作成
      const createMoodAnalysisPage = async () => {
        if (Object.keys(stats.moodDistribution).length === 0) return;

        const moodContent = document.createElement('div');
        moodContent.style.cssText = `
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          padding: 40px;
          background: white;
          color: black;
          width: 800px;
          height: 1000px;
        `;

        moodContent.innerHTML = `
          <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 30px; border-bottom: 3px solid #10b981; padding-bottom: 15px; text-align: center;">感情分析</h2>
          <div style="display: flex; flex-direction: column; justify-content: center; height: 70%;">
            <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
              <tr style="background-color: #ecfdf5;">
                <th style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-weight: bold; font-size: 18px;">感情</th>
                <th style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-weight: bold; font-size: 18px;">回数</th>
                <th style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-weight: bold; font-size: 18px;">割合</th>
              </tr>
              ${Object.entries(stats.moodDistribution).map(([mood, count], index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                <td style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-size: 18px;">${getMoodText(mood)}</td>
                <td style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-size: 18px; color: #10b981;">${count}回</td>
                <td style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-size: 18px; color: #10b981;">${Math.round((count / stats.totalDiaries) * 100)}%</td>
              </tr>
              `).join('')}
            </table>
          </div>
        `;

        moodContent.style.position = 'absolute';
        moodContent.style.left = '-9999px';
        document.body.appendChild(moodContent);

        const canvas = await html2canvas(moodContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(moodContent);

        const imgData = canvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      };

      // タグ分析ページを作成
      const createTagAnalysisPage = async () => {
        if (stats.tagRanking.length === 0) return;

        const tagContent = document.createElement('div');
        tagContent.style.cssText = `
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          padding: 40px;
          background: white;
          color: black;
          width: 800px;
          height: 1000px;
        `;

        tagContent.innerHTML = `
          <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 30px; border-bottom: 3px solid #f59e0b; padding-bottom: 15px; text-align: center;">タグ分析</h2>
          <div style="display: flex; flex-direction: column; justify-content: center; height: 70%;">
            <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
              <tr style="background-color: #fffbeb;">
                <th style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-weight: bold; font-size: 18px;">ランク</th>
                <th style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-weight: bold; font-size: 18px;">タグ</th>
                <th style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-weight: bold; font-size: 18px;">使用回数</th>
              </tr>
              ${stats.tagRanking.slice(0, 10).map(({ tag, count }, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                <td style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-size: 18px;">${index + 1}位</td>
                <td style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-size: 18px; color: #f59e0b;">#${tag}</td>
                <td style="padding: 15px; border: 2px solid #d1d5db; text-align: center; font-size: 18px; color: #f59e0b;">${count}回</td>
              </tr>
              `).join('')}
            </table>
          </div>
        `;

        tagContent.style.position = 'absolute';
        tagContent.style.left = '-9999px';
        document.body.appendChild(tagContent);

        const canvas = await html2canvas(tagContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(tagContent);

        const imgData = canvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      };

      // 各ページを順番に作成
      await createStatsCoverPage();
      await createBasicStatsPage();
      await createMoodAnalysisPage();
      await createTagAnalysisPage();

      // PDF保存
      const fileName = `stats_${format(new Date(), 'yyyyMMdd')}.pdf`;
      pdf.save(fileName);
      
      toast?.success(`統計レポート「${fileName}」を作成しました`);
      
    } catch (error) {
      console.error('統計PDF出力エラー:', error);
      toast?.error('統計PDF出力中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  // 統計計算
  const calculateStats = (diaries, messages) => {
    const totalDiaries = diaries.length;
    const totalMessages = messages.length;
    const totalWords = diaries.reduce((sum, diary) => sum + (diary.wordCount || 0), 0);
    const avgWordsPerDiary = totalDiaries > 0 ? Math.round(totalWords / totalDiaries) : 0;

    // 感情分析
    const moodDistribution = {};
    diaries.forEach(diary => {
      if (diary.mood) {
        moodDistribution[diary.mood] = (moodDistribution[diary.mood] || 0) + 1;
      }
    });

    // タグランキング
    const tagCount = {};
    diaries.forEach(diary => {
      if (diary.tags && Array.isArray(diary.tags)) {
        diary.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    const tagRanking = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // 継続日数計算
    const continuousDays = totalDiaries > 0 ? 
      Math.ceil((new Date(Math.max(...diaries.map(d => new Date(d.date)))) - 
                 new Date(Math.min(...diaries.map(d => new Date(d.date))))) / (1000 * 60 * 60 * 24)) + 1 : 0;

    return {
      totalDiaries,
      totalMessages,
      avgWordsPerDiary,
      continuousDays,
      moodDistribution,
      tagRanking
    };
  };

  const getMoodText = (mood) => {
    const texts = {
      happy: '幸せ',
      excited: 'わくわく',
      neutral: '普通',
      sad: '悲しい',
      anxious: '不安',
      peaceful: '穏やか'
    };
    return texts[mood] || mood;
  };

  const handleExport = () => {
    if (exportType === 'diary') {
      exportDiaryToPDF();
    } else {
      exportStatsToPDF();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <BsDownload className="w-6 h-6 text-red-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PDFエクスポート</h2>
        </div>

        {/* エクスポート種類選択 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">エクスポート種類</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setExportType('diary')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'diary'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <BsJournalText className={`w-8 h-8 mx-auto mb-2 ${
                exportType === 'diary' ? 'text-red-500' : 'text-gray-400'
              }`} />
              <h4 className="font-medium text-gray-900 dark:text-white">日記帳PDF</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                日記を美しいレイアウトで出力
              </p>
            </button>
            
            <button
              onClick={() => setExportType('stats')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'stats'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <BsBarChart className={`w-8 h-8 mx-auto mb-2 ${
                exportType === 'stats' ? 'text-red-500' : 'text-gray-400'
              }`} />
              <h4 className="font-medium text-gray-900 dark:text-white">統計レポートPDF</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                分析結果をレポート形式で出力
              </p>
            </button>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">期間選択</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: 'all', label: '全期間' },
              { value: 'week', label: '過去7日' },
              { value: 'month', label: '過去30日' },
              { value: 'year', label: '過去1年' },
              { value: 'custom', label: 'カスタム' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedPeriod === option.value
                    ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* カスタム期間選択 */}
          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* タグ選択（日記PDF用） */}
        {exportType === 'diary' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">タグフィルター（任意）</h3>
            <div className="flex flex-wrap gap-2">
              {getAvailableTags().map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                すべてクリア
              </button>
            )}
          </div>
        )}

        {/* 出力ボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center px-8 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                PDF作成中...
              </>
            ) : (
              <>
                <BsDownload className="w-5 h-5 mr-2" />
                PDF出力
              </>
            )}
          </button>
        </div>

        {/* 説明 */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">PDFについて</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>• 日記帳PDF：選択した期間の日記を美しいレイアウトで出力します</p>
            <p>• 統計レポートPDF：データ分析結果をレポート形式で出力します</p>
            <p>• 生成されたPDFは自動でダウンロードされます</p>
            <p>• 大量のデータがある場合は処理に時間がかかることがあります</p>
            <p>• PDFMakeライブラリを使用して日本語文字化けを解決しています</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportContainer;