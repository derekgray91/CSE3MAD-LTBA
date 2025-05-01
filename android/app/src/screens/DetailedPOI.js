// src/screens/DetailedPOI.js

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import StarRating from '../components/StarRating';
import { getPOIById } from '../services/firebase/poiService';

export default function DetailedPOI({ route }) {
  const { poiId } = route.params;
  const [poi, setPoi]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPOIById(poiId);
        if (res.success) {
          setPoi(res.data);
        } else {
          setError(res.error?.message || 'Failed to load location');
        }
      } catch (err) {
        console.error('[DetailedPOI] unexpected error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [poiId]);

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
        <StarRating rating={poi.averageRating || 0} size={24} />
        <Text style={styles.reviewCount}>
          ({poi.reviewCount || 0} reviews)
        </Text>
      </View>

      {/* Other fields */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Category</Text>
        <Text style={styles.fieldValue}>{poi.categoryId}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Coordinates</Text>
        <Text style={styles.fieldValue}>
          {poi.latitude}, {poi.longitude}
        </Text>
      </View>
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
  }
});
