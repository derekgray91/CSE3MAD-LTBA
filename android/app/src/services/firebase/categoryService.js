import { firestore } from './index';

const categoriesCollection = firestore.collection('categories');

export const getAllCategories = async () => {
  try {
    const snapshot = await categoriesCollection.get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error getting categories:', error);
    return { success: false, error };
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const categoryDoc = await categoriesCollection.doc(categoryId).get();
    if (categoryDoc.exists) {
      return { success: true, data: { id: categoryDoc.id, ...categoryDoc.data() } };
    } else {
      return { success: false, error: 'Category not found' };
    }
  } catch (error) {
    console.error('Error getting category by ID:', error);
    return { success: false, error };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const docRef = await categoriesCollection.add({
      categoryName: categoryData.categoryName,
      categoryIcon: categoryData.categoryIcon,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error };
  }
};