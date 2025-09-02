# Claude Code 開発メモ - AI日記アプリ

このファイルはClaude Codeでの開発プロセスと重要な設定を記録するためのファイルです。

## 🔧 開発環境設定

### サーバー起動コマンド
```bash
cd server && npm run dev
```
- **ポート**: 3004
- **環境**: development
- **OpenAI API**: GPT-4o-mini対応

### クライアント起動コマンド  
```bash
cd client && npm run dev
```
- **ポート**: 5176
- **プロキシ**: http://localhost:3004/api

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
netstat -ano | findstr :3004

# プロセス停止
taskkill /PID <PID番号> /F
```

**2. OpenAI API エラー**
- `.env`ファイルでAPIキー確認
- dotenv.config()の実行順序確認
- GPT-4o-miniモデルの使用確認

**3. クライアントとサーバーの通信エラー**
- Vite設定でプロキシ確認: `localhost:3004`
- CORS設定確認

**4. TailwindCSS適用されない**
- PostCSS設定確認: `@tailwindcss/postcss`
- npm installでパッケージ確認

### デバッグ用コマンド
```bash
# サーバーヘルスチェック
curl http://localhost:3004/api/health

# テストエンドポイント
curl http://localhost:3004/api/test
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
- [x] 日記自動生成機能
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

## 🛠️ トラブルシューティング・開発記録 (2025-09-02)

### 問題1: チャット機能の不自然な応答
**症状**: フォールバックモードでランダムな定型応答が返される
**原因**: OpenAI APIキーが正しく読み込まれていない（dotenv設定の問題）
**解決策**:
```javascript
// openaiService.jsの冒頭に追加
import dotenv from 'dotenv';
dotenv.config();
```

### 問題2: 日記生成ボタンが見つからない
**症状**: 日記生成機能がUIに実装されていない
**解決策**: DiaryEntry.jsxに日記生成ボタンとAPIコールを追加
```javascript
const generateDiary = async () => {
  // チャット履歴を取得してAPIに送信
  const messages = messageStorage.getMessages();
  const response = await fetch('/api/diary/generate', {...});
};
```

### 問題3: 日記生成でJSON形式エラー
**症状**: `response_format: 'json_object' is not supported with this model`
**原因**: GPT-4モデルがJSON形式をサポートしていない
**解決策**: GPT-4o-miniに変更
```javascript
model: 'gpt-4o-mini', // JSON response_formatをサポート
```

### 問題4: LocalStorage関数名の不一致
**症状**: `diaryStorage.getDiaries is not a function`
**原因**: 実際の関数名は`getDiaryEntries()`
**解決策**: 正しい関数名を使用
```javascript
const existingDiaries = diaryStorage.getDiaryEntries();
diaryStorage.saveDiaryEntries(updatedDiaries);
```

### 問題5: TailwindCSS PostCSS設定エラー
**症状**: PostCSS plugin configuration error
**解決策**: `@tailwindcss/postcss`パッケージをインストールし設定変更
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

### 成功した機能
- [x] OpenAI API連携（GPT-4o-mini）
- [x] 文脈理解チャット機能  
- [x] 自動日記生成（チャット内容から）
- [x] データエクスポート/インポート
- [x] 日記カレンダー表示
- [x] ローカルストレージによるデータ管理

### 現在の設定（動作確認済み）
- **サーバーポート**: 3004
- **クライアントポート**: 5176  
- **OpenAI モデル**: gpt-4o-mini
- **APIキー**: 設定済み・動作確認済み

## 📝 開発セッション詳細記録 (2025-09-02)

### 開発の流れ
1. **プロジェクト確認** → `develop/my-ai-diary`から`my-project`に移動
2. **サーバー起動問題** → TailwindCSS設定エラーの修正
3. **チャット機能修復** → フォールバック応答の改善
4. **OpenAI API接続** → dotenv読み込み順序の修正
5. **日記生成機能追加** → UIボタンの実装とAPI連携
6. **モデル互換性修正** → GPT-4からGPT-4o-miniへの変更
7. **データ管理機能確認** → エクスポート/インポート機能の動作確認
8. **ドキュメント整備** → README.md及びClaude.md作成

### 重要な学び
- **dotenv.config()の実行タイミング**が重要
- **OpenAIモデルごとの機能差異**に注意が必要
- **ローカルストレージの関数名**を正確に把握する
- **クライアント・サーバー間のプロキシ設定**の確認
- **TailwindCSS PostCSS設定**の正確な記述

### 次回の改善点
- [ ] より詳細なエラーハンドリング
- [ ] ユーザー向けの分かりやすいエラーメッセージ
- [ ] OpenAI APIのレート制限対策
- [ ] データベース連携の検討
- [ ] ユニットテストの追加

## 🔄 継続的な改善

### パフォーマンス監視
- API応答時間の記録
- LocalStorageサイズの監視
- メモリ使用量の最適化

### ユーザビリティ向上
- ユーザーフィードバックの収集
- A/Bテストの実施
- アクセシビリティの向上

---

**開発環境**: Claude Code
**開発セッション**: 2025-09-02 
**最終更新**: 2025-09-02