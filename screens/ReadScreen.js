import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { fetchImages } from '../api/comick';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';

const ReadScreen = ({ route, navigation }) => {
  const { chapter } = route.params;
  const { hid } = chapter;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [images, setImages] = useState([]);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isWebtoonMode, setIsWebtoonMode] = useState(false);
  const [nextChapterHid, setNextChapterHid] = useState(null);
  const [prevChapterHid, setPrevChapterHid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [readingDirection, setReadingDirection] = useState('ltr'); // 'ltr' or 'rtl'
  const [backgroundColor, setBackgroundColor] = useState('black'); // 'black' or 'white'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [readingMode, setReadingMode] = useState('paged'); // 'paged', 'webtoon', 'continuous'
  const [pageLayout, setPageLayout] = useState('single'); // 'single', 'double'
  const [fitMode, setFitMode] = useState('width'); // 'width', 'height', 'both'

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

  useEffect(() => {
    if (readingMode === 'webtoon') {
      setZoomLevel(1.01); // 150% zoom for webtoon mode
      setFitMode('width'); // Force width fitting for webtoon
    } else if (readingMode === 'paged') {
      setZoomLevel(1); // Reset zoom for paged mode
      setFitMode('both'); // Default to 'both' for paged mode
    }
  }, [readingMode]);

  const updateHistory = async (chapterToAdd) => {
    try {
      const existingHistory = await AsyncStorage.getItem('history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      const historyEntry = {
        manga: route.params.manga, // Make sure to pass manga info in navigation params
        chapter: chapterToAdd,
        timestamp: new Date().toISOString()
      };

      // Remove any existing entries for the same manga
      const filteredHistory = history.filter(
        entry => entry.manga.hid !== route.params.manga.hid
      );

      // Add new entry at the beginning
      filteredHistory.unshift(historyEntry);

      // Keep only the last 100 entries
      const trimmedHistory = filteredHistory.slice(0, 100);

      // Save updated history
      await AsyncStorage.setItem('history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error updating history:', error);
    }
  };

  const goToNextChapter = async () => {
    if (nextChapterHid) {
      const nextChapter = { hid: nextChapterHid };
      await updateHistory(nextChapter);
      navigation.push('Read', { 
        chapter: nextChapter,
        manga: route.params.manga // Pass manga info
      });
    }
  };

  const goToPreviousChapter = async () => {
    if (prevChapterHid) {
      const prevChapter = { hid: prevChapterHid };
      await updateHistory(prevChapter);
      navigation.push('Read', { 
        chapter: prevChapter,
        manga: route.params.manga // Pass manga info
      });
    }
  };

  const toggleMode = () => {
    setIsWebtoonMode(!isWebtoonMode);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const getImageStyle = () => {
    switch (readingMode) {
      case 'webtoon':
        return {
          width: screenWidth,
          height: 'auto',  // Let height be determined by aspect ratio
          minHeight: screenHeight, // Minimum height to prevent tiny images
          resizeMode: 'contain',
        };
      case 'continuous':
        return {
          width: screenWidth,
          height: screenHeight,
          resizeMode: 'contain',
        };
      case 'paged':
      default:
        return {
          width: pageLayout === 'double' ? screenWidth / 2 : screenWidth,
          height: screenHeight,
          resizeMode: 'contain',
        };
    }
  };

  // Move dynamic styles inside the component
  const dynamicStyles = {
    image: {
      width: screenWidth,
      height: '100%',
      resizeMode: 'contain',
    },
    webtoonImage: {
      width: screenWidth,
      height: undefined,
      aspectRatio: 1/1.5,
      resizeMode: 'contain',
    },
    doublePageContainer: {
      flexDirection: 'row',
      width: screenWidth,
    },
    doublePageImage: {
      width: screenWidth / 2,
      height: screenHeight,
      resizeMode: 'contain',
    },
  };

  // Update the renderImage function
  const renderImage = ({ item, index }) => {
    const imageStyle = {
      ...getImageStyle(),
      transform: [{ scale: zoomLevel }]
    };

    if (readingMode === 'paged' && pageLayout === 'double' && index % 2 === 0) {
      return (
        <View style={dynamicStyles.doublePageContainer}>
          <Pressable onPress={toggleControls} style={{ flex: 1 }}>
            <OptimizedImage 
              source={{ uri: item }} 
              style={[dynamicStyles.doublePageImage, imageStyle]}
              resizeMode={fitMode === 'both' ? 'contain' : fitMode === 'width' ? 'cover' : 'contain'}
              priority={index < 2 ? 'high' : 'normal'}
            />
          </Pressable>
          {index + 1 < images.length && (
            <Pressable onPress={toggleControls} style={{ flex: 1 }}>
              <OptimizedImage 
                source={{ uri: images[index + 1] }} 
                style={[dynamicStyles.doublePageImage, imageStyle]}
                resizeMode={fitMode === 'both' ? 'contain' : fitMode === 'width' ? 'cover' : 'contain'}
                priority={index < 2 ? 'high' : 'normal'}
              />
            </Pressable>
          )}
        </View>
      );
    }

    return (
      <Pressable onPress={toggleControls} style={{ flex: 1 }}>
        <OptimizedImage 
          source={{ uri: item }} 
          style={[
            readingMode === 'webtoon' ? dynamicStyles.webtoonImage : dynamicStyles.image,
            imageStyle
          ]}
          resizeMode={fitMode === 'both' ? 'contain' : fitMode === 'width' ? 'cover' : 'contain'}
          priority={index < 2 ? 'high' : 'normal'}
        />
      </Pressable>
    );
  };

  // Add image preloading
  const preloadImages = (images) => {
    const nextImages = images.slice(currentPanel + 1, currentPanel + 3);
    nextImages.forEach(uri => {
      Image.prefetch(uri);
    });
  };

  useEffect(() => {
    const addToHistory = async () => {
      if (chapter && route.params.manga) {
        await updateHistory(chapter);
      }
    };
    addToHistory();
  }, [chapter]);

  return (
    <Layout showTopBar={false} showNavBar={false}>
      {/* Top Controls */}
      {showControls && (
        <View style={styles.topControls}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.controlButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.chapterInfo}>Chapter {chapter.chap}</Text>
          <View style={styles.controlButton} /> {/* Empty view for flex spacing */}
        </View>
      )}

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading chapter...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChapterImages}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
            <FlatList
              data={images}
              renderItem={renderImage}
          keyExtractor={(_, index) => String(index)}
          horizontal={readingMode === 'paged'}
          pagingEnabled={readingMode === 'paged'}
          showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
          onViewableItemsChanged={({viewableItems}) => {
            if (viewableItems.length > 0) {
              setCurrentPanel(viewableItems[0].index);
              preloadImages(images);
            }
          }}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
          style={[
            styles.scrollView,
            readingMode === 'webtoon' && styles.webtoonScrollView,
          ]}
          contentContainerStyle={[
            readingMode === 'webtoon' && {
              paddingBottom: 80,
              gap: 0,
            }
          ]}
          inverted={readingDirection === 'rtl' && readingMode === 'paged'}
          ItemSeparatorComponent={null}
        />
      )}

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomControlsContainer}>
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              onPress={goToPreviousChapter} 
              style={[styles.navButton, !prevChapterHid && styles.navButtonDisabled]}
              disabled={!prevChapterHid}
            >
              <MaterialIcons name="skip-previous" size={24} color={theme.colors.text.primary} />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            
            <Text style={styles.pageInfo}>
              <Text>{currentPanel + 1}</Text>
              <Text> / </Text>
              <Text>{images.length}</Text>
            </Text>
            
            <TouchableOpacity 
              onPress={goToNextChapter}
              style={[styles.navButton, !nextChapterHid && styles.navButtonDisabled]}
              disabled={!nextChapterHid}
            >
              <Text style={styles.navButtonText}>Next</Text>
              <MaterialIcons name="skip-next" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => setShowSettings(true)} 
            style={styles.settingsButton}
          >
            <MaterialIcons name="settings" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reader Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Reading Mode</Text>
              <View style={styles.settingButtons}>
                <TouchableOpacity 
                  style={[styles.settingButton, readingMode === 'paged' && styles.settingButtonActive]}
                  onPress={() => {
                    setReadingMode('paged');
                    setZoomLevel(1);
                    setFitMode('both');
                  }}
                >
                  <MaterialIcons name="book" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.settingButtonText}>Paged</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.settingButton, readingMode === 'webtoon' && styles.settingButtonActive]}
                  onPress={() => {
                    setReadingMode('webtoon');
                    setZoomLevel(1.0);
                    setFitMode('both');
                  }}
                >
                  <MaterialIcons name="vertical-align-bottom" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.settingButtonText}>Webtoon</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.settingButton, readingMode === 'continuous' && styles.settingButtonActive]}
                  onPress={() => setReadingMode('continuous')}
                >
                  <MaterialIcons name="swap-vert" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.settingButtonText}>Continuous</Text>
                </TouchableOpacity>
              </View>
            </View>

            {readingMode === 'paged' && (
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>Page Layout</Text>
                <View style={styles.settingButtons}>
                  <TouchableOpacity 
                    style={[styles.settingButton, pageLayout === 'single' && styles.settingButtonActive]}
                    onPress={() => setPageLayout('single')}
                  >
                    <MaterialIcons name="crop-portrait" size={24} color={theme.colors.text.primary} />
                    <Text style={styles.settingButtonText}>Single</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.settingButton, pageLayout === 'double' && styles.settingButtonActive]}
                    onPress={() => setPageLayout('double')}
                  >
                    <MaterialIcons name="crop-landscape" size={24} color={theme.colors.text.primary} />
                    <Text style={styles.settingButtonText}>Double</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Reading Direction</Text>
              <View style={styles.settingButtons}>
                <TouchableOpacity 
                  style={[styles.settingButton, readingDirection === 'ltr' && styles.settingButtonActive]}
                  onPress={() => setReadingDirection('ltr')}
                >
                  <MaterialIcons name="arrow-right" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.settingButtonText}>Left to Right</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.settingButton, readingDirection === 'rtl' && styles.settingButtonActive]}
                  onPress={() => setReadingDirection('rtl')}
                >
                  <MaterialIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.settingButtonText}>Right to Left</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Background</Text>
              <View style={styles.settingButtons}>
                <TouchableOpacity 
                  style={[styles.settingButton, backgroundColor === 'black' && styles.settingButtonActive]}
                  onPress={() => setBackgroundColor('black')}
                >
                  <View style={[styles.colorPreview, { backgroundColor: 'black' }]} />
                  <Text style={styles.settingButtonText}>Black</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.settingButton, backgroundColor === 'white' && styles.settingButtonActive]}
                  onPress={() => setBackgroundColor('white')}
                >
                  <View style={[styles.colorPreview, { backgroundColor: 'white' }]} />
                  <Text style={styles.settingButtonText}>White</Text>
                </TouchableOpacity>
              </View>
            </View>

            {readingMode !== 'webtoon' && (
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>Fit Mode</Text>
                <View style={styles.settingButtons}>
                  <TouchableOpacity 
                    style={[styles.settingButton, fitMode === 'width' && styles.settingButtonActive]}
                    onPress={() => setFitMode('width')}
                  >
                    <MaterialIcons name="swap-horiz" size={24} color={theme.colors.text.primary} />
                    <Text style={styles.settingButtonText}>Width</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.settingButton, fitMode === 'height' && styles.settingButtonActive]}
                    onPress={() => setFitMode('height')}
                  >
                    <MaterialIcons name="swap-vert" size={24} color={theme.colors.text.primary} />
                    <Text style={styles.settingButtonText}>Height</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.settingButton, fitMode === 'both' && styles.settingButtonActive]}
                    onPress={() => setFitMode('both')}
                  >
                    <MaterialIcons name="crop-free" size={24} color={theme.colors.text.primary} />
                    <Text style={styles.settingButtonText}>Both</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {readingMode !== 'webtoon' && (
              <View style={styles.settingSection}>
                <Text style={styles.settingTitle}>Zoom Level</Text>
                <View style={styles.zoomControls}>
                  <TouchableOpacity 
                    style={styles.zoomButton}
                    onPress={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                  >
                    <MaterialIcons name="remove" size={24} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>
                  <TouchableOpacity 
                    style={styles.zoomButton}
                    onPress={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                  >
                    <MaterialIcons name="add" size={24} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  navButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.surface,
  },
  navButtonText: {
    color: theme.colors.text.primary,
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  chapterInfo: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  pageInfo: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  settingSection: {
    marginBottom: 24, // Increase spacing between sections
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  settingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  settingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    marginHorizontal: 4,
    elevation: 1,
  },
  settingButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  settingButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButton: {
    padding: 8,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  zoomText: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  webtoonScrollView: {
    flex: 1,
  },
  webtoonImageContainer: {
    width: '100%',
  },
  settingsButton: {
    alignSelf: 'center',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    elevation: 2,
  },
});

export default ReadScreen;
