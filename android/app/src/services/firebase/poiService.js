// src/services/firestore/poiService.js

import { auth, firestore, storage } from '../index';

// ——————————————————————————————————
// REST config for your non-default "ltba" database
// ——————————————————————————————————

const PROJECT_ID  = 'microhabit-90960';
const DATABASE_ID = 'ltba';
const API_KEY     = 'IzaSyB7Ijn29hRmQMuKMkojMYpu9Cw0RYetv98';
const REST_BASE   =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
  `/databases/${DATABASE_ID}/documents/pois`;

// ——————————————————————————————————
// Helpers
// ——————————————————————————————————

/** 1) Grab the current user's ID token and build auth headers */
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const idToken = await user.getIdToken(/* forceRefresh= */ true);
  return { Authorization: `Bearer ${idToken}` };
}

/** 2) Flatten a Firestore REST document into { id, ...fields } */
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

// ——————————————————————————————————
// REST-backed methods
// ——————————————————————————————————

export const getAllPOIs = async () => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const docs = json.documents || [];
    const data = docs.map(flattenDoc);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching POIs via REST:', error);
    return { success: false, error };
  }
};

export const getPOIsByCategory = async (categoryId) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const docs = json.documents || [];
    const all  = docs.map(flattenDoc);
    const data = all.filter(poi => poi.categoryId === categoryId);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching POIs by category via REST:', error);
    return { success: false, error };
  }
};

export const getPOIById = async (poiId) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}/${poiId}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const data = flattenDoc(json);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching single POI via REST:', error);
    return { success: false, error };
  }
};

export const searchPOIs = async (searchText) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const lower = searchText.toLowerCase();
    const docs  = json.documents || [];
    const data  = docs
      .map(flattenDoc)
      .filter(poi =>
        poi.name.toLowerCase().includes(lower) ||
        poi.buildingName.toLowerCase().includes(lower)
      );
    return { success: true, data };
  } catch (error) {
    console.error('Error searching POIs via REST:', error);
    return { success: false, error };
  }
};

export const filterPOIs = async (filters) => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    let data = (json.documents || []).map(flattenDoc);

    if (filters.categoryId)   data = data.filter(poi => poi.categoryId === filters.categoryId);
    if (filters.buildingName) data = data.filter(poi => poi.buildingName === filters.buildingName);
    if (filters.minRating > 0) data = data.filter(poi => (poi.averageRating || 0) >= filters.minRating);

    return { success: true, data };
  } catch (error) {
    console.error('Error filtering POIs via REST:', error);
    return { success: false, error };
  }
};

// ——————————————————————————————————
// Native SDK-backed upload (unchanged)
// ——————————————————————————————————

export const uploadPOIImage = async (poiId, imageUri, index = 0) => {
  try {
    const ref = storage.ref(`pois/${poiId}/image_${index}.jpg`);
    await ref.putFile(imageUri);
    const url = await ref.getDownloadURL();

    const poiDoc  = await firestore.collection('pois').doc(poiId).get();
    const poiData = poiDoc.data() || {};
    const images  = Array.isArray(poiData.images) ? poiData.images : [];

    images[index] = url;
    await firestore.collection('pois').doc(poiId).update({ images });

    return { success: true, imageUrl: url };
  } catch (error) {
    console.error('Error uploading POI image:', error);
    return { success: false, error };
  }
};
