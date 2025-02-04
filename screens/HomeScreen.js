import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import MangaItem from '../components/MangaItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const savedLibrary = await AsyncStorage.getItem('library');
        if (savedLibrary) {
          setLibrary(JSON.parse(savedLibrary));
        }
      } catch (error) {
        console.error('Error loading library:', error);
      }
    };

    // Load library when screen mounts
    loadLibrary();

    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', loadLibrary);

    // Cleanup listener
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <MangaItem 
      item={item} 
      onPress={() => navigation.navigate('Info', { 
        item, 
        extenstion: item.extension 
      })} 
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="library-books" size={48} color={theme.colors.text.secondary} />
      <Text style={styles.emptyText}>Your library is empty</Text>
      <Text style={styles.emptySubtext}>Add manga from the browse section</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Text style={styles.headerSubtitle}>{library.length} manga</Text>
      </View>
      <FlatList
        data={library}
        renderItem={renderItem}
        keyExtractor={item => item.hid}
        numColumns={3}
        contentContainerStyle={[
          styles.list,
          library.length === 0 && styles.emptyList
        ]}
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
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
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

export default HomeScreen;