import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { enableScreens } from 'react-native-screens';
enableScreens();

import BottomTabNavigator from './navigation/BottomTabNavigator';
import AuthNavigator from './navigation/AuthNavigator';

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
    <NavigationContainer>
      {user ? <BottomTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
