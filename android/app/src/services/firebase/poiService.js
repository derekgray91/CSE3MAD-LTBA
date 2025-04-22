import { firestore, storage } from './index';

const poisCollection = firestore.collection('pois');

export const getAllPOIs = async () => {
  try {
    const snapshot = await poisCollection.get();
    const pois = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: pois };
  } catch (error) {
    console.error('Error getting POIs:', error);
    return { success: false, error };
  }
};

export const getPOIsByCategory = async (categoryId) => {
  try {
    const snapshot = await poisCollection.where('categoryId', '==', categoryId).get();
    const pois = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: pois };
  } catch (error) {
    console.error('Error getting POIs by category:', error);
    return { success: false, error };
  }
};

export const getPOIById = async (poiId) => {
  try {
    const poiDoc = await poisCollection.doc(poiId).get();
    if (poiDoc.exists) {
      return { success: true, data: { id: poiDoc.id, ...poiDoc.data() } };
    } else {
      return { success: false, error: 'POI not found' };
    }
  } catch (error) {
    console.error('Error getting POI by ID:', error);
    return { success: false, error };
  }
};

export const searchPOIs = async (searchText) => {
  try {
    // Firestore doesn't support direct text search, so we'll fetch all and filter
    const snapshot = await poisCollection.get();
    const searchTextLower = searchText.toLowerCase();
    const pois = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(poi => 
        poi.name.toLowerCase().includes(searchTextLower) || 
        poi.buildingName.toLowerCase().includes(searchTextLower)
      );
    return { success: true, data: pois };
  } catch (error) {
    console.error('Error searching POIs:', error);
    return { success: false, error };
  }
};

export const filterPOIs = async (filters) => {
  try {
    let query = poisCollection;
    
    // Apply filters
    if (filters.categoryId) {
      query = query.where('categoryId', '==', filters.categoryId);
    }
    
    if (filters.buildingName) {
      query = query.where('buildingName', '==', filters.buildingName);
    }
    
    const snapshot = await query.get();
    let pois = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply rating filter client-side (Firestore doesn't directly support this operation)
    if (filters.minRating && filters.minRating > 0) {
      pois = pois.filter(poi => (poi.averageRating || 0) >= filters.minRating);
    }
    
    return { success: true, data: pois };
  } catch (error) {
    console.error('Error filtering POIs:', error);
    return { success: false, error };
  }
};

export const uploadPOIImage = async (poiId, imageUri, index = 0) => {
  try {
    const reference = storage.ref(`pois/${poiId}/image_${index}.jpg`);
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    
    // Update the POI document with the new image URL
    const poiDoc = await poisCollection.doc(poiId).get();
    const poiData = poiDoc.data();
    const images = poiData.images || [];
    
    if (index < images.length) {
      images[index] = url;
    } else {
      images.push(url);
    }
    
    await poisCollection.doc(poiId).update({ images });
    return { success: true, imageUrl: url };
  } catch (error) {
    console.error('Error uploading POI image:', error);
    return { success: false, error };
  }
};