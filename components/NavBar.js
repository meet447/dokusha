import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NavBar = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { paddingBottom: insets.bottom }
    ]}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.tab}>
        <MaterialIcons name="library-books" size={24} color={theme.colors.text.primary} />
        <Text style={styles.text}>Library</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Updates')} style={styles.tab}>
        <MaterialIcons name="update" size={24} color={theme.colors.text.primary} />
        <Text style={styles.text}>Updates</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.tab}>
        <MaterialIcons name="history" size={24} color={theme.colors.text.primary} />
        <Text style={styles.text}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Explore')} style={styles.tab}>
        <MaterialIcons name="search" size={24} color={theme.colors.text.primary} />
        <Text style={styles.text}>Browse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.tab}>
        <MaterialIcons name="settings" size={24} color={theme.colors.text.primary} />
        <Text style={styles.text}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
});

export default NavBar;
