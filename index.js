/**
 * @format
 */

// index.js
import { AppRegistry } from 'react-native';
import App from './android/app/src/App.js'; // Ensure the path points to your new App.js file
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);