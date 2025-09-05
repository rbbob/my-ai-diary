// API設定管理ルート
import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const ENV_FILE_PATH = path.join(process.cwd(), '.env');

// OpenAI API設定状態を取得
router.get('/openai-status', async (req, res) => {
  try {
    const hasApiKey = process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' &&
                      !process.env.OPENAI_API_KEY.startsWith('#');
    
    res.json({
      success: true,
      data: {
        configured: hasApiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        fallbackMode: !hasApiKey
      }
    });
  } catch (error) {
    console.error('OpenAI status check error:', error);
    res.status(500).json({
      success: false,
      error: 'API設定状態の確認に失敗しました'
    });
  }
});

// OpenAI API キーを設定
router.post('/set-openai-key', async (req, res) => {
  try {
    const { apiKey } = req.body;

    // APIキーの基本検証
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'APIキーが必要です'
      });
    }

    if (!apiKey.startsWith('sk-')) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI APIキーは sk- で始まる必要があります'
      });
    }

    if (apiKey.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'APIキーの形式が正しくありません'
      });
    }

    // .envファイルを読み込み
    let envContent = '';
    try {
      envContent = await fs.readFile(ENV_FILE_PATH, 'utf8');
    } catch (error) {
      // .envが存在しない場合は新規作成
      envContent = `# Server Configuration
PORT=3002
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
`;
    }

    // APIキーを置換または追加
    const lines = envContent.split('\n');
    let keyUpdated = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('OPENAI_API_KEY=') || line.startsWith('#OPENAI_API_KEY=') || line.startsWith('# OPENAI_API_KEY=')) {
        lines[i] = `OPENAI_API_KEY=${apiKey}`;
        keyUpdated = true;
        break;
      }
    }

    if (!keyUpdated) {
      // OPENAI_API_KEY行が見つからない場合は追加
      const insertIndex = lines.findIndex(line => line.includes('# OpenAI Configuration')) + 1;
      lines.splice(insertIndex, 0, `OPENAI_API_KEY=${apiKey}`);
    }

    // .envファイルを更新
    await fs.writeFile(ENV_FILE_PATH, lines.join('\n'));

    // 環境変数を更新（次回リスタート時に有効）
    process.env.OPENAI_API_KEY = apiKey;

    res.json({
      success: true,
      message: 'APIキーが設定されました。サーバーを再起動すると有効になります。',
      requiresRestart: true
    });

  } catch (error) {
    console.error('Set OpenAI key error:', error);
    res.status(500).json({
      success: false,
      error: 'APIキーの設定に失敗しました'
    });
  }
});

// サーバー再起動
router.post('/restart-server', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'サーバーを再起動しています...'
    });

    // 少し遅延してからプロセスを再起動
    setTimeout(() => {
      console.log('🔄 API設定変更によりサーバーを再起動します...');
      process.exit(0); // nodemonが自動で再起動
    }, 1000);

  } catch (error) {
    console.error('Server restart error:', error);
    res.status(500).json({
      success: false,
      error: 'サーバーの再起動に失敗しました'
    });
  }
});

export default router;