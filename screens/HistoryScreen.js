import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import TopBar from '../components/TopBar';
import NavBar from '../components/NavBar';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => navigation.navigate('Read', { chapter: item.chapter })}
    >
      <Image source={{ uri: item.manga.image }} style={styles.mangaImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.mangaTitle} numberOfLines={1}>{item.manga.title}</Text>
        <Text style={styles.chapterInfo}>
          Chapter {item.chapter.chap}
          {item.chapter.title && ` - ${item.chapter.title}`}
        </Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={48} color={theme.colors.text.secondary} />
      <Text style={styles.emptyText}>No reading history</Text>
      <Text style={styles.emptySubtext}>Your reading history will appear here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>Recently read manga</Text>
      </View>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.manga.hid}-${item.chapter.hid}-${index}`}
        contentContainerStyle={[styles.list, history.length === 0 && styles.emptyList]}
        ListEmptyComponent={ListEmptyComponent}
      />
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  mangaImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  mangaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  chapterInfo: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default HistoryScreen; 