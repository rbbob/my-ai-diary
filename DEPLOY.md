# 🚀 AI日記アプリ - デプロイメントガイド

このドキュメントは、AI日記アプリを各種プラットフォームにデプロイする方法を説明します。

## 📋 事前準備

### 必要な環境変数
デプロイ前に以下の環境変数を設定する必要があります：

```bash
OPENAI_API_KEY=your-actual-openai-api-key
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
RATE_LIMIT_MAX=1000
```

## 🌐 Vercelデプロイ

### 1. Vercel CLIを使用
```bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトディレクトリで
vercel

# 初回デプロイ後の設定
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL
vercel env add NODE_ENV
```

### 2. GitHub連携
1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. "New Project" → GitHubリポジトリを選択
3. 環境変数を設定：
   - `OPENAI_API_KEY`: OpenAI APIキー
   - `OPENAI_MODEL`: `gpt-4o-mini`
   - `NODE_ENV`: `production`

## 🟠 Netlifyデプロイ

### 1. Netlify CLI
```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# ログイン
netlify login

# デプロイ
netlify deploy --prod
```

### 2. Git連携
1. [Netlify Dashboard](https://app.netlify.com/)にログイン
2. "New site from Git" → GitHubリポジトリを選択
3. ビルド設定:
   - Build command: `cd client && npm run build`
   - Publish directory: `client/dist`
4. 環境変数を設定（Site settings → Environment variables）

## 🐳 Dockerデプロイ

### ローカルでDockerビルド
```bash
# イメージをビルド
docker build -t ai-diary-app .

# コンテナを起動
docker run -d -p 3004:3004 --name ai-diary \
  -e OPENAI_API_KEY=your-api-key \
  -e NODE_ENV=production \
  ai-diary-app
```

### Docker Composeでデプロイ
```yaml
version: '3.8'
services:
  ai-diary:
    build: .
    ports:
      - "3004:3004"
    environment:
      - OPENAI_API_KEY=your-api-key
      - NODE_ENV=production
      - PORT=3004
    restart: unless-stopped
```

## ☁️ その他クラウドプラットフォーム

### Railway
1. [Railway](https://railway.app/)でプロジェクト作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. 自動デプロイが開始

### Render
1. [Render](https://render.com/)でWebサービス作成
2. GitHubリポジトリを接続
3. ビルドコマンド: `npm install && npm run build`
4. 開始コマンド: `npm start`

## 🔧 デプロイ後の確認

### ヘルスチェック
```bash
# サーバーの動作確認
curl https://your-domain.com/api/health

# 期待される応答:
# {"status":"OK","timestamp":"...","environment":"production"}
```

### エラーログの確認
- Vercel: ダッシュボードの "Functions" タブでログを確認
- Netlify: "Functions" ログでエラーを確認
- Docker: `docker logs ai-diary`

## 🚨 トラブルシューティング

### よくある問題

**1. OpenAI API エラー**
```
解決策: 環境変数でOPENAI_API_KEYが正しく設定されているか確認
```

**2. CORS エラー**
```
解決策: FRONTEND_URL環境変数で正しいドメインを設定
```

**3. ビルドエラー**
```
解決策: Node.js バージョンを18以上に設定
```

**4. メモリ不足**
```
解決策: サーバーレス関数のメモリ上限を1GB以上に設定
```

## 📊 本番運用のベストプラクティス

### セキュリティ
- APIキーは環境変数で管理
- HTTPS必須
- レート制限の適切な設定

### パフォーマンス
- CDNの活用
- 画像最適化
- キャッシュ設定

### モニタリング
- アクセスログの確認
- エラー率の監視
- レスポンス時間の測定

## 🔄 継続的デプロイ

GitHub Actionsワークフロー（`.github/workflows/deploy.yml`）が設定済み：

- mainブランチへのプッシュで自動デプロイ
- テスト → ビルド → デプロイの順序で実行
- Vercelへの自動デプロイ対応

## 📞 サポート

デプロイで問題が発生した場合：
1. このドキュメントの確認
2. プラットフォーム固有のログを確認
3. 環境変数の設定を再確認

---

**最終更新**: 2025-09-07  
**対応プラットフォーム**: Vercel, Netlify, Docker, Railway, Render