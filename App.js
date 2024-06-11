import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import InfoScreen from './screens/InfoScreen';
import UpdateScreen from './screens/UpdatesScreen'
import ExploreScreen from './screens/ExploreScreen' 
import ExtentionScreen from './screens/ExtentionScreen';
import ReadScreen from './screens/ReadScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Info"
          component={InfoScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Updates"
          component={UpdateScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Extention"
          component={ExtentionScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Read"
          component={ReadScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
