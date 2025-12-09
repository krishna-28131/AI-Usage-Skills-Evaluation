// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOBZxT98eiXfEdjdTkdvOFmM4-laH5SxI",
  authDomain: "book-management-web-app-4c4b6.firebaseapp.com",
  projectId: "book-management-web-app-4c4b6",
  storageBucket: "book-management-web-app-4c4b6.firebasestorage.app",
  messagingSenderId: "68134922880",
  appId: "1:68134922880:web:e3d4870f3350237f601465",
  measurementId: "G-QVP2LQSE0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);