import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import StarRating from './StarRating';

export default function ReviewForm({ poiId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (comment.length > 100) {
      Alert.alert('Error', 'Comment must be 100 characters or less');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(rating, comment);
      if (result?.success) {
        setRating(0);
        setComment('');
      } else {
        throw new Error(result?.error?.message || 'Failed to submit review');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Write a Review</Text>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Rating:</Text>
        <StarRating
          rating={rating}
          size={32}
          onRatingChange={setRating}
          editable={!submitting}
        />
      </View>

      <View style={styles.commentContainer}>
        <Text style={styles.label}>Comment (optional):</Text>
        <TextInput
          style={[styles.input, submitting && styles.inputDisabled]}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience..."
          multiline
          maxLength={100}
          editable={!submitting}
        />
        <Text style={styles.charCount}>{comment.length}/100</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
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
  ratingContainer: {
    marginBottom: 16,
    width: '100%'
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333'
  },
  commentContainer: {
    marginBottom: 16,
    width: '100%'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
    textAlignVertical: 'top',
    width: '100%'
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  charCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 4
  },
  submitButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%'
  },
  submitButtonDisabled: {
    backgroundColor: '#9e9e9e'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
}); 