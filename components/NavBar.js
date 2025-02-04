import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Home', icon: 'home', route: 'Home' },
    { name: 'Updates', icon: 'update', route: 'Updates' },
    { name: 'Explore', icon: 'explore', route: 'Explore' },
    { name: 'History', icon: 'history', route: 'History' },
    { name: 'Settings', icon: 'settings', route: 'Settings' },
  ];

  const isActive = (tabRoute) => route.name === tabRoute;

  return (
    <View style={[
      styles.container, 
      { paddingBottom: Math.max(insets.bottom, 8) }
    ]}>
      <View style={styles.background}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.route}
            style={[
              styles.tab,
              isActive(tab.route) && styles.activeTab
            ]}
            onPress={() => navigation.navigate(tab.route)}
          >
            <View style={styles.tabContent}>
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={isActive(tab.route) ? theme.colors.primary : theme.colors.text.secondary}
                style={styles.icon}
              />
              <Text style={[
                styles.tabText,
                isActive(tab.route) && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </View>
            {isActive(tab.route) && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingTop: 8,
    zIndex: 1000,
  },
  background: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.border}40`,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    transform: [{ scale: 1.05 }],
  },
  icon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: '50%',
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
  },
});

export default NavBar;
