import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import TopBar from '../components/TopBar';
import NavBar from '../components/NavBar';
import { fetchInfo } from '../api/manga';
import Layout from '../components/Layout';

const UpdatesScreen = ({ navigation }) => {
  const [updates, setUpdates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const checkForUpdates = async () => {
    setRefreshing(true);
    try {
      // Load library
      const savedLibrary = await AsyncStorage.getItem('library');
      const library = savedLibrary ? JSON.parse(savedLibrary) : [];
      
      if (library.length === 0) {
        Alert.alert('No manga in library', 'Add manga to your library to track updates');
        setRefreshing(false);
        return;
      }

      // Load saved chapter data
      const savedChapterData = await AsyncStorage.getItem('mangaChapters');
      const mangaChapters = savedChapterData ? JSON.parse(savedChapterData) : {};

      let newUpdates = [];

      // Check each manga in library
      for (const manga of library) {
        try {
          // Use fetchInfo for all extensions
          const latestChapters = await fetchInfo(manga.extension, manga.hid);
          
          // If no saved chapters, save current chapters and continue
          if (!mangaChapters[manga.hid]) {
            mangaChapters[manga.hid] = latestChapters;
            continue;
          }

          // Compare with saved chapters
          const savedChapters = mangaChapters[manga.hid];
          const newChapters = latestChapters.filter(chapter => 
            !savedChapters.some(saved => saved.hid === chapter.hid)
          );

          if (newChapters.length > 0) {
            newUpdates.push({
              manga: {
                ...manga,
                cover: manga.image // Ensure cover is available
              },
              newChapters,
              timestamp: new Date().toISOString()
            });
          }

          // Update saved chapters
          mangaChapters[manga.hid] = latestChapters;
        } catch (error) {
          console.error(`Error checking updates for ${manga.title}:`, error);
        }
      }

      // Save updated chapter data
      await AsyncStorage.setItem('mangaChapters', JSON.stringify(mangaChapters));

      // Sort updates by timestamp
      newUpdates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setUpdates(newUpdates);
    } catch (error) {
      console.error('Error checking for updates:', error);
      Alert.alert('Error', 'Failed to check for updates. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  const handleChapterPress = async (manga, chapter) => {
    try {
      // Add to history
      const existingHistory = await AsyncStorage.getItem('history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      const historyEntry = {
        manga: {
          ...manga,
          cover: manga.image
        },
        chapter: {
          ...chapter,
          extension: manga.extension
        },
        timestamp: new Date().toISOString()
      };

      // Remove any existing entries for the same manga
      const filteredHistory = history.filter(
        entry => entry.manga.hid !== manga.hid
      );

      // Add new entry at the beginning
      filteredHistory.unshift(historyEntry);

      // Keep only the last 100 entries
      const trimmedHistory = filteredHistory.slice(0, 100);

      // Save updated history
      await AsyncStorage.setItem('history', JSON.stringify(trimmedHistory));

      // Navigate to read screen
      navigation.navigate('Read', {
        chapter: {
          ...chapter,
          extension: manga.extension
        },
        manga: {
          ...manga,
          extension: manga.extension
        }
      });
    } catch (error) {
      console.error('Error handling chapter press:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.updateItem}>
      <Image source={{ uri: item.manga.image }} style={styles.mangaImage} />
      <View style={styles.updateInfo}>
        <Text style={styles.mangaTitle}>{item.manga.title}</Text>
        <View style={styles.chaptersContainer}>
          {item.newChapters.map((chapter, index) => (
            <TouchableOpacity
              key={chapter.hid}
              style={styles.chapterButton}
              onPress={() => handleChapterPress(item.manga, chapter)}
            >
              <Text style={styles.chapterText}>
                Chapter {chapter.chap}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="update" 
        size={64} 
        color={theme.colors.text.secondary} 
      />
      <Text style={styles.emptyText}>No Updates Available</Text>
      <Text style={styles.emptySubtext}>
        Pull down to check for new chapters
      </Text>
    </View>
  );

  return (
    <Layout>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Updates</Text>
      </View>
      <FlatList
        data={updates}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.manga.hid}-${index}`}
        contentContainerStyle={[
          styles.list,
          updates.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={checkForUpdates}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </Layout>
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
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
  updateItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  mangaImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  updateInfo: {
    flex: 1,
  },
  mangaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  chaptersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chapterButton: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chapterText: {
    color: theme.colors.primary,
    fontSize: 14,
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

export default UpdatesScreen;
