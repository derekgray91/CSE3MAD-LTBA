import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import StarRating from './StarRating';

const DEFAULT_THUMBNAIL = require('../assets/default-poi.png');

const POITile = ({ poi, category, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      {/* Category icon in bottom right of tile */}
      {category && category.categoryIcon && (
        <View style={styles.categoryIconContainer}>
          <Image
            source={{ uri: category.categoryIcon }}
            style={styles.categoryIcon}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={styles.thumbnailContainer}>
        <Image
          source={poi.thumbnail ? { uri: poi.thumbnail } : DEFAULT_THUMBNAIL}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{poi.name}</Text>
        <Text style={styles.categoryName} numberOfLines={1}>
          {category ? category.categoryName : 'Category'}
        </Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={poi.averageRating || 0} size={16} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    position: 'relative', // for absolute icon
  },
  thumbnailContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#f5f7fb',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  categoryIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryIcon: {
    width: 20,
    height: 20,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  categoryName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
});

export default POITile; 