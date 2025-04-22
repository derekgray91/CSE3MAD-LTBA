import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from './StarRating';

const POICard = ({ poi, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(poi)}>
      <Image 
        source={poi.thumbnail ? { uri: poi.thumbnail } : require('../assets/default-poi.png')} 
        style={styles.thumbnail} 
      />
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>{poi.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {poi.buildingName}, Level {poi.levelNumber}
        </Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={poi.averageRating || 0} size={16} />
          <Text style={styles.reviewCount}>
            ({poi.reviewCount || 0})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default POICard;