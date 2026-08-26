import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase usando variables de entorno o valores dummy de respaldo
const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'] || "dummy_api_key",
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] || "dummy_auth_domain",
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'] || "dummy_project_id",
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] || "dummy_storage_bucket",
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'] || "dummy_sender_id",
  appId: import.meta.env['VITE_FIREBASE_APP_ID'] || "dummy_app_id"
};

// Inicializar la App Principal
const primaryApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar la App Secundaria (exclusiva para registro de admins, evita cerrar sesión activa)
const secondaryApp = getApps().find(app => app.name === "Secondary") 
  || initializeApp(firebaseConfig, "Secondary");

export const primaryAuth = getAuth(primaryApp);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(primaryApp);
