import { firestore, storage } from './index';

const reviewsCollection = firestore.collection('reviews');
const poisCollection = firestore.collection('pois');

export const getReviewsByPOI = async (poiId) => {
  try {
    const snapshot = await reviewsCollection
      .where('poiId', '==', poiId)
      .orderBy('createdAt', 'desc')
      .get();
      
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error getting reviews for POI:', error);
    return { success: false, error };
  }
};

export const getReviewsByUser = async (userId) => {
  try {
    const snapshot = await reviewsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
      
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error getting reviews by user:', error);
    return { success: false, error };
  }
};

export const createReview = async (reviewData, imageUris = []) => {
  try {
    // Create the review document
    const reviewRef = reviewsCollection.doc();
    const reviewId = reviewRef.id;
    
    const reviewToSave = {
      userId: reviewData.userId,
      poiId: reviewData.poiId,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      userImages: [],
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    
    // Upload images if provided
    if (imageUris.length > 0) {
      const imagePromises = imageUris.map(async (uri, index) => {
        const reference = storage.ref(`reviews/${reviewId}/image_${index}.jpg`);
        await reference.putFile(uri);
        return reference.getDownloadURL();
      });
      
      const imageUrls = await Promise.all(imagePromises);
      reviewToSave.userImages = imageUrls;
    }
    
    // Save review
    await reviewRef.set(reviewToSave);
    
    // Update the POI's average rating
    await updatePOIAverageRating(reviewData.poiId);
    
    return { success: true, id: reviewId };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error };
  }
};

// Helper function to update POI average rating
const updatePOIAverageRating = async (poiId) => {
  try {
    // Get all reviews for this POI
    const snapshot = await reviewsCollection
      .where('poiId', '==', poiId)
      .get();
    
    const reviews = snapshot.docs.map(doc => doc.data());
    
    if (reviews.length > 0) {
      // Calculate new average
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Update POI document
      await poisCollection.doc(poiId).update({
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating POI average rating:', error);
  }
};