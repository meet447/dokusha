import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import MangaItem from '../components/MangaItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA = [
];

const library = AsyncStorage.getItem('library');
console.log(library)


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