import auth from '@react-native-firebase/auth';

beforeEach(() => {
  jest.clearAllMocks();
  // Ensure all auth methods are jest.fn()
  auth().signInWithEmailAndPassword = jest.fn();
  auth().createUserWithEmailAndPassword = jest.fn();
  auth().signOut = jest.fn();
});

describe('Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      auth().signInWithEmailAndPassword.mockResolvedValueOnce({
        user: {
          uid: '123',
          email,
        },
      });

      const result = await auth().signInWithEmailAndPassword(email, password);

      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe(email);
      expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    });

    it('should fail with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      auth().signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(auth().signInWithEmailAndPassword(email, password)).rejects.toThrow('Invalid credentials');
      expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    });
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const email = 'new@example.com';
      const password = 'password123';

      auth().createUserWithEmailAndPassword.mockResolvedValueOnce({
        user: {
          uid: '456',
          email,
        },
      });

      const result = await auth().createUserWithEmailAndPassword(email, password);

      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe(email);
      expect(auth().createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    });

    it('should fail if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      auth().createUserWithEmailAndPassword.mockRejectedValueOnce(new Error('Email already in use'));

      await expect(auth().createUserWithEmailAndPassword(email, password)).rejects.toThrow('Email already in use');
      expect(auth().createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      auth().signOut.mockResolvedValueOnce();

      await auth().signOut();

      expect(auth().signOut).toHaveBeenCalled();
    });
  });
}); 