import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import NavBar from '../components/NavBar';
import TopBar from '../components/TopBar';

const UpdateScreen = ({ route }) => {
  return (
    <View style={styles.container}>
      <TopBar />
      <Text></Text>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    alignContent:'center'
  }
});

export default UpdateScreen;
