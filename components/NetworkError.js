import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const NetworkError = ({ onRetry, message }) => (
  <View style={styles.container}>
    <MaterialIcons name="wifi-off" size={64} color={theme.colors.error} />
    <Text style={styles.title}>Connection Error</Text>
    <Text style={styles.message}>{message || 'Please check your internet connection'}</Text>
    <TouchableOpacity style={styles.button} onPress={onRetry}>
      <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkError; 