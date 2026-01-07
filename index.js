
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUV7jBtIE6ZuVKQm5-Gws9n7hB4voKOMM",
  authDomain: "presales-compass.firebaseapp.com",
  projectId: "presales-compass",
  storageBucket: "presales-compass.firebasestorage.app",
  messagingSenderId: "271507900986",
  appId: "1:271507900986:web:00423a6330b82e50f78303",
  measurementId: "G-RFF9F21T1T"
};

let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase 초기화 실패:", e);
}

export const firebaseDB = {
  getOrCreateUID: () => {
    let uid = localStorage.getItem('presales_uid');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('presales_uid', uid);
    }
    return uid;
  },

  loadUserData: async (uid) => {
    if (!db) return null;
    try {
      const docRef = doc(db, "presales_users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.warn("Firebase 로드 실패 (권한 또는 네트워크):", error.message);
      // 에러를 던지지 않고 null을 반환하여 앱이 로컬 데이터로 동작하게 함
      return null;
    }
  },

  saveUserData: async (uid, data) => {
    if (!db) throw new Error("Database not initialized");
    try {
      const docRef = doc(db, "presales_users", uid);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Firebase 저장 실패:", error.message);
      throw error;
    }
  }
};

window.firebaseDB = firebaseDB;
