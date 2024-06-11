import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

const MangaItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.image} />
    <Text style={styles.title}>{item.title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  title: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    width: 100,
  },
});

export default MangaItem;
