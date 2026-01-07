
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * [필독] 'Missing or insufficient permissions' 에러 해결 방법
 * 
 * 1. Firebase Console (https://console.firebase.google.com/) 접속
 * 2. 해당 프로젝트 선택 -> 'Firestore Database' 메뉴 클릭
 * 3. 상단 'Rules' (규칙) 탭 클릭
 * 4. 기존 규칙을 지우고 아래 내용을 복사해서 붙여넣으세요:
 * 
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /presales_users/{userId} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 * 
 * 5. 'Publish' (게시) 버튼을 클릭하세요.
 * 6. 약 1분 정도 기다린 후 앱을 새로고침하세요.
 */

const firebaseConfig = {
  apiKey: "AIzaSyDUV7jBtIE6ZuVKQm5-Gws9n7hB4voKOMM",
  authDomain: "presales-compass.firebaseapp.com",
  projectId: "presales-compass",
  storageBucket: "presales-compass.firebasestorage.app",
  messagingSenderId: "271507900986",
  appId: "1:271507900986:web:00423a6330b82e50f78303",
  measurementId: "G-RFF9F21T1T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    try {
      const docRef = doc(db, "presales_users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Firebase Load Error:", error.code, error.message);
      throw error;
    }
  },

  saveUserData: async (uid, data) => {
    try {
      const docRef = doc(db, "presales_users", uid);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Firebase Save Error:", error.code, error.message);
      throw error;
    }
  }
};

window.firebaseDB = firebaseDB;
