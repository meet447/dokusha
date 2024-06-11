import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import MangaItem from '../components/MangaItem';
import {fetchAndFormatData} from '../api/comick'

const ExtentionScreen = ({ navigation }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchAndFormatData('https://api.comick.io/chapter?lang=en&accept_erotic_content=true&page=1&device-memory=4&order=hot')
      .then(newData => {
        setData(newData);
      });
  }, []);

  const renderItem = ({ item }) => (
    <MangaItem item={item} onPress={() => navigation.navigate('Info', { item })} />
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <FlatList
        data={data}
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

export default ExtentionScreen;