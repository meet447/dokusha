import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import MangaItem from '../components/MangaItem';
import { fetchAndFormatData } from '../api/comick';
import { fetchData } from '../api/image/manga';
import { theme } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const ExtentionScreen = ({ route, navigation }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { item } = route.params;
  const extenstion = route.params?.itemId;

  useEffect(() => {
    setIsLoading(true);
    if (route.params?.itemId === 'comick') {
      fetchAndFormatData('https://api.comick.io/chapter?lang=en&accept_erotic_content=true&page=1&device-memory=4&order=hot')
        .then(newData => {
          setData(newData);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      fetchData(extenstion, page = '1')
        .then(newData => {
          setData(newData);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [route.params?.itemId]);

  const renderItem = ({ item }) => (
    <MangaItem item={item} onPress={() => navigation.navigate('Info', { item, extenstion })} />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
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
    <View style={styles.container}>
      <TopBar />
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
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default ExtentionScreen;
