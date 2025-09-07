# マルチステージビルド - フロントエンドビルド
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# バックエンド用のステージ
FROM node:18-alpine AS backend
WORKDIR /app
COPY server/package*.json ./
RUN npm install --only=production

# 最終ステージ
FROM node:18-alpine
WORKDIR /app

# バックエンドファイルをコピー
COPY --from=backend /app/node_modules ./node_modules
COPY server/ ./server/

# フロントエンドビルドファイルをコピー
COPY --from=frontend-builder /app/client/dist ./server/public

# ポート設定
EXPOSE 3004

# 環境変数
ENV NODE_ENV=production

# サーバー起動
CMD ["node", "server/src/index.js"]