import firestore from '@react-native-firebase/firestore';

const mockUserData = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  preferences: {
    notifications: true,
    darkMode: false,
  },
};

describe('User Data Handling', () => {
  describe('Create User Profile', () => {
    it('should create a new user profile', async () => {
      firestore().set.mockResolvedValueOnce();

      await firestore()
        .collection('users')
        .doc(mockUserData.uid)
        .set(mockUserData);

      expect(firestore().collection).toHaveBeenCalledWith('users');
      expect(firestore().doc).toHaveBeenCalledWith(mockUserData.uid);
      expect(firestore().set).toHaveBeenCalledWith(mockUserData);
    });
  });

  describe('Get User Profile', () => {
    it('should retrieve user profile data', async () => {
      firestore().get.mockResolvedValueOnce({
        data: () => mockUserData,
      });

      const result = await firestore()
        .collection('users')
        .doc(mockUserData.uid)
        .get();

      expect(result.data()).toEqual(mockUserData);
      expect(firestore().collection).toHaveBeenCalledWith('users');
      expect(firestore().doc).toHaveBeenCalledWith(mockUserData.uid);
    });
  });

  describe('Update User Profile', () => {
    it('should update user profile data', async () => {
      const updates = {
        displayName: 'Updated Name',
        photoURL: 'https://example.com/new-photo.jpg',
      };

      firestore().update.mockResolvedValueOnce();

      await firestore()
        .collection('users')
        .doc(mockUserData.uid)
        .update(updates);

      expect(firestore().collection).toHaveBeenCalledWith('users');
      expect(firestore().doc).toHaveBeenCalledWith(mockUserData.uid);
      expect(firestore().update).toHaveBeenCalledWith(updates);
    });
  });

  describe('User Preferences', () => {
    it('should update user preferences', async () => {
      const newPreferences = {
        notifications: false,
        darkMode: true,
      };

      firestore().update.mockResolvedValueOnce();

      await firestore()
        .collection('users')
        .doc(mockUserData.uid)
        .update({
          preferences: newPreferences,
        });

      expect(firestore().update).toHaveBeenCalledWith({
        preferences: newPreferences,
      });
    });
  });
}); 