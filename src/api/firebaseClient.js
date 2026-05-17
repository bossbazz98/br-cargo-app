import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_Tr8immKAfE95MRcO5iQ0qwd1Y001HU0",
  authDomain: "brcargo-98.firebaseapp.com",
  projectId: "brcargo-98",
  storageBucket: "brcargo-98.firebasestorage.app",
  messagingSenderId: "73978841560",
  appId: "1:73978841560:web:fa91695ce587bcf336caad",
  measurementId: "G-MQESR7CW5M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
