// src/components/POICard.js

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StarRating from './StarRating';

const POICard = ({ poi, category, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={
            poi.thumbnail 
              ? { uri: poi.thumbnail } 
              : require('../assets/default-poi.png')
          } 
          style={styles.thumbnail} 
          resizeMode="cover"
        />
        
        {/* Category icon overlay on the image */}
        {category && category.categoryIcon && (
          <View style={styles.categoryIconContainer}>
            <Image 
              source={{ uri: category.categoryIcon }} 
              style={styles.categoryIcon} 
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {poi.name}
        </Text>
        
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {poi.buildingName}, Level {poi.levelNumber}
          </Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              {category ? category.categoryName : "Category"}
            </Text>
          </View>
          
          <StarRating 
            rating={poi.averageRating || 0} 
            size={16} 
          />
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
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f7fb',
  },
  categoryIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
});

export default POICard;