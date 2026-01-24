import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBQG1XZ4DUvVODMCxKxdWbn7WinoMZrmw",
  authDomain: "football-league-mirny.firebaseapp.com",
  projectId: "football-league-mirny",
  messagingSenderId: "29301177192",
  appId: "1:29301177192:web:2e0af01692704b3fa534dd",
  measurementId: "G-HN0290C0W1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


