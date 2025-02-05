import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { theme } from './constants/theme';
import HomeScreen from './screens/HomeScreen';
import InfoScreen from './screens/InfoScreen';
import UpdateScreen from './screens/UpdatesScreen'
import ExploreScreen from './screens/ExploreScreen' 
import ExtentionScreen from './screens/ExtentionScreen';
import ReadScreen from './screens/ReadScreen';
import SearchScreen from './screens/SearchScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoadingScreen from './components/LoadingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <NavigationContainer
            fallback={<LoadingScreen />}
            onStateChange={(state) => {
              // Track navigation state changes
              console.log('New state:', state);
            }}
          >
            <Stack.Navigator 
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: theme.colors.background },
                // Add screen transition animations
                cardStyleInterpolator: ({ current, layouts }) => ({
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                }),
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Info" component={InfoScreen} />
              <Stack.Screen name="Updates" component={UpdateScreen} />
              <Stack.Screen name="Explore" component={ExploreScreen} />
              <Stack.Screen name="Extention" component={ExtentionScreen} />
              <Stack.Screen name="Read" component={ReadScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
