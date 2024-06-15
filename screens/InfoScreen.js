import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, FlatList, Alert } from 'react-native';
import { infoManga } from '../api/comick';
import { infoManga1 } from '../api/image/manga';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InfoScreen = ({ route, navigation }) => {
  const { item } = route.params;
  console.log(route.params)
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newData = await infoManga(item.hid);
        setData(newData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching manga info:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to fetch manga information. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const addToLibrary = async () => {
  try {
    // Check if data is available
    if (!data || data.length === 0) {
      // If data is not available or empty, show a message and return
      Alert.alert('Info', 'Manga information is not available. Please try again later.');
      return;
    }

    // Get existing library data or initialize an empty array
    const existingLibrary = await AsyncStorage.getItem('library');
    const library = existingLibrary ? JSON.parse(existingLibrary) : [];

    // Check if the item is already in the library
    const exists = library.some((item) => item.hid === data[0].hid);

    if (!exists) {
      // Add the item to the library
      library.push(data[0]);
      await AsyncStorage.setItem('library', JSON.stringify(library));
      Alert.alert('Success', 'Added to library.');
    } else {
      Alert.alert('Info', 'This item is already in your library.');
    }
  } catch (error) {
    console.error('Error adding to library:', error);
    Alert.alert('Error', 'Failed to add to library. Please try again later.');
  }
};



  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.rating}>9.33 - Amazing</Text>
        <Text style={styles.description}>Todo</Text>
        <Button title='First Chapter' onPress={() => navigation.navigate('Read', { chapter: { hid: data[data.length - 1]?.hid || "1" } })} />
        <Button title='Add To Library' onPress={addToLibrary} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.hid}_${index}`}
        renderItem={({ item }) => (
          <Button
            title={`${item.chap}: ${item.title}`}
            onPress={() => navigation.navigate('Read', { chapter: item })}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#d3d3d3',
    marginBottom: 20,
  },
});

export default InfoScreen;
