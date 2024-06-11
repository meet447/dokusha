import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const NavBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.tab}>
        <MaterialIcons name="library-books" size={24} color="black" />
        <Text style={styles.text}>Library</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Updates')} style={styles.tab}>
        <MaterialIcons name="update" size={24} color="black" />
        <Text style={styles.text}>Updates</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.tab}>
        <MaterialIcons name="history" size={24} color="black" />
        <Text style={styles.text}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Explore')} style={styles.tab}>
        <MaterialIcons name="search" size={24} color="black" />
        <Text style={styles.text}>Browse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.tab}>
        <MaterialIcons name="more-horiz" size={24} color="black" />
        <Text style={styles.text}>More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#333',
  },
});

export default NavBar;
