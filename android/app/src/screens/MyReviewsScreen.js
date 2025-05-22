import auth from '@react-native-firebase/auth';
import perf from '@react-native-firebase/perf'; // ← added
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import StarRating from '../components/StarRating';
import { getPOIById } from '../services/firebase/poiService';
import { getReviewsByUserREST } from '../services/firebase/reviewService';

export default function MyReviewsScreen({ navigation }) {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [poiNames, setPoiNames] = useState({});

  useEffect(() => {
    async function measureMyReviewsLoad() {
      const trace = await perf().newTrace('my_reviews_load');
      trace.start();
      await loadReviews();        // ← your existing loader
      trace.stop();
    }
    measureMyReviewsLoad();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');
      const res = await getReviewsByUserREST(user.uid);
      if (res.success) {
        setReviews(res.data);
        // Fetch POI names for each review
        const poiIds = Array.from(new Set(res.data.map(r => r.poiId)));
        const names = {};
        for (const id of poiIds) {
          const poiRes = await getPOIById(id);
          if (poiRes.success && poiRes.data) {
            names[id] = poiRes.data.name;
          }
        }
        setPoiNames(names);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <Text style={styles.poiName}>{poiNames[item.poiId] || 'POI'}</Text>
      <View style={styles.ratingRow}>
        <StarRating rating={item.rating} size={18} />
        <Text style={styles.ratingText}>{item.rating} / 5</Text>
      </View>
      {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 8 }}>Loading your reviews…</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reviews</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noReviews}>You haven't written any reviews yet.</Text>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  poiName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#B00020',
    fontSize: 16,
    textAlign: 'center',
  },
  noReviews: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 32,
  },
});