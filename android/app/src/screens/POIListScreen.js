// src/screens/POIListScreen.js

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import POICard from '../components/POICard';
import * as poiService from '../services/firebase/poiService';

const POIListScreen = ({ navigation }) => {
  const [pois, setPois]             = useState([]);
  const [filteredPois, setFilteredPois] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy]         = useState('name');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Load POIs when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPOIs();
    }, [])
  );

  // Fetch & sort
  const loadPOIs = async () => {
    setLoading(true);
    try {
      const response = await poiService.getAllPOIs();
      console.log('getAllPOIs response:', response);
      if (response.success) {
        console.log(`Loaded ${response.data.length} POIs from Firestore`);
        setPois(response.data);
        setFilteredPois(response.data);
        applySort(response.data, sortBy);
        setError(null);
      } else {
        console.warn('getAllPOIs returned success=false:', response.error);
        setError('Failed to load points of interest');
      }
    } catch (err) {
      console.error('Error loading POIs:', err);
      setError(`Error loading POIs: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigate into the POIs tab, then to DetailedPOI
  const goToPOIDetail = poi => {
    console.log('🏹 goToPOIDetail, poi.id =', poi.id);
    navigation.navigate('POIs', {
      screen: 'DetailedPOI',
      params: { poiId: poi.id },
    });
  };

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPois(pois);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredPois(
        pois.filter(p =>
          p.name.toLowerCase().includes(lower) ||
          p.buildingName.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, pois]);

  // Sorting
  const applySort = (data, type) => {
    const sorted = [...data];
    if (type === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => (b.averageRating||0) - (a.averageRating||0));
    }
    setFilteredPois(sorted);
    setSortBy(type);
  };
  const toggleSort = () => {
    applySort(filteredPois, sortBy === 'name' ? 'rating' : 'name');
  };

  // Filters
  const goToFilter = () => {
    navigation.navigate('Filter', {
      onApplyFilters: applyFilters
    });
  };
  const applyFilters = async filters => {
    setLoading(true);
    try {
      const response = await poiService.filterPOIs(filters);
      if (response.success) {
        setPois(response.data);
        setFilteredPois(response.data);
        applySort(response.data, sortBy);
      } else {
        setError('Failed to apply filters');
      }
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('An error occurred while filtering');
    } finally {
      setLoading(false);
    }
  };

  // Renderers
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search-off" size={60} color="#999" />
        <Text style={styles.emptyText}>No POIs found</Text>
        <Text style={styles.emptySubtext}>
          {searchText ? 'Try a different search' : 'Try different filters'}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search points of interest..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterSortContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={goToFilter}>
          <Icon name="filter-list" size={24} color="#666" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <Icon
            name={sortBy === 'name' ? 'sort-by-alpha' : 'star'}
            size={24}
            color="#666"
          />
          <Text style={styles.sortButtonText}>
            Sort by: {sortBy === 'name' ? 'Name' : 'Rating'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading points of interest...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#B00020" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPOIs}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPois}
          renderItem={({ item }) => (
            <POICard poi={item} onPress={goToPOIDetail} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  searchInput: { flex: 1, fontSize: 16, height: 40 },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  filterButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  filterButtonText: { marginLeft: 4, fontSize: 14, color: '#666' },
  sortButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  sortButtonText: { marginLeft: 4, fontSize: 14, color: '#666' },
  listContent: { padding: 16, paddingBottom: 24 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24
  },
  errorText: {
    marginTop: 12, fontSize: 16, color: '#B00020', textAlign: 'center'
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6200ee',
    borderRadius: 4,
    elevation: 2
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center', padding: 40
  },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }
});

export default POIListScreen;
