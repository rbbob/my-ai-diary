# Daily Companion 📅

AI会話パートナーとの日記自動生成アプリ

**毎日の会話から自動で日記を生成する、あなただけのAIコンパニオン**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Built with](https://img.shields.io/badge/built_with-Claude_Code-purple.svg)

## ✨ 主な機能

### 🗣️ **AIチャット**
- OpenAI GPT-4o-mini による自然な会話
- パーソナライズされた性格設定（フレンドリー、丁寧、カジュアル、サポート重視）
- リアルタイムタイピングインジケーター
- 会話履歴の永続保存

### 📖 **自動日記生成**
- 1日の会話から自動で日記を生成
- 感情分析による気分の記録
- ハイライト抽出とタグ付け
- カレンダー表示で振り返り

### 💾 **データ管理**
- LocalStorage による完全ローカル保存
- データのエクスポート/インポート機能
- プライバシー重視（データは端末内のみ）
- 設定の永続化

### 📱 **レスポンシブデザイン**
- LINE/WhatsApp風のモダンUI
- スマホ・デスクトップ完全対応
- 直感的なナビゲーション

## 🚀 クイックスタート

### 前提条件
- Node.js 18+ 
- npm または yarn
- OpenAI API キー（オプション）

### 1. プロジェクトのクローン
```bash
git clone https://github.com/yourusername/daily-companion.git
cd daily-companion
```

### 2. 依存関係のインストール

**クライアント:**
```bash
cd client
npm install
```

**サーバー:**
```bash
cd server
npm install
```

### 3. 環境設定

**server/.env** を作成：
```bash
# Server Configuration
PORT=3002
NODE_ENV=development

# OpenAI Configuration (必要に応じて設定)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

### 4. アプリケーション起動

**サーバー起動:**
```bash
cd server
npm run dev
```

**クライアント起動 (別ターミナル):**
```bash
cd client  
npm run dev
```

### 5. アクセス
ブラウザで `http://localhost:5173` を開く

## 📂 プロジェクト構造

```
daily-companion/
├── client/                 # React フロントエンド
│   ├── src/
│   │   ├── components/     # UIコンポーネント
│   │   │   ├── Chat/       # チャット関連
│   │   │   ├── Diary/      # 日記関連
│   │   │   ├── Layout/     # レイアウト
│   │   │   └── Settings/   # 設定
│   │   ├── services/       # API連携
│   │   ├── utils/          # ユーティリティ
│   │   └── styles/         # スタイル
│   └── package.json
│
├── server/                 # Node.js バックエンド
│   ├── src/
│   │   ├── routes/         # API ルート
│   │   ├── services/       # OpenAI連携等
│   │   └── middleware/     # ミドルウェア
│   └── package.json
│
└── README.md
```

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - UIフレームワーク
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **Axios** - HTTP クライアント
- **date-fns** - 日付処理
- **React Icons** - アイコン

### バックエンド  
- **Node.js 18+** - ランタイム
- **Express.js** - Webフレームワーク
- **OpenAI SDK** - AI機能
- **Helmet** - セキュリティ
- **CORS** - クロスオリジン対応

## 🔧 設定オプション

### AI設定
- **ユーザー名**: チャットで使用される名前
- **AI名**: AIアシスタントの名前
- **性格設定**: フレンドリー / 丁寧 / カジュアル / サポート重視

### 日記設定
- **自動生成**: 毎日決まった時間に自動生成
- **生成時刻**: 23:59 など任意の時刻

### データ管理
- **エクスポート**: JSON形式でバックアップ
- **インポート**: バックアップからの復元
- **削除**: 全データの安全な削除

## 🔒 プライバシーとセキュリティ

- **ローカル保存**: 全データは端末内のLocalStorageに保存
- **エンドツーエンド**: OpenAI以外の第三者にデータは送信されません
- **レート制限**: API乱用防止
- **HTTPS対応**: 本番環境推奨

## 📱 使い方

### 基本的な使い方
1. **チャット**: AIと自由に会話
2. **設定**: 名前や性格をカスタマイズ  
3. **日記確認**: カレンダーで過去の日記を閲覧
4. **データ管理**: バックアップの取得

### スマホでの使い方
- 画面下部のナビゲーションでタブ切り替え
- 日記画面では日付タップで詳細表示
- 左上の「← カレンダー」で戻る

### デスクトップでの使い方
- 上部タブでページ切り替え
- 日記画面は左右分割表示
- マウスオーバーで詳細な操作

## 🚧 開発状況

- ✅ **Phase 1**: プロジェクト基盤構築
- ✅ **Phase 2**: UI/UX実装  
- ✅ **Phase 3**: データ永続化
- ✅ **Phase 4**: OpenAI API連携
- 🎯 **Phase 5**: 本格運用・拡張機能

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は `LICENSE` ファイルをご覧ください。

## 🙋‍♂️ サポート

質問や問題がある場合は、[Issues](https://github.com/yourusername/daily-companion/issues) ページで報告してください。

## 🎉 謝辞

このプロジェクトは [Claude Code](https://claude.ai/code) を使用して開発されました。

---

**Built with ❤️ using Claude Code**