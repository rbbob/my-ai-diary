import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // エラーが発生した場合の状態を更新
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // メッセージポートエラーの場合は特別処理
    if (error.message && error.message.includes('message port closed')) {
      console.log('🔄 Message port error caught by Error Boundary, attempting recovery...');
      
      // 3秒後に自動回復を試行
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 3000);
      
      return;
    }
    
    console.error('🚨 Error caught by Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // メッセージポートエラーの場合
      if (this.state.error?.message?.includes('message port closed')) {
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    ブラウザ通信エラーが発生しました。自動的に回復を試行中です...
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                  >
                    ページを再読み込み
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // その他のエラーの場合
      return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  アプリケーションエラー
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  予期しないエラーが発生しました。ページを再読み込みしてください。
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  ページを再読み込み
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;