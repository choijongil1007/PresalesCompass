
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  collection,
  query,
  where,
  getDocs,
  limit
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
    console.log("[Firebase] Initialized successfully.");
} catch (e) {
    console.error("[Firebase] Initialization failed:", e);
}

export const firebaseDB = {
  sanitizeName: (name) => {
    if (!name) return "";
    return name.trim().replace(/\s+/g, '_').toLowerCase();
  },

  loadUserData: async (name) => {
    if (!db) return null;
    const sanitizedName = name.trim();
    const docId = firebaseDB.sanitizeName(sanitizedName);
    
    try {
      const docRef = doc(db, "presales_users", docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }

      const usersRef = collection(db, "presales_users");
      const q = query(usersRef, where("userName", "==", sanitizedName), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }

      return null;
    } catch (error) {
      console.error("[Firebase] Load error:", error);
      return null;
    }
  },

  fetchAllUsers: async () => {
    if (!db) return [];
    try {
      console.log("[Firebase] Fetching all users for Admin...");
      const usersRef = collection(db, "presales_users");
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      console.log(`[Firebase] Loaded ${users.length} users.`);
      return users;
    } catch (error) {
      console.error("[Firebase] Fetch all error:", error);
      return [];
    }
  },

  saveUserData: async (name, data) => {
    if (!db) return;
    try {
      const docId = firebaseDB.sanitizeName(name);
      const docRef = doc(db, "presales_users", docId);
      await setDoc(docRef, data, { merge: true });
      console.log(`[Firebase] Saved as ID: ${docId}`);
    } catch (error) {
      console.error("[Firebase] Save error:", error);
    }
  }
};

window.firebaseDB = firebaseDB;
