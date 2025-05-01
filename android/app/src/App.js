// App.js

import auth from '@react-native-firebase/auth';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your actual screen components
import DetailedPOI from './screens/DetailedPOI';
import FilterScreen from './screens/FilterScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import POIListScreen from './screens/POIListScreen';
import RegisterScreen from './screens/RegisterScreen';
import SettingsScreen from './screens/SettingsScreen';

// Enable native screens for better performance
enableScreens();

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// POI stack navigator
function POIStackNavigator() {
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
        component={DetailedPOI}          // ← Use your real detail screen here
        options={{ title: 'Location Details' }}
      />
    </Stack.Navigator>
  );
}

// Main bottom-tabs navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e0e0e0' },
      }}
    >
      <Tab.Screen
        name="Map"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="map" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="POIs"
        component={POIStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="place" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="settings" color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

// Auth stack navigator
function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser]         = useState(null);
  const [initializing, setInit] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(u => {
      setUser(u);
      if (initializing) setInit(false);
    });
    return unsubscribe;
  }, [initializing]);

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
