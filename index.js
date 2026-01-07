
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
  // 이름을 문서 ID로 쓰기 좋게 정규화 (공백 제거, 소문자화 등)
  sanitizeName: (name) => {
    return name.trim().replace(/\s+/g, '_').toLowerCase();
  },

  // 이름(ID)으로 기존 데이터 불러오기
  loadUserData: async (name) => {
    if (!db) return null;
    try {
      const docId = firebaseDB.sanitizeName(name);
      const docRef = doc(db, "presales_users", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.warn("Firebase 데이터 로드 실패:", error.message);
      return null;
    }
  },

  // 이름(ID)으로 데이터 저장하기
  saveUserData: async (name, data) => {
    if (!db) return;
    try {
      const docId = firebaseDB.sanitizeName(name);
      const docRef = doc(db, "presales_users", docId);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Firebase 데이터 저장 실패:", error.message);
    }
  }
};

window.firebaseDB = firebaseDB;
