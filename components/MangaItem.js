import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

const MangaItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.image} />
    <Text style={styles.title}>{item.title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    elevation: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 0.7, // Maintain manga cover aspect ratio
    borderRadius: 8,
  },
  title: {
    padding: 8,
    fontSize: 12,
    color: theme.colors.text.primary,
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MangaItem;
