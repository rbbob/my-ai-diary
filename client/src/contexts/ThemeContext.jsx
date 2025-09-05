import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsStorage } from '../utils/localStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // LocalStorageから設定を読み込み
    const settings = settingsStorage.getSettings();
    setTheme(settings.theme || 'light');
    
    // HTMLクラスを設定
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // LocalStorageに保存
    settingsStorage.updateSetting('theme', newTheme);
    
    // HTMLクラスを更新
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const setThemeMode = (mode) => {
    setTheme(mode);
    
    // LocalStorageに保存
    settingsStorage.updateSetting('theme', mode);
    
    // HTMLクラスを更新
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setThemeMode,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};