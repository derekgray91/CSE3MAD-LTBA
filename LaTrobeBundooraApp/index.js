/**
 * @format
 */

// index.js
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App'; // Ensure the path points to your new App.js file

AppRegistry.registerComponent(appName, () => App);