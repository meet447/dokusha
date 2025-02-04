import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';

const ExploreScreen = ({ navigation }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiEndpoint } = useTheme();

  useEffect(() => {
    fetchSources();
  }, [apiEndpoint]);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!apiEndpoint) {
        setSources([]);
        return;
      }

      const response = await fetch(apiEndpoint);
      const data = await response.json();

      // Validate the response data structure
      if (!Array.isArray(data) || !data.every(isValidSource)) {
        throw new Error('Invalid API response format');
      }

      setSources(data);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setSources([]);
      setError(error.message === 'Invalid API response format' 
        ? 'The API response format is invalid. Expected an array of sources.' 
        : 'Failed to fetch sources. Please check your API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  // Validate source object structure
  const isValidSource = (source) => {
    return source 
      && typeof source.id === 'string'
      && typeof source.name === 'string'
      && typeof source.description === 'string'
      && typeof source.icon === 'string'
      && typeof source.language === 'string';
  };

  const SourceItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.sourceCard} onPress={onPress}>
      <View style={styles.sourceIconContainer}>
        <MaterialIcons name={item.icon} size={32} color={theme.colors.primary} />
      </View>
      <View style={styles.sourceInfo}>
        <Text style={styles.sourceName}>{item.name}</Text>
        <Text style={styles.sourceDescription}>{item.description}</Text>
        <View style={styles.sourceMetaContainer}>
          <MaterialIcons name="language" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.sourceLanguage}>{item.language}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <SourceItem
      item={item}
      onPress={() => navigation.navigate('Extention', { itemId: item.id })}
    />
  );

  if (!apiEndpoint) {
    return (
      <Layout>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="settings" size={48} color={theme.colors.text.secondary} />
          <Text style={styles.emptyText}>No API Endpoint Set</Text>
          <Text style={styles.emptySubtext}>
            Please set an API endpoint in settings to view available extensions
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={styles.emptyText}>Error</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSources}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <Text style={styles.headerSubtitle}>Discover manga from various sources</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sources}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 8,
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
    marginBottom: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  sourceMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceLanguage: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  settingsButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 8,
  }
});

export default ExploreScreen;
