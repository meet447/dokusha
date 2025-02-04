import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const SOURCES = [
  {
    id: 'comick',
    name: 'ComicK',
    description: 'Read manga from ComicK',
    icon: 'collections-bookmark',
    language: 'Multi-Language'
  }
  // Add more sources as needed
];

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

const ExploreScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <SourceItem
      item={item}
      onPress={() => navigation.navigate('Extention', { itemId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <Text style={styles.headerSubtitle}>Discover manga from various sources</Text>
      </View>
      <FlatList
        data={SOURCES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
});

export default ExploreScreen;
