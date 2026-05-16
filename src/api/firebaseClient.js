import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB7nyFMmBYSUjCZxl5dUqnzL2GmeOT-gq0",
  authDomain: "log-in-1-1b44f.firebaseapp.com",
  projectId: "log-in-1-1b44f",
  storageBucket: "log-in-1-1b44f.firebasestorage.app",
  messagingSenderId: "832734798937",
  appId: "1:832734798937:web:0d745477f29241d89abd48",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
