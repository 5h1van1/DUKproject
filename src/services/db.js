/**
 * Database Service: Real-time Firestore with automatic local mock fallback.
 * Automatically saves to the "rsvps" collection in Firebase Firestore when credentials are provided in .env.
 * If credentials are not yet configured, seamlessly uses localStorage with real-time updates and demo seed data.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// Safe environment variable resolution (Vite browser or Node)
const env = (typeof import.meta !== "undefined" && import.meta.env)
  ? import.meta.env
  : (typeof process !== "undefined" && process.env ? process.env : {});

// Firebase credentials from environment variables
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Check if valid Firebase credentials exist
const isFirebaseReady = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let db = null;
if (isFirebaseReady) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase Firestore connected successfully to project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("⚠️ Firebase init failed, falling back to local storage:", err);
    db = null;
  }
} else {
  console.info("ℹ️ Running with local demo storage. Add Firebase credentials to .env to enable cloud Firestore.");
}

export { isFirebaseReady };

// -------------------------------------------------------------
// LOCAL FALLBACK STORE & DEMO SEED DATA
// -------------------------------------------------------------
const LOCAL_STORAGE_KEY = "wedding_turf_rsvps_store";
const LOCAL_EVENT_KEY = "wedding_turf_rsvp_updated";

const INITIAL_DEMO_RSVPS = [
  {
    id: "arjun_mehta",
    name: "Arjun Mehta",
    team: "groom",
    preferredDate: "2026-01-28",
    needsJersey: true,
    jerseySize: "L",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "priya_sharma",
    name: "Priya Sharma",
    team: "bride",
    preferredDate: "2026-01-28",
    needsJersey: true,
    jerseySize: "S",
    createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
  },
  {
    id: "rohit_verma",
    name: "Rohit Verma",
    team: "groom",
    preferredDate: "2026-01-29",
    needsJersey: true,
    jerseySize: "XL",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sneha_patel",
    name: "Sneha Patel",
    team: "bride",
    preferredDate: "2026-01-28",
    needsJersey: true,
    jerseySize: "M",
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: "vikram_singh",
    name: "Vikram Singh",
    team: "groom",
    preferredDate: "2026-01-28",
    needsJersey: false,
    jerseySize: "None",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "tanvi_deshmukh",
    name: "Tanvi Deshmukh",
    team: "bride",
    preferredDate: "2026-01-29",
    needsJersey: true,
    jerseySize: "XS",
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
  },
];

// Safe storage resolution for Browser & Node environments
let memoryFallbackStore = null;
const safeStorage = {
  getItem: (key) => {
    if (typeof localStorage !== "undefined") return localStorage.getItem(key);
    return memoryFallbackStore;
  },
  setItem: (key, val) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, val);
    else memoryFallbackStore = val;
  },
};

const safeWindow = typeof window !== "undefined" ? window : null;

function getLocalRsvps() {
  try {
    const raw = safeStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      safeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_RSVPS));
      return INITIAL_DEMO_RSVPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Local storage read error", e);
    return INITIAL_DEMO_RSVPS;
  }
}

const memorySubscribers = new Set();

function setLocalRsvps(data) {
  try {
    safeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    memorySubscribers.forEach((cb) => {
      try { cb(data); } catch (err) {}
    });
    if (safeWindow) {
      safeWindow.dispatchEvent(new Event(LOCAL_EVENT_KEY));
    }
  } catch (e) {
    console.error("Local storage write error", e);
  }
}

// Helper to normalize names for duplicate prevention
export function generateDocId(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 50);
}

// -------------------------------------------------------------
// PUBLIC DATABASE API
// -------------------------------------------------------------

/**
 * Save or update an RSVP. Prevents duplicates by using normalized name as ID.
 */
export async function saveRsvp(rsvpData) {
  const docId = generateDocId(rsvpData.name);
  const nowIso = new Date().toISOString();

  const record = {
    ...rsvpData,
    id: docId,
    name: rsvpData.name.trim(),
    team: rsvpData.team,
    preferredDate: rsvpData.preferredDate,
    needsJersey: Boolean(rsvpData.needsJersey),
    jerseySize: rsvpData.needsJersey ? rsvpData.jerseySize : "None",
    updatedAt: nowIso,
  };

  if (db) {
    try {
      const docRef = doc(collection(db, "rsvps"), docId);
      await setDoc(docRef, {
        ...record,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return { success: true, docId, isUpdate: true };
    } catch (err) {
      console.error("Firestore save error, saving locally:", err);
      // Fallback if network/firestore error
    }
  }

  // Local storage save / upsert
  const current = getLocalRsvps();
  const existingIdx = current.findIndex((item) => item.id === docId);
  let isUpdate = false;

  if (existingIdx >= 0) {
    isUpdate = true;
    current[existingIdx] = {
      ...current[existingIdx],
      ...record,
      createdAt: current[existingIdx].createdAt || nowIso,
    };
  } else {
    current.unshift({
      ...record,
      createdAt: nowIso,
    });
  }

  setLocalRsvps(current);
  return { success: true, docId, isUpdate };
}

/**
 * Subscribe to real-time RSVPs.
 * Calls callback(rsvpsList) immediately and on any changes.
 * Returns an unsubscribe function.
 */
export function subscribeToRsvps(callback) {
  if (db) {
    try {
      const q = collection(db, "rsvps");
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          list.push({
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
          });
        });
        callback(list);
      }, (err) => {
        console.warn("Firestore subscription failed, using local store:", err);
        callback(getLocalRsvps());
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore query error:", err);
    }
  }

  // Local Storage subscription
  const handleUpdate = () => {
    callback(getLocalRsvps());
  };

  memorySubscribers.add(callback);

  if (safeWindow) {
    safeWindow.addEventListener(LOCAL_EVENT_KEY, handleUpdate);
    safeWindow.addEventListener("storage", handleUpdate);
  }
  
  // Initial call
  callback(getLocalRsvps());

  return () => {
    memorySubscribers.delete(callback);
    if (safeWindow) {
      safeWindow.removeEventListener(LOCAL_EVENT_KEY, handleUpdate);
      safeWindow.removeEventListener("storage", handleUpdate);
    }
  };
}

/**
 * Delete an RSVP (Admin feature)
 */
export async function deleteRsvp(docId) {
  if (db) {
    try {
      await deleteDoc(doc(collection(db, "rsvps"), docId));
    } catch (err) {
      console.error("Firestore delete error:", err);
    }
  }

  const current = getLocalRsvps();
  const filtered = current.filter((item) => item.id !== docId);
  setLocalRsvps(filtered);
  return true;
}

/**
 * Reset / Seed demo data for testing
 */
export function resetDemoData() {
  setLocalRsvps(INITIAL_DEMO_RSVPS);
}
