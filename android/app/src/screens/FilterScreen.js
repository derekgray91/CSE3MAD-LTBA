import Slider from '@react-native-community/slider';
import perf from '@react-native-firebase/perf'; // ← added
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { categoryService, poiService } from '../services';

const FilterScreen = ({ navigation, route }) => {
  // Get the callback function from route params
  const { onApplyFilters } = route.params || {};

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [minRating, setMinRating]               = useState(0);
  
  // Data for filters
  const [categories, setCategories]             = useState([]);
  const [buildings, setBuildings]               = useState([]);
  
  // UI state
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);

  // Load filter data when component mounts
  useEffect(() => {
    loadFilterData();
  }, []);

  // Load categories and buildings data
  const loadFilterData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesResponse = await categoryService.getAllCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      } else {
        console.error('Failed to load categories:', categoriesResponse.error);
      }

      // Load all POIs to extract unique buildings
      const poisResponse = await poiService.getAllPOIs();
      if (poisResponse.success) {
        // Extract unique building names
        const uniqueBuildings = [...new Set(
          poisResponse.data
            .map(poi => poi.buildingName)
            .filter(Boolean)
        )].sort();
        
        setBuildings(uniqueBuildings);
      } else {
        console.error('Failed to load POIs for buildings:', poisResponse.error);
      }
    } catch (err) {
      console.error('Error loading filter data:', err);
      setError('Failed to load filter options');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and return to previous screen
  const applyFilters = async () => {
    const trace = await perf().newTrace('filter_operation');
    trace.start();

    const filters = {
      categoryId: selectedCategory || null,
      buildingName: selectedBuilding || null,
      minRating: minRating,
    };
    
    // Call the callback from the POI list screen
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    // Go back to previous screen
    navigation.goBack();

    trace.stop();
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBuilding('');
    setMinRating(0);
  };

  // Get text representation of current rating
  const getRatingText = (value) => {
    if (value === 0) return 'Any rating';
    return `${value} stars or higher`;
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading filter options...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" size={60} color="#B00020" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFilterData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filter</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              <Picker.Item label="All Categories" value="" />
              {categories.map(category => (
                <Picker.Item 
                  key={category.id} 
                  label={category.categoryName} 
                  value={category.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Building Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Building</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBuilding}
              onValueChange={setSelectedBuilding}
              style={styles.picker}
            >
              <Picker.Item label="All Buildings" value="" />
              {buildings.map(building => (
                <Picker.Item 
                  key={building} 
                  label={building} 
                  value={building} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <Text style={styles.ratingText}>{getRatingText(minRating)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.5}
            value={minRating}
            onValueChange={setMinRating}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#6200ee"
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>Any</Text>
            <Text style={styles.ratingLabel}>5★</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={applyFilters}   // ← now traced
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetText: {
    color: '#6200ee',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    backgroundColor: '#6200ee',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6200ee',
    borderRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FilterScreen;