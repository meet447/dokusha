import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import MangaItem from '../components/MangaItem';

const DATA = [
  {
    id: 'comick',
    title: 'Comick.io',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4g1NRYkI7OlBNJohgJNxvoieb70jkWJplYQ&s',
  },
  {
    id: 'mangadex',
    title: 'MangaDex',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcqG9lI4gr0v0sJr4cOfvlaz-aVHgTjLpLfw&s',
  },
  {
    id: '3',
    title: 'Coming Soon',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSERAQEBEVEBMRFxUXFRue92hjQXOPUAiJjgjcyrJQHS5FK0885b/utPwJHsTa6Suh3KKZv7aeWU/w5EYv0ZifiptdOtDuc4Ob/ANuXHldPOfhlW+CbNNk4j4P9Ej79/fdNmmpUbm+DnXtC6MnWyeYe4FxaPcmzTg4R3JWG5p6lzDqbKwPHVdtiOuxTZpDcN4j1tLdzod9YP+pEcse0faHusqODQ0zppGRR53PNh+ZPQNPsWFyuKKftLO3RNdX1hbGDKBkETYo9DdJ1ucdLj1ry+Rem7XNb1GPZi1RFENta7ZFR2MVnATEnMAx2f3LofH1UxXuXL+RiZo1DawvjITdkGYa5OX1R+a++V8hP+bf/AF8MX46P93P+I69xJJcbk6SdN1yaqpq/u3Ypoin/ADGmFF1HgAViddlmN90cw/ipHNd8Vope449I1HpHxXRxs',
  },
];

const ExploreScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <MangaItem item={item} onPress={() => navigation.navigate('Extention', { itemId: item.id })} />
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

export default ExploreScreen;
