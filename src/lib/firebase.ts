import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase usando variables de entorno o valores dummy de respaldo
const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'] || "AIzaSyB7RK02a6zRonJdXTaK3K4BJLxkJqZUF8Y",
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] || "maz-pdca-hub.firebaseapp.com",
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'] || "maz-pdca-hub",
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] || "maz-pdca-hub.firebasestorage.app",
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'] || "390282074253",
  appId: import.meta.env['VITE_FIREBASE_APP_ID'] || "1:390282074253:web:0627abcb94fd00d6ef2ac4"
};

// Inicializar la App Principal
const primaryApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar la App Secundaria (exclusiva para registro de admins, evita cerrar sesión activa)
const secondaryApp = getApps().find(app => app.name === "Secondary") 
  || initializeApp(firebaseConfig, "Secondary");

export const primaryAuth = getAuth(primaryApp);
export const secondaryAuth = getAuth(secondaryApp);

// Habilitar caché offline nativo usando la nueva API
export const db = initializeFirestore(primaryApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const storage = getStorage(primaryApp);
