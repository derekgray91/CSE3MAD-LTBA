import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StarRating = ({ 
  rating = 0, 
  size = 20, 
  color = '#FFD700', 
  containerStyle,
  editable = false,
  onRatingChange
}) => {
  // Ensure rating is within 0-5 range and is a valid number
  const safeRating = !rating || isNaN(Number(rating)) 
    ? 0 
    : Math.min(5, Math.max(0, Number(rating)));
  
  const handleStarPress = (selectedRating) => {
    if (editable && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const starIcon = i <= safeRating ? 'star' : 'star-outline';
      const star = editable ? (
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          activeOpacity={0.7}
        >
          <Icon name={starIcon} size={size} color={color} />
        </TouchableOpacity>
      ) : (
        <Icon key={i} name={starIcon} size={size} color={color} />
      );
      stars.push(star);
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
    gap: 4, // Add spacing between stars
  },
});

export default StarRating;