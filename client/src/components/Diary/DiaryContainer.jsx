import React, { useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';
import DiaryCalendar from './DiaryCalendar';
import DiaryEntry from './DiaryEntry';
import { diaryStorage } from '../../utils/localStorage';

const DiaryContainer = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'entry'
  const [diaryEntries, setDiaryEntries] = useState([]);

  // サンプル日記データ（初回起動時のみ使用）
  const sampleDiaryEntries = [
    {
      diaryId: '1',
      date: '2024-12-19',
      title: '充実した一日',
      summary: `今日は朝から新しいプロジェクトについての会議がありました。とても刺激的で、チーム全体が同じ方向を向いて進んでいることを実感できました。

午後は久しぶりに散歩をして、近所の公園で桜のつぼみを見つけました。まだ冬ですが、少しずつ春の準備が始まっているんだなと感じました。

夕方は友人と電話で話し、最近の近況を報告し合いました。お互い忙しくてなかなか会えませんが、変わらず良い関係を維持できていることがうれしいです。

今日は全体的にポジティブな出来事が多く、気持ちの良い一日でした。明日も同じような気持ちで過ごせたらいいなと思います。`,
      mood: 'happy',
      highlights: [
        '新プロジェクトの会議で良いアイデアが出た',
        '公園で桜のつぼみを発見',
        '友人との電話で近況報告'
      ],
      tags: ['仕事', '自然', '友人', 'ポジティブ'],
      wordCount: 184,
      createdAt: '2024-12-19T23:30:00Z',
      updatedAt: '2024-12-19T23:30:00Z'
    },
    {
      diaryId: '2',
      date: '2024-12-18',
      title: '静かな読書の時間',
      summary: `今日は雨が降っていたので、家でゆっくり過ごしました。午前中は前から読みたいと思っていた本を読み進めることができました。

本の内容がとても興味深く、時間を忘れて読みふけってしまいました。特に主人公の成長していく過程が印象的で、自分自身の経験と重ね合わせながら読むことができました。

午後は友人からのメッセージに返事を書いたり、部屋の整理をしたりして過ごしました。普段忙しくてできないことをゆっくりできて、心が落ち着きました。

雨の日も悪くないなと思った一日でした。`,
      mood: 'peaceful',
      highlights: [
        '興味深い本を読み進めた',
        '主人公の成長に共感',
        '部屋の整理で心がすっきり'
      ],
      tags: ['読書', 'インドア', '自分時間', '雨'],
      wordCount: 142,
      createdAt: '2024-12-18T22:15:00Z',
      updatedAt: '2024-12-18T22:15:00Z'
    },
    {
      diaryId: '3',
      date: '2024-12-17',
      title: 'ちょっと疲れた一日',
      summary: `今日は朝から会議が続いて、なかなか集中できませんでした。資料の準備に時間がかかってしまい、予定していた他の作業が後回しになってしまいました。

昼休みも短くなってしまい、十分に休憩を取れませんでした。午後も引き続き忙しく、一日があっという間に過ぎてしまった感じです。

帰宅後は疲れていましたが、好きな音楽を聞いて少しリラックスできました。明日はもう少し効率よく進められるように、今日の反省を活かしたいと思います。

忙しい日もありますが、それもまた成長の一部だと前向きに捉えるようにしています。`,
      mood: 'neutral',
      highlights: [
        '会議が多くて忙しかった',
        '好きな音楽でリラックス',
        '明日への改善点を見つけた'
      ],
      tags: ['仕事', '忙しい', '音楽', 'リフレクション'],
      wordCount: 156,
      createdAt: '2024-12-17T23:45:00Z',
      updatedAt: '2024-12-17T23:45:00Z'
    }
  ];

  // 初期化時にLocalStorageから日記データを読み込み
  useEffect(() => {
    const savedEntries = diaryStorage.getDiaryEntries();
    
    if (savedEntries.length === 0) {
      // 初回起動時はサンプルデータを保存
      diaryStorage.saveDiaryEntries(sampleDiaryEntries);
      setDiaryEntries(sampleDiaryEntries);
    } else {
      // 保存済み日記データを復元
      setDiaryEntries(savedEntries);
    }
  }, []);

  // 日付選択時の処理
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // 選択された日付の日記エントリーを探す
    const entry = diaryEntries.find(entry => 
      isSameDay(new Date(entry.date), date)
    );
    
    if (entry) {
      setSelectedEntry(entry);
      setViewMode('entry');
    } else {
      setSelectedEntry(null);
      // モバイルでは日記がない場合はカレンダービューを維持
      if (window.innerWidth >= 768) {
        setViewMode('entry'); // デスクトップでは空の状態を表示
      }
    }
  };

  // カレンダーに戻る
  const handleBackToCalendar = () => {
    setViewMode('calendar');
    setSelectedEntry(null);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* モバイル: カレンダーまたは日記詳細 */}
      <div className="md:hidden h-full">
        {viewMode === 'calendar' ? (
          <DiaryCalendar 
            diaryEntries={diaryEntries}
            onDateSelect={handleDateSelect}
          />
        ) : (
          <DiaryEntry 
            entry={selectedEntry}
            onBack={handleBackToCalendar}
          />
        )}
      </div>

      {/* デスクトップ: 分割ビュー */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5">
        <DiaryCalendar 
          diaryEntries={diaryEntries}
          onDateSelect={handleDateSelect}
        />
      </div>
      
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 md:ml-4">
        <DiaryEntry 
          entry={selectedEntry}
          onBack={handleBackToCalendar}
        />
      </div>
    </div>
  );
};

export default DiaryContainer;