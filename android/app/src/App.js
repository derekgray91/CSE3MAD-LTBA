// App.js

import auth from '@react-native-firebase/auth';
import perf from '@react-native-firebase/perf'; // ← added import
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
import { SettingsStackNavigator } from './navigation/AppNavigation';
import DetailedPOI from './screens/DetailedPOI';
import FilterScreen from './screens/FilterScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import POIListScreen from './screens/POIListScreen';
import RegisterScreen from './screens/RegisterScreen';

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
        component={DetailedPOI}
        options={{
          headerShown: true,
          headerTitle: 'Location Details',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0'
          }
        }}
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
        component={SettingsStackNavigator}
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

  // ← new effect for cold-start tracing
  useEffect(() => {
    async function measureColdStart() {
      const trace = await perf().newTrace('app_cold_start');
      trace.start();
      // (any early init work you do goes here)
      trace.stop();
    }
    measureColdStart();
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(u => {
      setUser(u);
      if (initializing) setInit(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <SafeAreaProvider testID="safe-area-provider">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        {user ? <MainTabNavigator testID="main-tab" /> : <AuthStackNavigator testID="auth-stack" />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
