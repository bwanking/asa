import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFpRE1lMCLox32brF5UB5vgX0oTzTftHM",
  authDomain: "asa-dba.firebaseapp.com",
  projectId: "asa-dba",
  storageBucket: "asa-dba.firebasestorage.app",
  messagingSenderId: "987392198785",
  appId: "1:987392198785:web:056ef33fbb1f0516a62580"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
