// src/navigation/AppNavigation.js

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your real screens
import DetailedPOI from '../screens/DetailedPOI';
import FilterScreen from '../screens/FilterScreen';
import HomeScreen from '../screens/HomeScreen';
import POIListScreen from '../screens/POIListScreen';

// Placeholder for any screens not yet implemented
const PlaceholderScreen = () => null;

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// Map stack navigator
function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapScreen"
        component={HomeScreen}
        options={{ title: 'Campus Map' }}
      />
      <Stack.Screen
        name="DetailedPOI"
        component={DetailedPOI}
        options={{ title: 'Location Testing' }}
      />
    </Stack.Navigator>
  );
}

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
        options={{ title: 'Location Testing' }}
      />
      <Stack.Screen
        name="WriteReview"
        component={PlaceholderScreen}
        options={{ title: 'Write a Review' }}
      />
    </Stack.Navigator>
  );
}

// Settings stack navigator (placeholders)
function SettingsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ChangeName"
        component={PlaceholderScreen}
        options={{ title: 'Change Display Name' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={PlaceholderScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="MyReviews"
        component={PlaceholderScreen}
        options={{ title: 'My Reviews' }}
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
        component={MapStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="map" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="POIs"
        component={POIStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="place" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="settings" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator
export default function AppNavigation() {
  // Flip to 'true' (or wire up your auth logic) to show the main app
  const isAuthenticated = true;

  return (
    <NavigationContainer>
      {isAuthenticated
        ? <MainTabNavigator />
        : <PlaceholderScreen />  /* Replace with your Auth flow when ready */}
    </NavigationContainer>
  );
}
