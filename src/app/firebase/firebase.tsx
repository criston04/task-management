// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIQQ3IEtseo3bN3hZfnhno_l8tsi8qRwM",
  authDomain: "gestion-eca2e.firebaseapp.com",
  projectId: "gestion-eca2e",
  storageBucket: "gestion-eca2e.firebasestorage.app",
  messagingSenderId: "176815260710",
  appId: "1:176815260710:web:dd8b5bc8895162a48ad2e7",
  measurementId: "G-NF5WGSLTF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app };