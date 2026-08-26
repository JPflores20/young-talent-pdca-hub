import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { primaryAuth, db } from "@/lib/firebase";

export type UserRole = "admin" | "user";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  area: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  // For the admin panel to add users to state
  setMockUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  mockUsers: UserProfile[];
  addMockUser: (user: UserProfile & { pass: string }) => void;
}

// Fallback users for when Firebase is down or not configured
const INITIAL_MOCK_USERS: (UserProfile & { pass: string })[] = [
  {
    uid: "mock-admin-123",
    name: "Administrador Global",
    email: "admin@gmodelo.com.mx",
    pass: "admin123",
    role: "admin",
    area: "Dirección",
  },
  {
    uid: "mock-user-456",
    name: "Ana López",
    email: "ana.lopez@gmodelo.com.mx",
    pass: "ana123",
    role: "user",
    area: "Envasado",
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Local state for fallback users (allows Admin to add to it)
  const [mockUsers, setMockUsers] = useState<UserProfile[]>(
    INITIAL_MOCK_USERS.map(({ pass, ...rest }) => rest)
  );

  // We keep passwords in a ref or just use INITIAL_MOCK_USERS for login
  // Since new users added during session might need login fallback, 
  // we actually should keep a full mock credentials array if we want full offline mock.
  // For simplicity, we will store them in a state that includes passwords, but not expose it.
  const [mockCredentials, setMockCredentials] = useState(INITIAL_MOCK_USERS);

  useEffect(() => {
    // In a real app with Firebase, we'd use onAuthStateChanged.
    // For this dual-setup, we check local storage to persist session.
    const storedUser = localStorage.getItem("pdca_auth_user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("pdca_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pdca_auth_user");
    }
  };

  const login = async (email: string, pass: string) => {
    const emailLower = email.trim().toLowerCase();
    
    try {
      // 1. Primario: Intentar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(primaryAuth, emailLower, pass);
      const uid = userCredential.user.uid;
      
      // 2. Fetch perfil en Firestore
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Omit<UserProfile, "uid">;
        persistSession({ uid, ...data, email: emailLower });
        return;
      } else {
        throw new Error("El perfil no fue encontrado en la base de datos.");
      }
    } catch (error: any) {
      console.warn("Firebase Auth falló, iniciando mecanismo de respaldo (Fallback local)...", error.message);
      
      // 3. Mecanismo de Respaldo: Check local mock array
      const mockMatch = mockCredentials.find(
        (u) => u.email.toLowerCase() === emailLower && u.pass === pass
      );

      if (mockMatch) {
        const { pass, ...profile } = mockMatch;
        persistSession(profile);
        return;
      }

      // Si falla Firebase y falla el Respaldo, rechazamos
      throw new Error("Credenciales inválidas o usuario no encontrado.");
    }
  };

  const logout = async () => {
    try {
      await signOut(primaryAuth);
    } catch (error) {
      console.error("Firebase signout error:", error);
    } finally {
      persistSession(null);
    }
  };

  // Exposed utility for admin to add mock users (in case Firebase is down)
  const addMockUser = (user: UserProfile & { pass: string }) => {
    setMockCredentials(prev => [...prev, user]);
    setMockUsers(prev => [...prev, { ...user }]);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    mockUsers,
    setMockUsers: (action: any) => {
      // Simplified mock management for UI purposes
      setMockUsers(action);
    },
    addMockUser
  };

  return (
    <AuthContext.Provider value={value as any}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
