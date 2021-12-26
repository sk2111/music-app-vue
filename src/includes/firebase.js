import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBGpGezBkmxhc0NNT9geONheedTq-D258Y',
  authDomain: 'music-83b56.firebaseapp.com',
  projectId: 'music-83b56',
  storageBucket: 'music-83b56.appspot.com',
  appId: '1:587618484341:web:efeca75ba344f42157383c',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const usersCollection = db.collection('users');
const storage = firebase.storage();
export { auth, db, usersCollection, storage };
