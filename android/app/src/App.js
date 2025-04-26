import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import { HomeScreen, DetailScreen, LoginScreen, RegisterScreen, SettingsScreen, POIListScreen, FilterScreen } from './screens';

// Enable screens
enableScreens();

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// For now, we'll create placeholder components for screens not yet implemented
const PlaceholderScreen = () => null;

// Bottom tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="POIs"
        component={POIStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="place" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// POI stack navigator
const POIStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="POIList"
        component={POIListScreen}
        options={{ title: 'Campus Locations' }}
      />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ title: 'Filter Locations' }}
      />
      <Stack.Screen
        name="DetailedPOI"
        component={PlaceholderScreen}
        options={{ title: 'Location Details' }}
      />
    </Stack.Navigator>
  );
};

// Authentication stack navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(userAuth => {
      setUser(userAuth);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        {user ? <MainTabNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}