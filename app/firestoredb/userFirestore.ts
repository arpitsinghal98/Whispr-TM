import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "~/utils/firebaseClient";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
  googleAccessToken: string;
}

export async function saveUserToFirestore(userData: UserData) {
  const userRef = doc(db, "users", userData.uid);

  try {
    console.log("📌 Writing user with UID:", userData.uid);

    await setDoc(
      userRef,
      {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || "",
        googleAccessToken: userData.googleAccessToken,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ User saved to Firestore");
  } catch (err) {
    console.error("❌ Error saving user to Firestore:", err);
    throw err;
  }
}
