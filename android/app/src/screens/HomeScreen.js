// src/screens/HomeScreen.js

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import StarRating from '../components/StarRating';
import * as poiService from '../services/firebase/poiService';

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText]     = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPOI, setSelectedPOI]   = useState(null);
  const [pois, setPois]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    loadPOIs();
  }, []);

  const loadPOIs = async () => {
    setLoading(true);
    try {
      const response = await poiService.getAllPOIs();
      if (response.success) {
        setPois(response.data);
        setError('');
      } else {
        setError('Failed to load POIs');
      }
    } catch (err) {
      console.error('Error loading POIs:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const onPOIPress = poi => {
    setSelectedPOI(poi);
    setModalVisible(true);
  };

  // Filtered list based on search
  const filteredPois = pois.filter(poi =>
    poi.name.toLowerCase().includes(searchText.toLowerCase()) ||
    poi.buildingName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for points of interest..."
        onChangeText={setSearchText}
        value={searchText}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      {/* Map */}
      {!loading && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: filteredPois[0]?.latitude || -37.6763,
            longitude: filteredPois[0]?.longitude || 145.0459,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {filteredPois.map(poi => (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: parseFloat(poi.latitude),
                longitude: parseFloat(poi.longitude)
              }}
              onPress={() => onPOIPress(poi)}
            />
          ))}
        </MapView>
      )}

      {/* POI Detail Modal */}
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
              <Text style={styles.poiSub}>
                {selectedPOI.buildingName}, Level {selectedPOI.levelNumber}
              </Text>
              <View style={styles.modalRating}>
                <StarRating rating={selectedPOI.averageRating || 0} size={20} />
                <Text style={styles.reviewCount}>
                  ({selectedPOI.reviewCount || 0})
                </Text>
              </View>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('POIs', {
                    screen: 'DetailedPOI',
                    params: { poiId: selectedPOI.id },
                  });
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

      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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
    paddingHorizontal: 12,
    zIndex: 2,
    elevation: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  poiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  poiSub: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewCount: {
    marginLeft: 6,
    fontSize: 16,
    color: '#666',
  },
  detailButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginBottom: 12,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeText: {
    color: '#2196F3',
    fontSize: 16,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#B00020',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
});
