import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SettingsScreen() {
  const handleLogout = async () => {
    try {
      await auth().signOut();
      Alert.alert('Logged out');
    } catch (error) {
      Alert.alert('Logout failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text>Customize your app settings here.</Text>
      <View style={styles.buttonContainer}>
        <Button title="Log Out" onPress={handleLogout} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
  },
});
