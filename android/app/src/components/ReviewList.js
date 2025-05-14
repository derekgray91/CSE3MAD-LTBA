import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import StarRating from './StarRating';
import { getUserById } from '../services/firebase/userService';

export default function ReviewList({ reviews = [] }) {
  // Ensure reviews is an array
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  
  // State to store fetched emails for userIds
  const [userEmails, setUserEmails] = useState({});

  // Helper to display email prefix for privacy
  const displayEmail = (email) => email ? email.split('@')[0] : null;

  // Fetch missing emails for reviews
  useEffect(() => {
    const missingUserIds = safeReviews
      .filter(r => !r.userEmail && r.userId && !userEmails[r.userId])
      .map(r => r.userId);
    if (missingUserIds.length === 0) return;
    missingUserIds.forEach(async (userId) => {
      const res = await getUserById(userId);
      if (res.success && res.data && res.data.email) {
        setUserEmails(prev => ({ ...prev, [userId]: res.data.email }));
      }
    });
  }, [safeReviews, userEmails]);

  const renderReview = ({ item }) => {
    // Validate item and its properties
    if (!item) return null;
    
    // Prioritise userName, then userEmail, then fetched email, then 'Anonymous' 
    // Graceful error handling
    const displayUser = item.userName || item.userEmail || userEmails[item.userId] || 'Anonymous';

    return (
      <View style={styles.reviewContainer}>
        <View style={styles.reviewHeader}>
          <Text style={styles.userName}>{displayUser.split('@')[0]}</Text>
          <StarRating rating={item.rating} size={16} />
        </View>
        {item.comment && (
          <Text style={styles.comment}>{item.comment}</Text>
        )}
        {item.userImages && Array.isArray(item.userImages) && item.userImages.length > 0 && (
          <View style={styles.imageContainer}>
            {item.userImages.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews</Text>
      {safeReviews.length === 0 ? (
        <Text style={styles.noReviews}>No reviews yet</Text>
      ) : (
        <FlatList
          data={safeReviews}
          renderItem={renderReview}
          keyExtractor={(item, index) => item.id || `review-${index}`}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    width: '100%'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  reviewContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%'
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%'
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    width: '100%'
  },
  noReviews: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    width: '100%'
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8
  }
}); 