# AI日記アプリ 開発記録

Claude Codeでの開発プロセスと重要な設定・トラブルシューティングを記録したファイルです。

## 🔧 開発環境設定

### サーバー起動コマンド
```bash
cd server && npm run dev
```
- **ポート**: 3004
- **環境**: development
- **OpenAI API**: GPT-4o-mini使用

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
PORT=3004
OPENAI_API_KEY=sk-proj-cT...
OPENAI_MODEL=gpt-4o-mini
```

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

### 問題5: TailwindCSS設定エラー
**症状**: PostCSS plugin moved to separate package
**解決策**: @tailwindcss/postcssパッケージをインストール
```bash
npm install @tailwindcss/postcss
```
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

## ✅ 成功した機能
- [x] OpenAI API連携（GPT-4o-mini）
- [x] 文脈理解チャット機能  
- [x] 自動日記生成（チャット内容から）
- [x] データエクスポート/インポート
- [x] 日記カレンダー表示
- [x] ローカルストレージによるデータ管理

## 📝 開発セッション詳細記録 (2025-09-02)

### 開発の流れ
1. **プロジェクト確認** → `develop/my-ai-diary`から`my-project`に移動
2. **サーバー起動問題** → TailwindCSS設定エラーの修正
3. **チャット機能修復** → フォールバック応答の改善
4. **OpenAI API接続** → dotenv読み込み順序の修正
5. **日記生成機能追加** → UIボタンの実装とAPI連携
6. **モデル互換性修正** → GPT-4からGPT-4o-miniへの変更
7. **データ管理機能確認** → エクスポート/インポート機能の動作確認

### 重要な学び
- **dotenv.config()の実行タイミング**が重要
- **OpenAIモデルごとの機能差異**に注意が必要
- **ローカルストレージの関数名**を正確に把握する
- **クライアント・サーバー間のプロキシ設定**の確認
- **文字エンコーディング**の問題に注意

### 現在の動作確認済み設定
- **サーバーポート**: 3004
- **クライアントポート**: 5176  
- **OpenAI モデル**: gpt-4o-mini
- **APIキー**: 設定済み・動作確認済み
- **プロキシ設定**: http://localhost:3004

## 🎯 動作確認済み機能

### チャット機能
- 自然な会話応答
- 文脈理解
- 感情分析
- メッセージ履歴保存

### 日記機能
- チャット履歴からの自動生成
- 日付別表示
- カレンダー形式
- タイトル・ハイライト・タグ自動生成

### データ管理
- LocalStorageによる永続化
- エクスポート（JSONファイル）
- インポート（バックアップ復元）
- データ削除・リセット

## 🔄 次回の改善点
- [ ] より詳細なエラーハンドリング
- [ ] ユーザー向けの分かりやすいエラーメッセージ
- [ ] OpenAI APIのレート制限対策
- [ ] データベース連携の検討
- [ ] モバイルUI最適化
- [ ] セキュリティ強化

---

**開発環境**: Claude Code
**開発セッション**: 2025-09-02 11:00-12:00 (JST)
**プロジェクト**: AI日記アプリケーション
**最終更新**: 2025-09-02