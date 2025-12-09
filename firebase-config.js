
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3BJpj7m_PPefQlMIusIu17JwHRrTU3MQ",
  authDomain: "time-tracker-app-88960.firebaseapp.com",
  projectId: "time-tracker-app-88960",
  storageBucket: "time-tracker-app-88960.firebasestorage.app",
  messagingSenderId: "665800162914",
  appId: "1:665800162914:web:3e4acd09ec216bf92bdb3b",
  measurementId: "G-MQX53FHGWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
