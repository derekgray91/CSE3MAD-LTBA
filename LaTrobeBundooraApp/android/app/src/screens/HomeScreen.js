// src/screens/HomeScreen.js
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);

  // Replace this dummy data with your actual campus POI information
  const poiData = [
    {
      id: 1,
      name: 'Library',
      category: 'Education',
      coordinate: { latitude: -37.6763, longitude: 145.0459 },
      rating: 4.5,
      photos: ['https://example.com/photo1.jpg'],
    },
    // Add more POI objects as required
  ];

  const onPOIPress = (poi) => {
    setSelectedPOI(poi);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search POI..."
        onChangeText={(text) => setSearchText(text)}
        value={searchText}
      />
      
      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -37.6763,
          longitude: 145.0459,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {poiData.map((poi) => (
          <Marker
            key={poi.id}
            coordinate={poi.coordinate}
            onPress={() => onPOIPress(poi)}
          />
        ))}
      </MapView>
      
      {/* POI Pop-up Modal */}
      {selectedPOI && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.poiTitle}>{selectedPOI.name}</Text>
              <Text>Category: {selectedPOI.category}</Text>
              <Text>Rating: {selectedPOI.rating}</Text>
              {/* You might loop over selectedPOI.photos to display images */}
              
              {/* Button to view detailed information */}
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  setModalVisible(false);
                  // Pass POI data to the DetailScreen using navigation parameters
                  navigation.navigate('POI', { poi: selectedPOI });
                }}
              >
                <Text style={styles.detailButtonText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  poiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  detailButtonText: {
    color: '#fff',
  },
  closeText: {
    marginTop: 10,
    color: '#2196F3',
  },
});
