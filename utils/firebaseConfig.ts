import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBeKrT6UPxew5_K3oE2ddjpNXbz87VtSng",
    authDomain: "nri-nl.firebaseapp.com",
    projectId: "nri-nl",
    storageBucket: "nri-nl.firebasestorage.app",
    messagingSenderId: "411468608424",
    appId: "1:411468608424:web:4326872c2794db6318e39d",
    measurementId: "G-5JGL20CWEB"
};

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
