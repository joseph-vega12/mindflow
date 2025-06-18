import 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

// if (!firebase.apps.length) {
const app = initializeApp(firebaseConfig);
// }

export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// auth.useEmulator('http://127.0.0.1:9099');
// firebase.functions().useFunctionsEmulator('http://127.0.0.1:5001/mindflow-local/us-central1/api');
