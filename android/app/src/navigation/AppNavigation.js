import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import { POIListScreen, FilterScreen } from '../screens';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="place" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Map stack navigator
const MapStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapScreen"
        component={PlaceholderScreen} // Replace with actual Map screen when implemented
        options={{ title: 'Campus Map' }}
      />
      <Stack.Screen
        name="DetailedPOI"
        component={PlaceholderScreen} // Replace with actual DetailedPOI screen when implemented
        options={{ title: 'Location Details' }}
      />
    </Stack.Navigator>
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
        component={PlaceholderScreen} // Replace with actual DetailedPOI screen when implemented
        options={{ title: 'Location Details' }}
      />
      <Stack.Screen
        name="WriteReview"
        component={PlaceholderScreen} // Replace with actual WriteReview screen when implemented
        options={{ title: 'Write a Review' }}
      />
    </Stack.Navigator>
  );
};

// Settings stack navigator
const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsScreen"
        component={PlaceholderScreen} // Replace with actual Settings screen when implemented
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ChangeNameScreen"
        component={PlaceholderScreen} // Replace with actual ChangeName screen when implemented
        options={{ title: 'Change Display Name' }}
      />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={PlaceholderScreen} // Replace with actual ChangePassword screen when implemented
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="MyReviewsScreen"
        component={PlaceholderScreen} // Replace with actual MyReviews screen when implemented
        options={{ title: 'My Reviews' }}
      />
    </Stack.Navigator>
  );
};

// Authentication stack navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={PlaceholderScreen} /> 
      <Stack.Screen name="Register" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

// Placeholder screen for screens not yet implemented
const PlaceholderScreen = () => null;

// Root navigator that determines whether to show Auth or App flow
const RootNavigator = () => {
  // Here you would normally check if user is authenticated
  const isAuthenticated = false;
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;