// src/screens/DetailScreen.js
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DetailScreen({ route }) {
  // The POI data passed from HomeScreen
  const { poi } = route.params || {};

  if (!poi) {
    return (
      <View style={styles.container}>
        <Text>No POI Data Provided</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{poi.name}</Text>
      <Text>Category: {poi.category}</Text>
      <Text>Rating: {poi.rating}</Text>
      <Text style={styles.sectionHeader}>Photos</Text>
      {poi.photos.map((photoUrl, index) => (
        <Image
          key={index}
          source={{ uri: photoUrl }}
          style={styles.photo}
          resizeMode="cover"
        />
      ))}
      {/* Extend with more detailed information as necessary */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    marginVertical: 10,
  },
  photo: {
    width: 300,
    height: 200,
    marginVertical: 10,
  },
});
