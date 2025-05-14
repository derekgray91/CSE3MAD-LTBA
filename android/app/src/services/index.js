import * as userService from './firebase/userService';
import * as poiService from './firebase/poiService';
import * as categoryService from './firebase/categoryService';
import * as reviewService from './firebase/reviewService';
import firebase, { auth, firestore, storage } from '../firebase';

export {
  firebase,
  auth,
  firestore,
  storage,
  userService,
  poiService,
  categoryService,
  reviewService
};