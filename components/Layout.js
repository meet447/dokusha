import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import TopBar from './TopBar';
import NavBar from './NavBar';

const Layout = ({ children, showTopBar = true, showNavBar = true }) => {
  return (
    <View style={styles.container}>
      {showTopBar && <TopBar />}
      <View style={styles.content}>
        {children}
      </View>
      {showNavBar && <NavBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    marginBottom: 70, // Height of NavBar + padding
  },
});

export default Layout; 