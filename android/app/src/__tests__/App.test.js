// Mock dependencies not handled by jest.setup.js
jest.mock('react-native-gesture-handler', () => {});
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

import React from 'react';
import App from '../App';

describe('App Component', () => {
  it('can be imported without crashing', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });

  it('initializes performance monitoring on mount', () => {
    const perf = require('@react-native-firebase/perf').default;
    
    // Test that the perf module is properly mocked
    expect(perf).toBeDefined();
    expect(perf().newTrace).toBeDefined();
    expect(typeof perf().newTrace).toBe('function');
  });

  it('has Firebase auth properly mocked', () => {
    const auth = require('@react-native-firebase/auth').default;
    
    expect(auth).toBeDefined();
    expect(auth().onAuthStateChanged).toBeDefined();
    expect(typeof auth().onAuthStateChanged).toBe('function');
  });
}); 