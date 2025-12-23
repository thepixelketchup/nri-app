import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBeKrT6UPxew5_K3oE2ddjpNXbz87VtSng",
    authDomain: "nri-nl.firebaseapp.com",
    projectId: "nri-nl",
    storageBucket: "nri-nl.firebasestorage.app",
    messagingSenderId: "411468608424",
    appId: "1:411468608424:web:4326872c2794db6318e39d",
    measurementId: "G-5JGL20CWEB"
};

let app;
let auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    // Initialize Auth with persistence
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
