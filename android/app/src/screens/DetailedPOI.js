// src/screens/DetailedPOI.js

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { getPOIById } from '../services/firebase/poiService';
import { addReview, getReviewsForPOI } from '../services/firebase/reviewService';
import { getCategoryById } from '../services/firebase/categoryService';

export default function DetailedPOI({ route }) {
  const navigation = useNavigation();
  const { poiId } = route.params;
  const [poi, setPoi] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // Set up the header with back button
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
      headerTitle: 'Location Details',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
      }
    });
  }, [navigation]);

  const loadPOIAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading POI with ID:', poiId);
      
      if (!poiId) {
        throw new Error('POI ID is missing');
      }
      
      const poiResult = await getPOIById(poiId);
      console.log('POI Result:', poiResult);
      
      if (!poiResult.success) {
        throw new Error(poiResult.error?.message || 'Failed to load POI details');
      }
      
      setPoi(poiResult.data);
      console.log('POI Data loaded successfully:', poiResult.data);
      
      // Fetch category name
      if (poiResult.data.categoryId) {
        const catRes = await getCategoryById(poiResult.data.categoryId);
        if (catRes.success && catRes.data && catRes.data.categoryName) {
          setCategoryName(catRes.data.categoryName);
        } else {
          setCategoryName(poiResult.data.categoryId);
        }
      } else {
        setCategoryName('');
      }
      
      // Load reviews
      console.log('Fetching reviews for POI:', poiId);
      const reviewsResult = await getReviewsForPOI(poiId);
      console.log('Reviews Result:', reviewsResult);
      
      if (!reviewsResult.success) {
        throw new Error(reviewsResult.error?.message || 'Failed to load reviews');
      }
      
      console.log('Reviews data:', reviewsResult.data);
      console.log('Reviews stats:', reviewsResult.stats);
      
      // Check if reviews data is valid
      if (!Array.isArray(reviewsResult.data)) {
        console.error('Reviews data is not an array:', reviewsResult.data);
        setReviews([]);
      } else {
        setReviews(reviewsResult.data);
      }
      
      // Check if stats are valid
      if (!reviewsResult.stats) {
        console.error('Review stats are missing');
        setReviewStats({ averageRating: 0, reviewCount: 0 });
      } else {
        setReviewStats(reviewsResult.stats);
      }
    } catch (error) {
      console.error('Error in loadPOIAndReviews:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOIAndReviews();
  }, [poiId]);

  const handleReviewSubmit = async (rating, comment) => {
    try {
      const res = await addReview(poiId, rating, comment);
      if (res.success) {
        Alert.alert('Success', 'Review submitted successfully');
        await loadPOIAndReviews(); // Reload POI and reviews to show the new review
        return { success: true };
      } else {
        throw new Error(res.error?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('[DetailedPOI] Review submission error:', error);
      return { success: false, error };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 8 }}>Loading POI…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!poi) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No data returned for ID "{poiId}"</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Thumbnail */}
      <Image
        source={
          poi.thumbnail
            ? { uri: poi.thumbnail }
            : require('../assets/default-poi.png')
        }
        style={styles.image}
      />

      {/* Main info */}
      <Text style={styles.title}>{poi.name}</Text>
      <Text style={styles.subtitle}>
        {poi.buildingName}, Level {poi.levelNumber}
      </Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <StarRating rating={reviewStats.averageRating} size={24} />
        <Text style={styles.reviewCount}>
          ({reviewStats.reviewCount} reviews)
        </Text>
      </View>

      {/* Other fields */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Category</Text>
        <Text style={styles.fieldValue}>{categoryName}</Text>
      </View>

      {/* Review Form */}
      <ReviewForm poiId={poiId} onSubmit={handleReviewSubmit} />

      {/* Review List */}
      <ReviewList reviews={reviews || []} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666'
  },
  field: {
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  fieldValue: {
    color: '#444'
  },
  errorText: {
    color: '#B00020',
    fontSize: 16,
    textAlign: 'center'
  },
  backButton: {
    padding: 8
  }
});
