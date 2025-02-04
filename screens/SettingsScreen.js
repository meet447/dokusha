import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  ScrollView,
  Linking,
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import TopBar from '../components/TopBar';
import NavBar from '../components/NavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_VERSION = '1.0.0';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  const clearCache = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const confirmClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including your library and reading history. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: clearCache,
          style: 'destructive',
        },
      ]
    );
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, value, type = 'arrow' }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={24} color={theme.colors.text.primary} />
        <View style={styles.settingItemText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === 'arrow' && (
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
      )}
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
          thumbColor={theme.colors.text.primary}
        />
      )}
      {type === 'text' && (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {renderSettingItem({
          icon: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Toggle dark/light theme',
          onPress: () => setDarkMode(!darkMode),
          value: darkMode,
          type: 'switch'
        })}

        <Text style={styles.sectionTitle}>Reading</Text>
        {renderSettingItem({
          icon: 'save-alt',
          title: 'Data Saver',
          subtitle: 'Load lower quality images',
          onPress: () => setDataSaver(!dataSaver),
          value: dataSaver,
          type: 'switch'
        })}
        {renderSettingItem({
          icon: 'update',
          title: 'Auto Update Library',
          subtitle: 'Check for new chapters automatically',
          onPress: () => setAutoUpdate(!autoUpdate),
          value: autoUpdate,
          type: 'switch'
        })}

        <Text style={styles.sectionTitle}>Storage</Text>
        {renderSettingItem({
          icon: 'delete-sweep',
          title: 'Clear Cache',
          subtitle: 'Clear all cached data',
          onPress: confirmClearCache
        })}

        <Text style={styles.sectionTitle}>About</Text>
        {renderSettingItem({
          icon: 'info',
          title: 'Version',
          value: APP_VERSION,
          type: 'text'
        })}
        {renderSettingItem({
          icon: 'code',
          title: 'GitHub',
          subtitle: 'View source code',
          onPress: () => Linking.openURL('https://github.com/yourusername/yourrepo')
        })}
        {renderSettingItem({
          icon: 'bug-report',
          title: 'Report Issue',
          subtitle: 'Report bugs or request features',
          onPress: () => Linking.openURL('https://github.com/yourusername/yourrepo/issues')
        })}
      </ScrollView>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surface,
    marginBottom: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
});

export default SettingsScreen;