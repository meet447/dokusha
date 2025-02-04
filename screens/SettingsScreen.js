import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  ScrollView,
  Linking,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_VERSION = '1.0.0';

const SettingsScreen = () => {
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [tempEndpoint, setTempEndpoint] = useState('');
  
  const { 
    isDarkMode, 
    isDataSaver, 
    autoUpdate,
    apiEndpoint,
    toggleDarkMode,
    toggleDataSaver,
    toggleAutoUpdate,
    updateApiEndpoint
  } = useTheme();

  const clearCache = async () => {
    try {
      // Keep settings when clearing cache
      const settings = await AsyncStorage.getItem('settings');
      await AsyncStorage.clear();
      if (settings) {
        await AsyncStorage.setItem('settings', settings);
      }
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
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: clearCache, style: 'destructive' }
      ]
    );
  };

  const handleEndpointUpdate = () => {
    setTempEndpoint(apiEndpoint);
    setShowEndpointModal(true);
  };

  const handleSaveEndpoint = () => {
    if (tempEndpoint && tempEndpoint.trim()) {
      updateApiEndpoint(tempEndpoint.trim());
    }
    setShowEndpointModal(false);
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
    <Layout>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Text style={styles.sectionTitle}>Appearance</Text>
        {renderSettingItem({
          icon: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Toggle dark/light theme',
          onPress: toggleDarkMode,
          value: isDarkMode,
          type: 'switch'
        })}

        <Text style={styles.sectionTitle}>Reading</Text>
        {renderSettingItem({
          icon: 'save-alt',
          title: 'Data Saver',
          subtitle: 'Load lower quality images',
          onPress: toggleDataSaver,
          value: isDataSaver,
          type: 'switch'
        })}
        {renderSettingItem({
          icon: 'update',
          title: 'Auto Update Library',
          subtitle: 'Check for new chapters automatically',
          onPress: toggleAutoUpdate,
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

        <Text style={styles.sectionTitle}>Extensions</Text>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleEndpointUpdate}
        >
          <View style={styles.settingItemLeft}>
            <MaterialIcons name="api" size={24} color={theme.colors.primary} />
            <View style={styles.settingItemText}>
              <Text style={styles.settingTitle}>API Endpoint</Text>
              <Text style={styles.settingSubtitle}>
                {apiEndpoint || 'Not set'}
              </Text>
            </View>
          </View>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={theme.colors.text.secondary} 
          />
        </TouchableOpacity>

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
          onPress: () => Linking.openURL('https://github.com/meet447/dokusha')
        })}
        {renderSettingItem({
          icon: 'bug-report',
          title: 'Report Issue',
          subtitle: 'Report bugs or request features',
          onPress: () => Linking.openURL('https://github.com/meet447/dokusha/issues')
        })}

        {/* API Endpoint Modal */}
        <Modal
          visible={showEndpointModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEndpointModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update API Endpoint</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter API URL"
                placeholderTextColor={theme.colors.text.secondary}
                value={tempEndpoint}
                onChangeText={setTempEndpoint}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowEndpointModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveEndpoint}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Add some bottom padding to ensure last item is visible */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding at the bottom to prevent content from being hidden
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
  bottomPadding: {
    height: 20, // Additional padding at the bottom
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text.primary,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonCancel: {
    backgroundColor: theme.colors.background,
  },
  modalButtonSave: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  modalButtonTextSave: {
    color: '#fff',
  },
});

export default SettingsScreen;