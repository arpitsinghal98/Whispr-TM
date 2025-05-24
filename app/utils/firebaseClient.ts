// app/utils/firebaseClient.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { saveUserToFirestore } from "~/firestoredb/userFirestore";

// Firebase config from Vite env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize app
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/userinfo.email");
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
provider.setCustomParameters({ prompt: "consent", access_type: "offline" });

/**
 * Sign in with Google and save user to Firestore
 */
const signInWithGoogle = async () => {
  console.log("🔑 Starting Google sign-in...");
  const result = await signInWithPopup(auth, provider);
  console.log(result);
  const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential;

  if (!credential) {
    throw new Error("No credential returned from Google sign-in.");
  }

  const token = credential.accessToken || "";
  if (typeof window !== "undefined") {
    localStorage.setItem("googleAccessToken", token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }

  // Wait for Firebase auth to confirm
  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve();
      }
    });
  });

  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated after sign-in.");

  await saveUserToFirestore({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    googleAccessToken: token,
  });

  return token;
};

export { app, auth, db, provider, signInWithGoogle };
