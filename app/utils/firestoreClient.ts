import { getFirestore, collection, addDoc, getDocs, setDoc, doc, query, where, orderBy, updateDoc, getDoc } from "firebase/firestore";
import { app } from "./firebaseClient";

export const db = getFirestore(app);
export { collection, addDoc, getDocs, setDoc, doc, query, where, orderBy, updateDoc, getDoc }; 