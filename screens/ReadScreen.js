import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, SafeAreaView, View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import TopBar from '../components/TopBar';
import { fetchImages } from '../api/comick'; // Assuming fetchImages function is correctly implemented
import { useNavigation } from '@react-navigation/native';

const ReadScreen = ({ route }) => {
  const { chapter } = route.params;
  const { hid } = chapter;
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [images, setImages] = useState([]);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isWebtoonMode, setIsWebtoonMode] = useState(false);
  const [nextChapterHid, setNextChapterHid] = useState(null);
  const [prevChapterHid, setPrevChapterHid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const slideModeWidth = useMemo(() => screenWidth, [screenWidth]);
  const slideModeHeight = useMemo(() => screenHeight, [screenHeight]);
  const webtoonModeWidth = useMemo(() => screenWidth, [screenWidth]);
  const webtoonModeHeight = useMemo(() => screenHeight * 0.8, [screenHeight]);

  const fetchChapterImages = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedImages = await fetchImages(hid, isWebtoonMode ? webtoonModeWidth : slideModeWidth, isWebtoonMode ? webtoonModeHeight : slideModeHeight);
      setImages(fetchedImages.images);
      setNextChapterHid(fetchedImages.next?.[0]?.hid || null);
      setPrevChapterHid(fetchedImages.prev?.[0]?.hid || null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [hid, isWebtoonMode, slideModeWidth, slideModeHeight, webtoonModeWidth, webtoonModeHeight]);

  useEffect(() => {
    fetchChapterImages();
  }, [fetchChapterImages]);

  const goToNextChapter = () => {
    if (nextChapterHid) {
      navigation.push('Read', { chapter: { hid: nextChapterHid } });
    }
  };

  const goToPreviousChapter = () => {
    if (prevChapterHid) {
      navigation.push('Read', { chapter: { hid: prevChapterHid } });
    }
  };

  const toggleMode = () => {
    setIsWebtoonMode(!isWebtoonMode);
  };

  const renderImage = ({ item }) => (
    <Image source={{ uri: item }} style={isWebtoonMode ? styles.webtoonImage : styles.image} resizeMode="contain" />
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : error ? (
        <>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchChapterImages} />
        </>
      ) : (
        <>
          {isWebtoonMode ? (
            <FlatList
              data={images}
              renderItem={renderImage}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
            />
          ) : (
            <FlatList
              data={images}
              renderItem={renderImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const { x } = event.nativeEvent.contentOffset;
                const panelIndex = Math.round(x / screenWidth);
                setCurrentPanel(panelIndex);
              }}
              scrollEventThrottle={200}
              style={styles.scrollView}
            />
          )}
        </>
      )}
      <View style={styles.controls}>
        {prevChapterHid && (
          <TouchableOpacity onPress={goToPreviousChapter}>
            <Text style={styles.controlText}>Previous</Text>
          </TouchableOpacity>
        )}
        {nextChapterHid && (
          <TouchableOpacity onPress={goToNextChapter}>
            <Text style={styles.controlText}>Next</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={toggleMode}>
          <Text style={styles.controlText}>{isWebtoonMode ? 'Slide Mode' : 'Webtoon Mode'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    height: Dimensions.get('window').height * 0.8,
    maxHeight: 800,
    resizeMode: 'contain',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
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
  },
});

export default ReadScreen;
