// API接続がない場合のモック機能

// APIサーバー接続状況をチェック
let isAPIAvailable = false;

// APIサーバーの可用性をチェック
export const checkAPIAvailability = async () => {
  try {
    const response = await fetch('/api/health', { 
      method: 'GET',
      timeout: 3000 
    });
    isAPIAvailable = response.ok;
    return isAPIAvailable;
  } catch (error) {
    isAPIAvailable = false;
    return false;
  }
};

// モックチャット応答
export const mockChatResponse = {
  content: "申し訳ございません。現在APIサーバーがデプロイされていないため、チャット機能は利用できません。\n\n代わりに以下の機能をお試しください：\n• 📊 統計画面で過去のデータを確認\n• 📄 PDF出力機能\n• 🌙 ダークモード切替\n• 💾 データのエクスポート/インポート",
  fallback: true
};

// モック日記生成応答
export const mockDiaryResponse = {
  title: "API未接続",
  summary: "現在APIサーバーがデプロイされていないため、自動日記生成機能は利用できません。手動で日記を書くか、APIサーバーのデプロイ完了をお待ちください。",
  mood: "neutral",
  highlights: ["API未接続", "サーバーデプロイ待ち"],
  tags: ["システム", "準備中"],
  wordCount: 50,
  fallback: true
};

// APIが利用可能かどうかを返す
export const isAPIServerAvailable = () => isAPIAvailable;

export default {
  checkAPIAvailability,
  mockChatResponse,
  mockDiaryResponse,
  isAPIServerAvailable
};