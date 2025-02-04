import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import TopBar from '../components/TopBar';
import NavBar from '../components/NavBar';

const UpdatesScreen = () => {
  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <MaterialIcons 
          name="update" 
          size={64} 
          color={theme.colors.text.secondary} 
        />
        <Text style={styles.title}>Updates Coming Soon</Text>
        <Text style={styles.subtitle}>
          Track your favorite manga updates here
        </Text>
      </View>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default UpdatesScreen;
