import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MangaItem from '../components/MangaItem';
import { fetchAndFormatData } from '../api/comick';
import { fetchData } from '../api/image/manga';
import { theme } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { searchManga } from '../api/comick';
import { debounce } from 'lodash';
import Layout from '../components/Layout';

const ExtentionScreen = ({ route, navigation }) => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { itemId } = route.params;
  const extenstion = route.params?.itemId;

  useEffect(() => {
    setLoading(true);
    if (itemId === 'comick') {
      fetchAndFormatData('https://api.comick.io/chapter?lang=en&accept_erotic_content=true&page=1&device-memory=4&order=hot')
        .then(newData => {
          setData(newData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetchData(extenstion, page = '1')
        .then(newData => {
          setData(newData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [itemId]);

  // Handle search
  const performSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        // Reset to initial data if search query is cleared
        if (itemId === 'comick') {
          fetchAndFormatData('https://api.comick.io/chapter?lang=en&accept_erotic_content=true&page=1&device-memory=4&order=hot')
            .then(newData => {
              setData(newData);
            });
        }
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchManga(searchQuery);
        setData(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [itemId]
  );

  const handleSearch = (text) => {
    setQuery(text);
    performSearch(text);
  };

  const renderItem = ({ item }) => (
    <MangaItem item={item} onPress={() => navigation.navigate('Info', { item, extenstion })} />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={styles.emptyText}>No manga found</Text>
        </>
      )}
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {extenstion === 'comick' ? 'ComicK' : extenstion.charAt(0).toUpperCase() + extenstion.slice(1)}
      </Text>
      <Text style={styles.headerSubtitle}>Popular manga</Text>
    </View>
  );

  return (
    <Layout>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons 
            name="search" 
            size={24} 
            color={theme.colors.text.secondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.colors.text.primary }
            ]}
            placeholder="Search manga..."
            placeholderTextColor={theme.colors.text.secondary}
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setQuery('');
                performSearch('');
              }}
              style={styles.clearButton}
            >
              <MaterialIcons 
                name="clear" 
                size={20} 
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={[
              styles.list,
              data.length === 0 && styles.emptyList
            ]}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExtentionScreen;
