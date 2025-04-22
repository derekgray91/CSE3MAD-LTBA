import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StarRating = ({ rating = 0, size = 20, color = '#FFD700', containerStyle }) => {
  // Ensure rating is within 0-5 range
  const safeRating = Math.min(5, Math.max(0, rating));
  
  const renderStars = () => {
    const stars = [];
    
    // Full stars
    const fullStars = Math.floor(safeRating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={`full-${i}`} name="star" size={size} color={color} />
      );
    }
    
    // Half star
    if (safeRating % 1 >= 0.5) {
      stars.push(
        <Icon key="half" name="star-half" size={size} color={color} />
      );
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-outline" size={size} color={color} />
      );
    }
    
    return stars;
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default StarRating;