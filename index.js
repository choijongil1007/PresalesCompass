
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
    console.log("Firebase initialized successfully.");
} catch (e) {
    console.error("Firebase 초기화 실패:", e);
}

export const firebaseDB = {
  // 공백 제거 및 소문자화하여 문서 ID 생성
  sanitizeName: (name) => {
    if (!name) return "";
    // 한글 이름의 경우 소문자화는 의미 없으나 영문 혼용 대비 유지
    const sanitized = name.trim().replace(/\s+/g, '_').toLowerCase();
    return sanitized;
  },

  loadUserData: async (name) => {
    if (!db) {
        console.error("Database connection missing.");
        return null;
    }
    try {
      const docId = firebaseDB.sanitizeName(name);
      console.log(`[Firebase] Loading data for ID: "${docId}" (Original: "${name}")`);
      
      const docRef = doc(db, "presales_users", docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("[Firebase] Data found:", data);
        return data;
      } else {
        console.log("[Firebase] No existing document found for ID:", docId);
        return null;
      }
    } catch (error) {
      console.error("[Firebase] Load error:", error);
      return null;
    }
  },

  saveUserData: async (name, data) => {
    if (!db) return;
    try {
      const docId = firebaseDB.sanitizeName(name);
      const docRef = doc(db, "presales_users", docId);
      await setDoc(docRef, data, { merge: true });
      console.log(`[Firebase] Data saved successfully for ID: ${docId}`);
    } catch (error) {
      console.error("[Firebase] Save error:", error);
    }
  }
};

window.firebaseDB = firebaseDB;
