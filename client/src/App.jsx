import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">
            🤖 AI日記アプリ
          </h1>
          <p className="text-gray-600">
            AIとの会話を通じて素敵な日記を作成しよう
          </p>
        </header>

        <main className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              デプロイ成功！
            </h2>
            <p className="text-gray-600 mb-8">
              AI日記アプリがVercelで正常にデプロイされました。<br />
              今後、チャット機能や日記生成機能を段階的に追加していきます。
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="font-bold text-blue-800">チャット機能</h3>
                <p className="text-sm text-blue-600">AIとの自然な対話</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📓</div>
                <h3 className="font-bold text-green-800">日記生成</h3>
                <p className="text-sm text-green-600">会話から自動生成</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-bold text-purple-800">レスポンシブ</h3>
                <p className="text-sm text-purple-600">全デバイス対応</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 AI日記アプリ - Deployed with Claude Code & Vercel</p>
        </footer>
      </div>
    </div>
  );
}

export default App;