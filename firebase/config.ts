'use client';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCQojTXYk08UeQkHNYeBC--wWH4xxcJKCw",
  authDomain: "covenai-c09d6.firebaseapp.com",
  projectId: "covenai-c09d6",
  storageBucket: "covenai-c09d6.firebasestorage.app",
  messagingSenderId: "739049462041",
  appId: "1:739049462041:web:a578bfe56bcf7e8dd28d88",
  measurementId: "G-BRHHNG9BYF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
