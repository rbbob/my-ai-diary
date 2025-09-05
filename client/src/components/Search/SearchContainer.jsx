import React, { useState, useEffect, useContext } from 'react';
import { BsSearch, BsX, BsFilter, BsCalendar, BsChat, BsBook } from 'react-icons/bs';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { messageStorage, diaryStorage } from '../../utils/localStorage';
import { ToastContext } from '../../App';

const SearchContainer = ({ onDiarySelect, onChatSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'diary', 'chat'
    dateFrom: '',
    dateTo: '',
    tags: '',
    mood: ''
  });
  const toast = useContext(ToastContext);

  // 検索実行
  const performSearch = async (query = searchQuery, currentFilters = filters) => {
    if (!query.trim() && !currentFilters.tags.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = [];
      
      // 日記検索
      if (currentFilters.type === 'all' || currentFilters.type === 'diary') {
        const diaries = diaryStorage.getDiaryEntries();
        const diaryResults = searchInDiaries(diaries, query, currentFilters);
        results.push(...diaryResults);
      }
      
      // チャット検索
      if (currentFilters.type === 'all' || currentFilters.type === 'chat') {
        const messages = messageStorage.getMessages();
        const chatResults = searchInChats(messages, query, currentFilters);
        results.push(...chatResults);
      }
      
      // 日付順で並び替え（新しい順）
      results.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
      
      setSearchResults(results);
      
      if (query.trim()) {
        toast?.success(`${results.length}件の結果が見つかりました`);
      }
      
    } catch (error) {
      console.error('検索エラー:', error);
      toast?.error('検索中にエラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  };

  // 日記内検索
  const searchInDiaries = (diaries, query, filters) => {
    return diaries.filter(diary => {
      // 日付フィルター
      if (filters.dateFrom && new Date(diary.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(diary.date) > new Date(filters.dateTo)) return false;
      
      // タグフィルター
      if (filters.tags.trim()) {
        const filterTags = filters.tags.split(',').map(tag => tag.trim().toLowerCase());
        const diaryTags = (diary.tags || []).map(tag => tag.toLowerCase());
        if (!filterTags.some(tag => diaryTags.includes(tag))) return false;
      }
      
      // ムードフィルター
      if (filters.mood && diary.mood !== filters.mood) return false;
      
      // テキスト検索
      if (query.trim()) {
        const searchText = query.toLowerCase();
        const title = (diary.title || '').toLowerCase();
        const summary = (diary.summary || '').toLowerCase();
        const tags = (diary.tags || []).join(' ').toLowerCase();
        const highlights = (diary.highlights || []).join(' ').toLowerCase();
        
        return title.includes(searchText) || 
               summary.includes(searchText) || 
               tags.includes(searchText) ||
               highlights.includes(searchText);
      }
      
      return true;
    }).map(diary => ({
      ...diary,
      type: 'diary',
      matchedText: getMatchedText(diary, query)
    }));
  };

  // チャット内検索
  const searchInChats = (messages, query, filters) => {
    if (!query.trim()) return [];
    
    return messages.filter(message => {
      // 日付フィルター
      const messageDate = format(new Date(message.timestamp), 'yyyy-MM-dd');
      if (filters.dateFrom && messageDate < filters.dateFrom) return false;
      if (filters.dateTo && messageDate > filters.dateTo) return false;
      
      // テキスト検索
      const searchText = query.toLowerCase();
      const content = (message.content || '').toLowerCase();
      
      return content.includes(searchText);
    }).map(message => ({
      ...message,
      type: 'chat',
      matchedText: getMatchedText(message, query)
    }));
  };

  // マッチした部分のテキストを取得
  const getMatchedText = (item, query) => {
    if (!query.trim()) return '';
    
    const searchText = query.toLowerCase();
    let content = '';
    
    if (item.type === 'diary') {
      content = `${item.title || ''} ${item.summary || ''} ${(item.tags || []).join(' ')}`;
    } else {
      content = item.content || '';
    }
    
    const index = content.toLowerCase().indexOf(searchText);
    if (index === -1) return content.substring(0, 150);
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + searchText.length + 50);
    
    return content.substring(start, end);
  };

  // リアルタイム検索（デバウンス）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // フィルター変更時の検索
  useEffect(() => {
    if (searchQuery.trim() || filters.tags.trim()) {
      performSearch();
    }
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      tags: '',
      mood: ''
    });
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col">
      {/* 検索ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="日記やチャットを検索..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <BsX className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-lg transition-colors ${
              showFilters || Object.values(filters).some(v => v && v !== 'all')
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BsFilter className="w-5 h-5" />
          </button>
        </div>

        {/* フィルター */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  検索対象
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="diary">日記のみ</option>
                  <option value="chat">チャットのみ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  タグ（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value)}
                  placeholder="仕事, 趣味"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ムード（日記のみ）
                </label>
                <select
                  value={filters.mood}
                  onChange={(e) => handleFilterChange('mood', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="">すべて</option>
                  <option value="happy">幸せ</option>
                  <option value="excited">わくわく</option>
                  <option value="neutral">普通</option>
                  <option value="sad">悲しい</option>
                  <option value="anxious">不安</option>
                  <option value="peaceful">穏やか</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-gray-500 dark:text-gray-400">検索中...</span>
          </div>
        ) : searchResults.length === 0 && (searchQuery.trim() || filters.tags.trim()) ? (
          <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BsSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">検索結果が見つかりませんでした</p>
              <p className="text-sm">別のキーワードで検索してみてください</p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BsSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">検索してみましょう</p>
              <p className="text-sm">日記やチャットの内容を検索できます</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div
                key={`${result.type}-${result.id || result.diaryId || index}`}
                onClick={() => {
                  if (result.type === 'diary' && onDiarySelect) {
                    onDiarySelect(result);
                  } else if (result.type === 'chat' && onChatSelect) {
                    onChatSelect(result);
                  }
                }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.type === 'diary' ? (
                      <BsBook className="w-4 h-4 text-purple-500" />
                    ) : (
                      <BsChat className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {result.type === 'diary' ? '日記' : 'チャット'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <BsCalendar className="w-3 h-3 mr-1" />
                    {format(
                      new Date(result.date || result.timestamp), 
                      'yyyy/MM/dd',
                      { locale: ja }
                    )}
                  </div>
                </div>
                
                {result.type === 'diary' && (
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {highlightText(result.title || '', searchQuery)}
                  </h3>
                )}
                
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {highlightText(result.matchedText, searchQuery)}
                </p>
                
                {result.type === 'diary' && result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchContainer;