import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, updateProfile, User } from "firebase/auth";

// ⚠️ هام: لحل مشكلة 'api-key-not-valid'، يجب عليك إضافة مفتاح API الصحيح.
// 1. اذهب إلى https://console.firebase.google.com/
// 2. أنشئ مشروعاً جديداً أو اختر مشروعاً موجوداً.
// 3. فعّل Authentication -> Google Sign-In.
// 4. اذهب إلى Project Settings، وانسخ الـ Config.
// 5. يفضل وضع المفاتيح في ملف .env بالصيغة: VITE_FIREBASE_API_KEY=...

// Helper to get environment variable (supports Vite 'import.meta.env' and standard 'process.env')
const getEnv = (key: string) => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env[`VITE_${key}`] || import.meta.env[key];
    }
    return process.env[key];
};

const apiKey = getEnv("FIREBASE_API_KEY") || "YOUR_API_KEY_HERE";

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN") || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: getEnv("FIREBASE_PROJECT_ID") || "YOUR_PROJECT_ID",
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET") || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID") || "SENDER_ID",
  appId: getEnv("FIREBASE_APP_ID") || "APP_ID"
};

// Initialize Firebase safely
let auth: any = null;
let googleProvider: any = null;

// Only initialize if we have a real key (not the placeholder)
// This prevents the annoying "api-key-not-valid" error on startup
if (apiKey && apiKey !== "YOUR_API_KEY_HERE" && !apiKey.includes("YOUR_")) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error) {
        console.warn("Firebase initialization failed:", error);
    }
} else {
    console.log("Firebase skipped: No valid API Key found in .env. Auth features will be disabled.");
}

export const signInWithGoogle = async () => {
    if (!auth) {
        alert("⚠️ Authentication is not configured.\nPlease set up VITE_FIREBASE_API_KEY in your .env file to enable Google Login.");
        return;
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        console.error("Error signing in", error);
        if (error.code === 'auth/api-key-not-valid') {
            alert("خطأ: مفتاح Firebase API غير صالح. يرجى تحديث ملف services/firebase.ts بالمفاتيح الصحيحة من Firebase Console.");
        } else {
            alert(`Login Failed: ${error.message}`);
        }
        throw error;
    }
};

export const logout = async () => {
    if (!auth) return;
    await signOut(auth);
};

export const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth || !auth.currentUser) return;
    try {
        await updateProfile(auth.currentUser, {
            displayName: displayName,
            photoURL: photoURL
        });
        return auth.currentUser;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export { auth };
export type { User };