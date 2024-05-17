// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getReactNativePersistence,initializeAuth,getAuth} from 'firebase/auth';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore,collection} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWphFuoFDtjJY9roimwlEIacY3HPUb3tI",
  authDomain: "yazlab-289d3.firebaseapp.com",
  projectId: "yazlab-289d3",
  storageBucket: "yazlab-289d3.appspot.com",
  messagingSenderId: "951152425050",
  appId: "1:951152425050:web:bd284b9228e9ea81820063",
  measurementId: "G-4WB7SYQ29H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);


export const db = getFirestore(app);
export const usersRef = collection(db,'users');
export const roomRef = collection(db,'rooms');
export { auth };