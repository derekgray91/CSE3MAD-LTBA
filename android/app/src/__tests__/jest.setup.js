const { jest } = require('@jest/globals');
const React = require('react');

// Mock native modules
jest.mock('@react-native-firebase/app/lib/internal/RNFBNativeEventEmitter', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@react-native-firebase/app/lib/internal/registry/nativeModule', () => ({
  __esModule: true,
  default: {
    getAppModule: jest.fn(),
  },
}));

// Singleton Firebase mock
const firestoreMock = {
  collection: jest.fn(() => firestoreMock),
  doc: jest.fn(() => firestoreMock),
  where: jest.fn(() => firestoreMock),
  get: jest.fn(() => Promise.resolve({
    docs: [{
      data: () => ({})
    }],
    forEach: jest.fn(),
  })),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
};

const authMock = {
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { email: 'test@example.com' } })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { email: 'test@example.com' } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
  currentUser: null,
};

const storageMock = {
  ref: jest.fn(() => storageMock),
  putFile: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.jpg')),
};

// Mock all Firebase modules
const mockApps = [];
const mockFirebase = {
  apps: mockApps,
  initializeApp: jest.fn(),
  auth: () => authMock,
  firestore: () => firestoreMock,
  storage: () => storageMock,
};

// Mock the main Firebase app module
jest.mock('@react-native-firebase/app', () => {
  // Create a function that returns the mock
  const firebase = () => mockFirebase;
  // Copy all properties from mockFirebase to the function
  Object.assign(firebase, mockFirebase);
  // Make the function itself have all the properties
  firebase.apps = mockApps;
  firebase.initializeApp = jest.fn();
  firebase.auth = () => authMock;
  firebase.firestore = () => firestoreMock;
  firebase.storage = () => storageMock;
  
  return {
    __esModule: true,
    default: firebase,
    // Also export the function itself for named imports
    ...firebase,
  };
});

// Mock the side-effect imports
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => authMock,
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: () => firestoreMock,
}));

jest.mock('@react-native-firebase/storage', () => ({
  __esModule: true,
  default: () => storageMock,
}));

jest.mock('@react-native-firebase/perf', () => ({
  __esModule: true,
  default: () => ({
    newTrace: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    newHttpMetric: jest.fn(),
  }),
}));

// Mock @react-navigation/stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock gesture handler first
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  GestureHandlerRootView: ({ children }) => React.createElement('View', null, children),
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  Switch: 'Switch',
  TextInput: 'TextInput',
  DrawerLayoutAndroid: 'DrawerLayoutAndroid',
  NativeViewGestureHandler: 'NativeViewGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  ForceTouchGestureHandler: 'ForceTouchGestureHandler',
  createNativeWrapper: jest.fn(),
  Directions: {},
  gestureHandlerRootHOC: jest.fn((component) => component),
}));

// Mock DevMenu
jest.mock('react-native/Libraries/NativeModules/DevMenu', () => ({}));

// Mock React Native components
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => 'StatusBar');

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock bottom tab navigator
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-maps
jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: 'MapView',
  Marker: 'Marker',
  Callout: 'Callout',
  PROVIDER_GOOGLE: 'PROVIDER_GOOGLE',
  PROVIDER_DEFAULT: 'PROVIDER_DEFAULT',
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children, testID }) => React.createElement('View', { testID }, children),
  SafeAreaView: ({ children, testID }) => React.createElement('View', { testID }, children),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock StatusBar
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  __esModule: true,
  default: ({ children, ...props }) => React.createElement('View', props, children),
})); 