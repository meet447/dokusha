import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;
const CACHE_INDEX = 'image_cache_index';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

class ImageCache {
  constructor() {
    this.cacheIndex = new Map();
    this.initializeCache();
  }

  async initializeCache() {
    try {
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_FOLDER);
      }

      // Load cache index
      const index = await AsyncStorage.getItem(CACHE_INDEX);
      if (index) {
        this.cacheIndex = new Map(JSON.parse(index));
      }

      // Clean old cache entries
      this.cleanCache();
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  async getCachedImage(url) {
    try {
      const cacheEntry = this.cacheIndex.get(url);
      if (!cacheEntry) return null;

      const filePath = `${CACHE_FOLDER}${cacheEntry.fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (!fileInfo.exists) {
        this.cacheIndex.delete(url);
        return null;
      }

      // Update last accessed time
      cacheEntry.lastAccessed = Date.now();
      this.cacheIndex.set(url, cacheEntry);
      this.saveCacheIndex();

      return fileInfo.uri;
    } catch (error) {
      console.error('Error getting cached image:', error);
      return null;
    }
  }

  async cacheImage(url) {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const filePath = `${CACHE_FOLDER}${fileName}`;

      await FileSystem.downloadAsync(url, filePath);

      this.cacheIndex.set(url, {
        fileName,
        lastAccessed: Date.now(),
        size: (await FileSystem.getInfoAsync(filePath)).size
      });

      await this.saveCacheIndex();
      await this.cleanCache();

      return filePath;
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  }

  async cleanCache() {
    try {
      let totalSize = 0;
      const now = Date.now();
      const entries = Array.from(this.cacheIndex.entries());

      // Sort by last accessed time
      entries.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed);

      for (const [url, entry] of entries) {
        // Remove old entries
        if (now - entry.lastAccessed > MAX_CACHE_AGE) {
          await this.removeCacheEntry(url);
          continue;
        }

        totalSize += entry.size;

        // Remove oldest entries if cache is too large
        if (totalSize > MAX_CACHE_SIZE) {
          await this.removeCacheEntry(url);
        }
      }
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }

  async removeCacheEntry(url) {
    try {
      const entry = this.cacheIndex.get(url);
      if (!entry) return;

      const filePath = `${CACHE_FOLDER}${entry.fileName}`;
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      this.cacheIndex.delete(url);
      await this.saveCacheIndex();
    } catch (error) {
      console.error('Error removing cache entry:', error);
    }
  }

  async saveCacheIndex() {
    try {
      await AsyncStorage.setItem(
        CACHE_INDEX,
        JSON.stringify(Array.from(this.cacheIndex.entries()))
      );
    } catch (error) {
      console.error('Error saving cache index:', error);
    }
  }
}

export default new ImageCache(); 