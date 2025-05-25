import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  onSnapshot,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { app } from "./firebaseClient";

export const db = getFirestore(app);
export {
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  getDoc,
  onSnapshot,
};
