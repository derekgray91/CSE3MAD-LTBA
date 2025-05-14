import { auth, firestore, storage } from '../../firebase';

const usersCollection = firestore.collection('users');

const PROJECT_ID  = 'microhabit-90960';
const DATABASE_ID = 'ltba';
const API_KEY     = 'IzaSyB7Ijn29hRmQMuKMkojMYpu9Cw0RYetv98';
const REST_BASE   =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
  `/databases/${DATABASE_ID}/documents/users`;

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

export const createUser = async (userId, userData) => {
  try {
    await usersCollection.doc(userId).set({
      email: userData.email,
      displayName: userData.displayName || '',
      profileImage: userData.profileImage || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
};

export const getUserById = async (userId) => {
  try {
    if (!userId) {
      return { success: false, data: null, error: 'User ID is required' };
    }
    const headers = await getAuthHeaders();
    const url = `${REST_BASE}/${userId}?key=${API_KEY}`;
    const resp = await fetch(url, { headers });
    const json = await resp.json();

    if (json.error) {
      return { success: false, data: null, error: 'User not found' };
    }

    const user = flattenDoc(json);
    return { success: true, data: user };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    await usersCollection.doc(userId).update(updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

export const uploadProfileImage = async (userId, imageUri) => {
  try {
    const reference = storage.ref(`users/${userId}/profile.jpg`);
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    await updateUserProfile(userId, { profileImage: url });
    return { success: true, imageUrl: url };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { success: false, error };
  }
};

export async function syncUserToFirestoreREST(userDataOverride) {
  const user = auth.currentUser;
  if (!user) return;

  const headers = {
    'Authorization': `Bearer ${await user.getIdToken(true)}`,
    'Content-Type': 'application/json'
  };

  const userDoc = {
    fields: {
      email: { stringValue: userDataOverride?.email || user.email },
      displayName: { stringValue: userDataOverride?.displayName || user.displayName || '' },
      profileImage: { stringValue: userDataOverride?.profileImage || user.photoURL || '' }
    }
  };

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/users/${user.uid}?key=${API_KEY}`;

  await fetch(url, {
    method: 'PATCH', // PATCH will create or update
    headers,
    body: JSON.stringify(userDoc)
  });
}