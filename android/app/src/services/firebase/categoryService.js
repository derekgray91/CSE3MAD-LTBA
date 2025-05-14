// src/services/firebase/categoryService.js

import { firestore } from '../../firebase';
import { auth } from '../../firebase';

const PROJECT_ID  = 'microhabit-90960';
const DATABASE_ID = 'ltba';
const API_KEY     = 'IzaSyB7Ijn29hRmQMuKMkojMYpu9Cw0RYetv98';
const REST_BASE   =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
  `/databases/${DATABASE_ID}/documents/categories`;

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

/**
 * Get all categories from Firestore
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAllCategories = async () => {
  try {
    const headers = await getAuthHeaders();
    const resp    = await fetch(`${REST_BASE}?key=${API_KEY}`, { headers });
    const json    = await resp.json();
    if (json.error) throw new Error(json.error.message);

    const docs = json.documents || [];
    const categories = docs.map(flattenDoc);
    return { success: true, data: categories, error: null };
  } catch (error) {
    console.error('Error fetching categories via REST:', error);
    return { success: false, data: [], error: error.message || 'Failed to fetch categories' };
  }
};

/**
 * Get a single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
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