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
import { fetchChapters } from '../api/comick';
import { fetchInfo } from '../api/image/manga';
import Layout from '../components/Layout';
// OR if using a different extension:
// import { fetchChapters } from '../api/image/manga';  // Depending on which API you're using

const UpdatesScreen = ({ navigation }) => {
  const [updates, setUpdates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const savedUpdates = await AsyncStorage.getItem('updates');
      if (savedUpdates) {
        setUpdates(JSON.parse(savedUpdates));
      }
      const lastCheck = await AsyncStorage.getItem('lastUpdateCheck');
      if (lastCheck) {
        setLastChecked(new Date(JSON.parse(lastCheck)));
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

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
        let latestChapters;
        
        // Use appropriate API based on extension
        if (manga.extension === 'comick') {
          latestChapters = await fetchChapters(manga.hid);
        } else {
          // For other extensions, use the manga API
          latestChapters = await fetchInfo(manga.extension, manga.hid);
        }
        
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
            manga,
            newChapters,
            timestamp: new Date().toISOString()
          });
        }

        // Update saved chapters
        mangaChapters[manga.hid] = latestChapters;
      }

      // Save updated chapter data
      await AsyncStorage.setItem('mangaChapters', JSON.stringify(mangaChapters));

      // Update the updates list
      if (newUpdates.length > 0) {
        const combinedUpdates = [...newUpdates, ...updates];
        await AsyncStorage.setItem('updates', JSON.stringify(combinedUpdates));
        setUpdates(combinedUpdates);
      }

      // Save last check time
      const now = new Date().toISOString();
      await AsyncStorage.setItem('lastUpdateCheck', JSON.stringify(now));
      setLastChecked(new Date(now));

      Alert.alert(
        'Update Check Complete',
        `Found ${newUpdates.length} manga with new chapters`
      );
    } catch (error) {
      console.error('Error checking updates:', error);
      Alert.alert('Error', 'Failed to check for updates');
    } finally {
      setRefreshing(false);
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
              onPress={() => navigation.navigate('Read', { 
                chapter,
                manga: item.manga
              })}
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
        {lastChecked && (
          <Text style={styles.headerSubtitle}>
            Last checked: {lastChecked.toLocaleDateString()}
          </Text>
        )}
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
