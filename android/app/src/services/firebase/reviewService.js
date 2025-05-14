import { firestore, storage, auth } from '../../firebase';

const PROJECT_ID  = 'microhabit-90960';
const DATABASE_ID = 'ltba';
const API_KEY     = 'IzaSyB7Ijn29hRmQMuKMkojMYpu9Cw0RYetv98';
const REST_BASE   =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
  `/databases/${DATABASE_ID}/documents/reviews`;

const reviewsCollection = firestore.collection('reviews');
const poisCollection = firestore.collection('pois');

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const idToken = await user.getIdToken(true);
  return { Authorization: `Bearer ${idToken}` };
}

function flattenDoc(doc) {
  const out = { id: doc.name.split('/').pop() };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    if      (v.stringValue   != null) out[k] = v.stringValue;
    else if (v.integerValue  != null) out[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue   != null) out[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue  != null) out[k] = v.booleanValue;
    else if (v.arrayValue?.values) {
      out[k] = v.arrayValue.values.map(x =>
        x.stringValue   ??
        x.integerValue  ??
        x.doubleValue   ??
        x.booleanValue
      );
    }
  }
  return out;
}

export const getReviewsByPOI = async (poiId) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const docs = json.documents || [];
    // Filter reviews for the given poiId
    const reviews = docs.map(flattenDoc).filter(r => r.poiId === poiId);
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error getting reviews for POI via REST:', error);
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

// Helper function to calculate average rating and count
const calculatePOIStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  return {
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length
  };
};

export const addReview = async (poiId, rating, comment = '') => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Prepare review data for Firestore REST API
    const reviewData = {
      fields: {
        poiId: { stringValue: poiId },
        userId: { stringValue: user.uid },
        userEmail: { stringValue: user.email },
        userName: { stringValue: user.displayName || 'Anonymous' },
        rating: { integerValue: rating },
        comment: { stringValue: comment || '' },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };

    // Get auth headers
    const headers = {
      ...(await getAuthHeaders()),
      'Content-Type': 'application/json'
    };

    // Add the review via REST API
    const resp = await fetch(`${REST_BASE}?key=${API_KEY}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData)
    });
    const json = await resp.json();
    if (json.error) throw new Error(json.error.message);

    // Update POI stats (still uses SDK, but you may want to migrate this to REST as well)
    await updatePOIAverageRating(poiId);

    return { success: true };
  } catch (error) {
    console.error('Error adding review via REST:', error);
    return { success: false, error };
  }
};

// Helper to convert gs:// URLs to HTTP URLs
const getHttpUrl = async (gsUrl) => {
  if (!gsUrl || !gsUrl.startsWith('gs://')) return gsUrl;
  try {
    const ref = storage.refFromURL(gsUrl);
    return await ref.getDownloadURL();
  } catch (e) {
    console.error('Error converting gs:// to HTTP:', gsUrl, e);
    return null;
  }
};

export const getReviewsForPOI = async (poiId) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    // Log the raw response for debugging
    console.log('REST reviews response:', JSON.stringify(json.documents, null, 2));

    const docs = json.documents || [];
    const reviews = docs.map(flattenDoc);
    // Log the flattened reviews for debugging
    console.log('Flattened reviews:', reviews);

    // Robust filtering (string, trimmed)
    const filtered = reviews.filter(r => String(r.poiId).trim() === String(poiId).trim());
    console.log('Filtered reviews:', filtered);

    return { success: true, data: filtered, stats: calculatePOIStats(filtered) };
  } catch (error) {
    console.error('Error getting reviews for POI via REST:', error);
    return { success: false, error };
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    if (!categoryId) {
      return { success: false, data: null, error: 'Category ID is required' };
    }

    const headers = await getAuthHeaders();
    const url = `${REST_BASE}/${categoryId}?key=${API_KEY}`;
    const resp = await fetch(url, { headers });
    const json = await resp.json();

    if (json.error) {
      console.log(`Category with ID ${categoryId} not found`);
      return { success: false, data: null, error: 'Category not found' };
    }

    const category = flattenDoc(json);
    return { success: true, data: category, error: null };
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to fetch category'
    };
  }
};

export const getReviewsByUserREST = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const docs = json.documents || [];
    // Filter reviews for the given userId
    const reviews = docs.map(flattenDoc).filter(r => r.userId === userId);
    // Sort by createdAt descending if present
    reviews.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error getting reviews by user via REST:', error);
    return { success: false, error };
  }
};