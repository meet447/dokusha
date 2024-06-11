import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button } from 'react-native';
import { infoManga } from '../api/comick';

const InfoScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [data, setData] = useState([]);

  
  useEffect(() => {
    infoManga(item.hid)
      .then(newData => {
        setData(newData);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.rating}>9.33 - Amazing</Text>
        <Text style={styles.description}>
          Todo
        </Text>
        <View style={styles.tagsContainer}>
          {data.map((chapter, index) => (
            <Button style={{backgroundColor:"black"}} key={index} title={chapter.chap + ":" +chapter.title} onPress={() => navigation.navigate('Read', { chapter })} />
          ))}
        </View>
      </View>
    </ScrollView>
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
  tagsContainer: {
    flexDirection: 'column', // Changed to column to stack buttons vertically
  },
});

export default InfoScreen;
