import React, { useState, useEffect } from 'react';
import { Button, SafeAreaView, View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import { fetchImages } from '../api/comick'; // Assuming fetchImages function is correctly implemented

const ReadScreen = ({ route }) => {
  const { chapter } = route.params;
  const { hid } = chapter;

  console.log(route.params)

  const [images, setImages] = useState([]);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isWebtoonMode, setIsWebtoonMode] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Assuming you want different dimensions for slide and webtoon modes
  const slideModeWidth = screenWidth;
  const slideModeHeight = screenHeight;

  const webtoonModeWidth = screenWidth; // You may want to set a specific width
  const webtoonModeHeight = screenHeight * 0.8; // You can adjust this as needed

  useEffect(() => {
    const fetchChapterImages = async () => {
      try {
        let fetchedImages;
        if (isWebtoonMode) {
          fetchedImages = await fetchImages(hid, webtoonModeWidth, webtoonModeHeight);
        } else {
          fetchedImages = await fetchImages(hid, slideModeWidth, slideModeHeight);
        }
        setImages(fetchedImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchChapterImages();
  }, [hid, isWebtoonMode]);

  const goToNextPanel = () => {
    setCurrentPanel(currentPanel + 1);
  };

  const goToPreviousPanel = () => {
    setCurrentPanel(currentPanel - 1);
  };

  const toggleMode = () => {
    setIsWebtoonMode(!isWebtoonMode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      {isWebtoonMode ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <Image key={index} source={{ uri: image.url}} style={styles.webtoonImage} resizeMode="contain" />
            ))
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const { x } = event.nativeEvent.contentOffset;
            const panelIndex = Math.round(x / screenWidth);
            setCurrentPanel(panelIndex);
          }}
          scrollEventThrottle={200}
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <Image key={index} source={{ uri: image.url}} style={styles.image} resizeMode="contain" />
            ))
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
        </ScrollView>
      )}
      <View style={styles.controls}>
        <TouchableOpacity onPress={goToPreviousPanel}>
          <Text style={styles.controlText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextPanel}>
          <Text style={styles.controlText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={styles.controlText}>{isWebtoonMode ? 'Slide Mode' : 'Webtoon Mode'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: Dimensions.get('window').width,
    height: '100%',
    resizeMode: 'contain',
  },
  webtoonImage: {
    width: '100%',
    height: Dimensions.get('window').height * 0.8, // Adjust the height to fill the screen
    maxHeight: 800, // Maximum height constraint
    resizeMode: 'contain',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#eee',
  },
  controlText: {
    fontSize: 16,
    color: '#333',
  }
});

export default ReadScreen;
