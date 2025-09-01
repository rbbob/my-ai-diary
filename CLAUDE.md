# Claude Code 開発メモ

このファイルはClaude Codeでの開発プロセスと重要な設定を記録するためのファイルです。

## 🔧 開発環境設定

### サーバー起動コマンド
```bash
cd server && npm run dev
```
- **ポート**: 3002
- **環境**: development
- **OpenAI API**: フォールバックモード対応

### クライアント起動コマンド  
```bash
cd client && npm run dev
```
- **ポート**: 5173
- **プロキシ**: http://localhost:3002/api

### 同時起動
両方のサービスを同時に起動する場合：
```bash
# ターミナル1
cd server && npm run dev

# ターミナル2  
cd client && npm run dev
```

## 🔑 重要な設定

### OpenAI API設定
**ファイル**: `server/.env`
```bash
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 本番運用時の注意点
1. **APIキー設定**: 実際のOpenAI APIキーを設定
2. **レート制限**: 現在100リクエスト/15分
3. **プライバシー**: 全データはLocalStorageに保存

## 📁 主要ファイル

### フロントエンド
- `client/src/App.jsx` - メインアプリケーション
- `client/src/components/Chat/ChatContainer.jsx` - チャット機能
- `client/src/components/Diary/DiaryContainer.jsx` - 日記機能  
- `client/src/utils/localStorage.js` - データ管理
- `client/vite.config.js` - プロキシ設定

### バックエンド
- `server/src/index.js` - サーバーメイン
- `server/src/services/openaiService.js` - AI機能
- `server/src/routes/chat.js` - チャットAPI
- `server/src/routes/diary.js` - 日記API
- `server/.env` - 環境変数

## 🐛 トラブルシューティング

### よくある問題

**1. サーバーが起動しない**
```bash
# ポート確認
lsof -i :3002

# プロセス停止
pkill -f "node.*src/index.js"
```

**2. OpenAI API エラー**
- `.env`ファイルでAPIキー確認
- フォールバックモードで動作確認

**3. クライアントとサーバーの通信エラー**
- Vite設定でプロキシ確認: `localhost:3002`
- CORS設定確認

### デバッグ用コマンド
```bash
# サーバーヘルスチェック
curl http://localhost:3002/api/health

# テストエンドポイント
curl http://localhost:3002/api/test
```

## 🚀 デプロイメント準備

### 環境変数チェックリスト
- [ ] `OPENAI_API_KEY` - 本物のAPIキー
- [ ] `NODE_ENV=production`
- [ ] `PORT` - 本番用ポート
- [ ] `RATE_LIMIT_MAX` - 本番用制限

### ビルドコマンド
```bash
# クライアント
cd client && npm run build

# サーバー  
cd server && npm run start
```

## 📊 開発進捗

### 完了済み機能 ✅
- [x] 基本UI/UXレイアウト
- [x] レスポンシブデザイン
- [x] チャット機能（モック + API）
- [x] 日記表示・カレンダー
- [x] LocalStorageデータ管理
- [x] 設定画面・個人化
- [x] データエクスポート/インポート
- [x] OpenAI API統合
- [x] フォールバックモード

### 今後の拡張予定 🔄
- [ ] 本格的な日記自動生成スケジュール
- [ ] データベース統合（Firebase等）
- [ ] プッシュ通知
- [ ] 多言語対応
- [ ] テーマ機能
- [ ] 音声入力対応

## 💡 技術的な決定事項

### アーキテクチャ
- **フロントエンド**: React + Vite（SPA）
- **バックエンド**: Node.js + Express（REST API）
- **データ保存**: LocalStorage（Phase 1）
- **AI**: OpenAI GPT-4o-mini

### セキュリティ
- Helmet.js でセキュリティヘッダー
- CORS設定でオリジン制限
- レート制限でスパム防止
- APIキーはサーバーサイドのみ

### パフォーマンス
- Vite での高速開発
- LocalStorageでオフライン動作
- コンポーネント分割で再利用性向上

## 🎯 品質管理

### チェックポイント
- [ ] 全機能が正常に動作するか
- [ ] レスポンシブデザインが適切か
- [ ] データの永続化が機能するか
- [ ] エラーハンドリングが適切か
- [ ] APIレスポンス時間が適切か

## 📝 開発ログ

### 2024-12-19 (開発開始)
- プロジェクト初期設定
- 基本UI実装
- LocalStorage統合
- OpenAI API連携
- ドキュメント整備

---

**開発環境**: Claude Code
**最終更新**: 2024-12-19