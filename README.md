# AI日記アプリ

AI技術を活用した個人日記アプリケーションです。React + Viteフロントエンドと Node.js + Express バックエンドで構築されており、OpenAI GPT-4o-miniを使用した自然な会話機能と自動日記生成機能を提供します。

## 🚀 特徴

- **インテリジェントチャット**: OpenAI GPT-4o-miniを使用した自然な会話
- **自動日記生成**: チャット履歴から日記を自動生成
- **カレンダービュー**: 月間カレンダーで日記エントリーを視覚的に管理
- **データ管理**: LocalStorageでオフライン対応、エクスポート/インポート機能
- **レスポンシブデザイン**: モバイル・デスクトップ両対応
- **プライバシー重視**: 全データはローカルに保存

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: React 18
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS
- **アイコン**: React Icons (Bootstrap Icons)
- **状態管理**: React Hooks + LocalStorage
- **日付処理**: date-fns

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Express.js
- **AI統合**: OpenAI API (GPT-4o-mini)
- **セキュリティ**: Helmet.js, CORS
- **レート制限**: express-rate-limit

## 🚀 クイックスタート

### 必要な環境
- Node.js (v16以上)
- npm または yarn
- OpenAI API キー

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd my-ai-diary
```

2. 依存関係をインストール
```bash
# バックエンド
cd server
npm install

# フロントエンド  
cd ../client
npm install
```

3. 環境変数の設定
```bash
# server/.env ファイルを作成
cd ../server
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
echo "OPENAI_MODEL=gpt-4o-mini" >> .env
```

4. 開発サーバーの起動
```bash
# ターミナル1: バックエンドサーバー
cd server
npm run dev

# ターミナル2: フロントエンドサーバー
cd client
npm run dev
```

5. ブラウザで確認
- フロントエンド: http://localhost:5176
- バックエンド: http://localhost:3004

## 🏗️ プロジェクト構成

```
my-ai-diary/
├── client/                  # React フロントエンド
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/        # チャット機能
│   │   │   ├── Diary/       # 日記機能
│   │   │   └── Settings/    # 設定画面
│   │   ├── utils/
│   │   │   └── localStorage.js  # データ管理
│   │   └── App.jsx
│   ├── vite.config.js       # Vite設定
│   └── package.json
├── server/                  # Node.js バックエンド
│   ├── src/
│   │   ├── routes/          # APIルート
│   │   ├── services/        # ビジネスロジック
│   │   └── index.js         # サーバーエントリーポイント
│   ├── .env                 # 環境変数
│   └── package.json
├── docs/                    # ドキュメント
└── README.md
```

## 📱 主要機能

### チャット機能
- AI とのリアルタイム会話
- チャット履歴の永続化
- コンテキスト理解
- フォールバックモード対応

### 日記機能
- カレンダーベースの日記管理
- チャット履歴からの自動生成
- 手動編集機能
- 日記エントリーの検索・フィルタ

### 設定機能
- ユーザープロファイル管理
- AI personality 設定
- データのエクスポート/インポート
- アプリ統計表示

## 🔧 設定

### OpenAI API設定
1. [OpenAI Platform](https://platform.openai.com/) でアカウント作成
2. API キーを生成
3. `server/.env` に設定

### プロキシ設定
開発環境では Vite が自動的にプロキシを設定：
- フロントエンド: localhost:5176
- バックエンド: localhost:3004
- API プロキシ: /api → localhost:3004

## 🐛 トラブルシューティング

### よくある問題

**サーバーが起動しない**
```bash
# ポート確認
netstat -ano | findstr :3004
# プロセス停止
taskkill /PID <PID番号> /F
```

**OpenAI API エラー**
- `.env` ファイルの API キー確認
- OpenAI アカウントの利用可能クレジット確認
- レート制限の確認

**フロントエンドの通信エラー**
- バックエンドサーバーの起動確認
- プロキシ設定の確認（vite.config.js）

### デバッグ用コマンド
```bash
# バックエンドヘルスチェック
curl http://localhost:3004/api/health

# フロントエンドビルドテスト
cd client && npm run build
```

## 📊 開発状況

### 完了済み機能 ✅
- [x] 基本UI/UXレイアウト
- [x] チャット機能
- [x] 日記表示・カレンダー
- [x] OpenAI API統合
- [x] データ管理（LocalStorage）
- [x] 設定画面
- [x] データエクスポート/インポート
- [x] レスポンシブデザイン

### 今後の予定 🔄
- [ ] データベース統合
- [ ] プッシュ通知
- [ ] 多言語対応
- [ ] テーマ機能
- [ ] 音声入力対応

## 🚀 本番デプロイ

### ビルド
```bash
# フロントエンド
cd client && npm run build

# バックエンド
cd server && npm run start
```

### 環境変数（本番）
```bash
NODE_ENV=production
PORT=8080
OPENAI_API_KEY=your-production-api-key
RATE_LIMIT_MAX=1000
```

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 貢献

1. プロジェクトをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題や質問がある場合は、GitHub Issues で報告してください。

---

**開発**: Claude Code  
**最終更新**: 2025-09-02