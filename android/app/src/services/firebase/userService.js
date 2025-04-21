import { auth, firestore, storage } from './index';

const usersCollection = firestore.collection('users');

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
    const userDoc = await usersCollection.doc(userId).get();
    if (userDoc.exists) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false, error: 'User not found' };
    }
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