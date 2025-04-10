// src/navigation/BottomTabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import DetailScreen from '../screens/DetailScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Map" component={HomeScreen} />
      {/* The "POI" tab here can be used to navigate to a list or a particular POI screen.
          Adjust as necessary. */}
      <Tab.Screen name="POI" component={DetailScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
