import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { searchManga } from '../api/comick';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';
import { theme } from '../constants/theme';
import { debounce } from 'lodash';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const performSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchManga(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearch = (text) => {
    setQuery(text);
    performSearch(text);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate('Info', { 
        item,
        extenstion: 'comick'
      })}
    >
      <OptimizedImage
        source={{ uri: item.image }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.altTitles?.length > 0 && (
          <Text style={styles.altTitle} numberOfLines={1}>
            {item.altTitles[0]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout showNavBar={false}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={24} 
              color={theme.colors.text.secondary} 
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.colors.text.primary }
            ]}
            placeholder="Search manga..."
            placeholderTextColor={theme.colors.text.secondary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setQuery('');
                setResults([]);
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => item.hid}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={() => (
              query.length > 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              ) : null
            )}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  backButton: {
    marginRight: 12,
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
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 70,
    height: 100,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  altTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});

export default SearchScreen;
