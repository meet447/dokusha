import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import ImageCache from '../services/ImageCache';
import { theme } from '../constants/theme';

const OptimizedImage = ({ source, style, resizeMode = 'contain', priority = 'normal' }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!source.uri) return;

      try {
        // Check cache first
        let uri = await ImageCache.getCachedImage(source.uri);
        
        if (!uri) {
          // Cache miss - download and cache
          uri = await ImageCache.cacheImage(source.uri);
        }

        if (isMounted) {
          setImageUri(uri);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setImageUri(source.uri); // Fallback to original URL
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [source.uri]);

  if (loading) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      resizeMode={resizeMode}
      loading={priority}
    />
  );
};

export default React.memo(OptimizedImage); 