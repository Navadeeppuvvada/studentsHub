// Firebase SDK imports
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxctMvorgTwLcgfeyGxxHCGQj_DhjSbQE",
    authDomain: "studenthub-4e30c.firebaseapp.com",
    projectId: "studenthub-4e30c",
    storageBucket: "studenthub-4e30c.firebasestorage.app",
    messagingSenderId: "526587856261",
    appId: "1:526587856261:web:80a3f848fdaa6aae40b0ec",
    measurementId: "G-DN58XL9DD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;