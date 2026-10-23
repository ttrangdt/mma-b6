// =========================================================================
// FIREBASE CONFIGURATION (Compatible with Expo Snack & React Native)
// =========================================================================
import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyCXaw_AU5Syrve8OE-ST4BscX_ZyiAX8wM",
  authDomain: "mma301-b6-app.firebaseapp.com",
  projectId: "mma301-b6-app",
  storageBucket: "mma301-b6-app.firebasestorage.app",
  messagingSenderId: "1036645070665",
  appId: "1:1036645070665:web:c4e34ff6f502fe6a708c98"
};

export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
};

let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, app, auth, db, firebaseConfig };
