// =========================================================================
// FIREBASE CONFIGURATION
// =========================================================================
// Thay thế các giá trị bên dưới bằng thông tin dự án Firebase của bạn:
// 1. Vào https://console.firebase.google.com/
// 2. Tạo hoặc chọn Project của bạn
// 3. Vào Project Settings -> General -> Your apps -> Thêm ứng dụng Web (icon </>)
// 4. Copy đối tượng firebaseConfig và dán vào đây:
// =========================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCXaw_AU5Syrve8OE-ST4BscX_ZyiAX8wM",
  authDomain: "mma301-b6-app.firebaseapp.com",
  projectId: "mma301-b6-app",
  storageBucket: "mma301-b6-app.firebasestorage.app",
  messagingSenderId: "1036645070665",
  appId: "1:1036645070665:web:c4e34ff6f502fe6a708c98"
};

// Kiểm tra xem người dùng đã điền Firebase Config thật hay chưa
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
};

// Khởi tạo Firebase App
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Khởi tạo Firebase Auth với AsyncStorage persistence
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (e) {
  // Nếu đã được khởi tạo trước đó (ví dụ hot reload trên Snack)
  auth = getAuth(app);
}

// Khởi tạo Firestore Database
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
