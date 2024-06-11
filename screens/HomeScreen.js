import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import MangaItem from '../components/MangaItem';

const DATA = [
  {
    id: '1',
    title: 'Solo Leveling',
    image: 'https://i.ytimg.com/vi/Agfy5slamJk/maxresdefault.jpg',
  },
  {
    id: '2',
    title: 'Kaguya-sama',
    image: 'https://i.ytimg.com/vi/Agfy5slamJk/maxresdefault.jpg',
  },
  {
    id: '3',
    title: 'Kaguya-sama',
    image: 'https://i.ytimg.com/vi/Agfy5slamJk/maxresdefault.jpg',
  },
  // Add more items as needed
];

const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <MangaItem item={item} onPress={() => navigation.navigate('Info', { item })} />
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  list: {
    justifyContent: 'space-around',
    paddingBottom: 60, // to accommodate the navbar
  },
});

export default HomeScreen;