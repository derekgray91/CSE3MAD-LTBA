import firestore from '@react-native-firebase/firestore';

const mockPOIs = [
  { id: '1', name: 'Library', category: 'Study', rating: 4.5 },
  { id: '2', name: 'Cafeteria', category: 'Food', rating: 4.0 },
  { id: '3', name: 'Gym', category: 'Sports', rating: 4.8 },
];

describe('POI Search and Filter', () => {
  describe('Search POIs', () => {
    it('should search POIs by name', async () => {
      const searchTerm = 'Library';
      firestore().get.mockResolvedValueOnce({
        docs: mockPOIs
          .filter(poi => poi.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(poi => ({
            id: poi.id,
            data: () => poi,
          })),
      });

      const result = await firestore()
        .collection('pois')
        .where('name', '>=', searchTerm)
        .get();

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].data().name).toBe('Library');
    });

    it('should filter POIs by category', async () => {
      const category = 'Food';
      firestore().get.mockResolvedValueOnce({
        docs: mockPOIs
          .filter(poi => poi.category === category)
          .map(poi => ({
            id: poi.id,
            data: () => poi,
          })),
      });

      const result = await firestore()
        .collection('pois')
        .where('category', '==', category)
        .get();

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].data().category).toBe('Food');
    });

    it('should filter POIs by minimum rating', async () => {
      const minRating = 4.5;
      firestore().get.mockResolvedValueOnce({
        docs: mockPOIs
          .filter(poi => poi.rating >= minRating)
          .map(poi => ({
            id: poi.id,
            data: () => poi,
          })),
      });

      const result = await firestore()
        .collection('pois')
        .where('rating', '>=', minRating)
        .get();

      expect(result.docs).toHaveLength(2);
      expect(result.docs.every(doc => doc.data().rating >= minRating)).toBe(true);
    });
  });

  describe('Filter Combinations', () => {
    it('should combine multiple filters', async () => {
      const category = 'Food';
      const minRating = 4.0;
      
      firestore().get.mockResolvedValueOnce({
        docs: mockPOIs
          .filter(poi => poi.category === category && poi.rating >= minRating)
          .map(poi => ({
            id: poi.id,
            data: () => poi,
          })),
      });

      const result = await firestore()
        .collection('pois')
        .where('category', '==', category)
        .where('rating', '>=', minRating)
        .get();

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].data().category).toBe('Food');
      expect(result.docs[0].data().rating).toBeGreaterThanOrEqual(minRating);
    });
  });
}); 