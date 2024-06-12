import React, { useState, useEffect, useMemo } from 'react';
import { Button, SafeAreaView, View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';
import { fetchImages } from '../api/comick'; // Assuming fetchImages function is correctly implemented
import { useNavigation } from '@react-navigation/native';

const ReadScreen = ({ route }) => {
  const { chapter } = route.params;
  const { hid } = chapter;
  const navigation = useNavigation();

  console.log(route.params);

  const [images, setImages] = useState([]);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isWebtoonMode, setIsWebtoonMode] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [nextChapterHid, setNextChapterHid] = useState(null);
  const [prevChapterHid, setPrevChapterHid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const slideModeWidth = useMemo(() => screenWidth, [screenWidth]);
  const slideModeHeight = useMemo(() => screenHeight, [screenHeight]);
  const webtoonModeWidth = useMemo(() => screenWidth, [screenWidth]);
  const webtoonModeHeight = useMemo(() => screenHeight * 0.8, [screenHeight]);

  useEffect(() => {
    const fetchChapterImages = async () => {
      setLoading(true);
      try {
        const fetchedImages = await fetchImages(hid, isWebtoonMode ? webtoonModeWidth : slideModeWidth, isWebtoonMode ? webtoonModeHeight : slideModeHeight);
        setImages(fetchedImages.images);
        if (fetchedImages.next && fetchedImages.next.length > 0) {
          setNextChapterHid(fetchedImages.next[0].hid);
        } else {
          setNextChapterHid(null);
        }
        if (fetchedImages.prev && fetchedImages.prev.length > 0) {
          setPrevChapterHid(fetchedImages.prev[0].hid);
        } else {
          setPrevChapterHid(null);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchChapterImages();
  }, [hid, isWebtoonMode]);

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

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {isWebtoonMode ? (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {images.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.webtoonImage} resizeMode="contain" />
              ))}
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
              {images.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.image} resizeMode="contain" />
              ))}
            </ScrollView>
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
  }
});

export default ReadScreen;
