// firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';

import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage imports tidak lagi diperlukan karena pakai Firestore
import RNFS from 'react-native-fs';

// ===== KONFIGURASI FIREBASE =====
const firebaseConfig = {
  apiKey: 'AIzaSyB3vEDI5lofcoBv0MEHkaW6BIuPUGNqTIc',
  authDomain: 'chatapp-837de.firebaseapp.com',
  projectId: 'chatapp-837de',
  storageBucket: 'chatapp-837de.appspot.com',
  messagingSenderId: '56972205340',
  appId: '1:56972205340:web:683b44f47d8da03541eed9',
};

// ===== INISIALISASI APP =====
const app = initializeApp(firebaseConfig);

// Auth + persistence (AUTO-LOGIN, pakai AsyncStorage)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

// Koleksi pesan
export const messagesCollection = collection(
  db,
  'messages',
) as CollectionReference<DocumentData>;

// ===== HELPER: upload gambar langsung ke Firestore sebagai base64 =====
export async function uploadImageAsync(
  uri: string,
  _path: string, // tidak dipakai, karena langsung ke Firestore
): Promise<string> {
  console.log('🔄 uploadImageAsync dipanggil (Firestore mode)');
  console.log('📍 URI:', uri);

  try {
    // Baca file menggunakan RNFS
    let filePath = uri;

    // Handle file:// prefix
    if (uri.startsWith('file://')) {
      filePath = uri.substring(7);
      console.log('📂 Removed file:// prefix');
    }

    console.log('📖 Membaca file dengan RNFS (base64)...');
    const base64Data = await RNFS.readFile(filePath, 'base64');
    console.log('✅ File berhasil dibaca, size:', base64Data.length, 'bytes');

    // Check size - Firestore limit 1MB per document
    // Kita akan compress size dengan reduce quality jika perlu
    if (base64Data.length > 800000) {
      console.warn(
        '⚠️ File size mendekati limit (>800KB), sebaiknya compress gambar di app',
      );
    }

    // Return base64 string langsung - akan disimpan di Firestore
    // URL adalah data URI yang bisa langsung digunakan oleh Image component
    const dataURI = `data:image/jpeg;base64,${base64Data}`;
    console.log('✅ Data URI siap untuk Firestore');

    return dataURI;
  } catch (error: any) {
    console.error('❌ Error saat baca gambar:', error);
    console.error('❌ Error message:', error.message || error.toString());
    throw error;
  }
}

// ===== EXPORT =====
export {
  auth,
  db,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};
