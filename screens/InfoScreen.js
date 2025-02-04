import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { infoManga } from '../api/comick';
import { fetchInfo } from '../api/image/manga';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const InfoScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const extension = route.params.extenstion;
  
  useEffect(() => {
    const checkLibraryStatus = async () => {
      try {
        const existingLibrary = await AsyncStorage.getItem('library');
        if (existingLibrary) {
          const library = JSON.parse(existingLibrary);
          setIsInLibrary(library.some((manga) => manga.hid === item.hid));
        }
      } catch (error) {
        console.error('Error checking library status:', error);
      }
    };

    const fetchData = async () => {
      try {
        if(extension === 'comick'){
          const newData = await infoManga(item.hid);
          setData(newData);
          setIsLoading(false);
        } else {
          const newData = await fetchInfo(extension, item.hid);
          setData(newData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching manga info:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to fetch manga information. Please try again later.');
      }
    };

    checkLibraryStatus();
    fetchData();
  }, []);

  const toggleLibrary = async () => {
    try {
      const existingLibrary = await AsyncStorage.getItem('library');
      const library = existingLibrary ? JSON.parse(existingLibrary) : [];

      if (isInLibrary) {
        // Remove from library
        const updatedLibrary = library.filter((manga) => manga.hid !== item.hid);
        await AsyncStorage.setItem('library', JSON.stringify(updatedLibrary));
        setIsInLibrary(false);
        Alert.alert('Success', 'Removed from library');
      } else {
        // Add to library
        if (!item) {
          Alert.alert('Error', 'Manga information is not available.');
          return;
        }

        // Save current chapters data
        const chaptersData = await AsyncStorage.getItem('mangaChapters');
        const mangaChapters = chaptersData ? JSON.parse(chaptersData) : {};
        mangaChapters[item.hid] = data; // data contains the chapters

        await AsyncStorage.setItem('mangaChapters', JSON.stringify(mangaChapters));

        library.push({
          ...item,
          addedAt: new Date().toISOString(),
          extension: extension
        });
        
        await AsyncStorage.setItem('library', JSON.stringify(library));
        setIsInLibrary(true);
        Alert.alert('Success', 'Added to library successfully!');
      }
    } catch (error) {
      console.error('Error updating library:', error);
      Alert.alert('Error', 'Failed to update library. Please try again.');
    }
  };

  const handleStartReading = async () => {
    try {
      // Get first chapter - data is already the chapters array
      const firstChapter = data[data.length - 1]; // Get the last item since chapters are in reverse order
      
      if (!firstChapter) {
        Alert.alert('Error', 'No chapters available');
        return;
      }

      // Add to history
      const existingHistory = await AsyncStorage.getItem('history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      const historyEntry = {
        manga: {
          ...item,
          extension: extension
        },
        chapter: firstChapter,
        timestamp: new Date().toISOString()
      };

      // Remove any existing entries for the same manga
      const filteredHistory = history.filter(
        entry => entry.manga.hid !== item.hid
      );

      // Add new entry at the beginning
      filteredHistory.unshift(historyEntry);

      // Keep only the last 100 entries
      const trimmedHistory = filteredHistory.slice(0, 100);

      // Save updated history
      await AsyncStorage.setItem('history', JSON.stringify(trimmedHistory));

      // Navigate to read screen with manga info
      navigation.navigate('Read', { 
        chapter: firstChapter,
        manga: {
          ...item,
          extension: extension
        }
      });
    } catch (error) {
      console.error('Error updating history:', error);
      Alert.alert('Error', 'Failed to start reading. Please try again.');
    }
  };

  const handleChapterPress = async (chapter) => {
    try {
      // Get existing history or initialize empty array
      const existingHistory = await AsyncStorage.getItem('history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // Create history entry
      const historyEntry = {
        manga: {
          ...item,
          extension: extension
        },
        chapter: chapter,
        timestamp: new Date().toISOString()
      };

      // Remove any existing entries for the same manga
      const filteredHistory = history.filter(
        entry => entry.manga.hid !== item.hid
      );

      // Add new entry at the beginning
      filteredHistory.unshift(historyEntry);

      // Keep only the last 100 entries
      const trimmedHistory = filteredHistory.slice(0, 100);

      // Save updated history
      await AsyncStorage.setItem('history', JSON.stringify(trimmedHistory));

      // Navigate to read screen with manga info
      navigation.navigate('Read', { 
        chapter,
        manga: {
          ...item,
          extension: extension
        }
      });
    } catch (error) {
      console.error('Error updating history:', error);
    }
  };

  const ChapterItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chapterItem}
      onPress={() => handleChapterPress(item)}
    >
      <View style={styles.chapterInfo}>
        <Text style={styles.chapterNumber}>Chapter {item.chap}</Text>
        <Text style={styles.chapterTitle} numberOfLines={1}>
          {item.title || `Chapter ${item.chap}`}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.coverContainer}>
        <Image source={{ uri: item.image }} style={styles.coverImage} />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaInfo}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>9.33</Text>
          <Text style={styles.ratingText}>Amazing</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>
          {item.description || "No description available"}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartReading}
          >
            <MaterialIcons name="play-arrow" size={24} color={theme.colors.text.primary} />
            <Text style={styles.buttonText}>Start Reading</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              isInLibrary ? styles.removeButton : styles.secondaryButton
            ]}
            onPress={toggleLibrary}
          >
            <MaterialIcons 
              name={isInLibrary ? "bookmark-remove" : "bookmark-add"} 
              size={24} 
              color={theme.colors.text.primary} 
            />
            <Text style={styles.buttonText}>
              {isInLibrary ? 'Remove from Library' : 'Add to Library'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chaptersHeader}>
        <Text style={styles.chaptersTitle}>Chapters</Text>
        <Text style={styles.chaptersCount}>{data.length} chapters</Text>
      </View>

      <FlatList
        data={data}
        renderItem={({ item }) => <ChapterItem item={item} />}
        keyExtractor={(item, index) => `${item.hid}_${index}`}
        style={styles.chapterList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  coverContainer: {
    height: 250,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoContainer: {
    padding: 16,
    marginTop: -50,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 4,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: theme.colors.background,
  },
  chaptersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  chaptersCount: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  chapterList: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  removeButton: {
    backgroundColor: '#DC3545', // or theme.colors.error if you have it
  },
});

export default InfoScreen;
