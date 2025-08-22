import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAilzP7Eg_YPt5IGbfCD8ki9e4fjCEdYSU",
  authDomain: "aplicativo-max-testorin.firebaseapp.com",
  projectId: "aplicativo-max-testorin",
  storageBucket: "aplicativo-max-testorin.firebasestorage.app",
  messagingSenderId: "859772678381",
  appId: "1:859772678381:web:c6e60e233f79d51afe5ce4",
  measurementId: "G-GFP9PGG11E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence
import { enableNetwork, disableNetwork } from 'firebase/firestore';

export const enableOfflineMode = () => disableNetwork(db);
export const enableOnlineMode = () => enableNetwork(db);

export default app;