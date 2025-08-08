import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBD4q-GE8zVSR3_AoWTXUEWFuBCt1KnATk",
    authDomain: "quiz-8e4a9.firebaseapp.com",
    projectId: "quiz-8e4a9",
    storageBucket: "quiz-8e4a9.firebasestorage.app",
    messagingSenderId: "1057061201282",
    appId: "1:1057061201282:web:815cb373b3745ae7065b9b",
    measurementId: "G-BR0SV3HYF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Functions for authentication
const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };
  
  export { auth, signInWithGoogle, logout };