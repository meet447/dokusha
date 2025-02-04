import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const { darkMode, dataSaver, autoUpdate } = JSON.parse(settings);
        setIsDarkMode(darkMode ?? true);
        setIsDataSaver(dataSaver ?? false);
        setAutoUpdate(autoUpdate ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await saveSettings({ darkMode: newValue, dataSaver: isDataSaver, autoUpdate });
  };

  const toggleDataSaver = async () => {
    const newValue = !isDataSaver;
    setIsDataSaver(newValue);
    await saveSettings({ darkMode: isDarkMode, dataSaver: newValue, autoUpdate });
  };

  const toggleAutoUpdate = async () => {
    const newValue = !autoUpdate;
    setAutoUpdate(newValue);
    await saveSettings({ darkMode: isDarkMode, dataSaver: isDataSaver, autoUpdate: newValue });
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      isDataSaver,
      autoUpdate,
      toggleDarkMode,
      toggleDataSaver,
      toggleAutoUpdate
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 