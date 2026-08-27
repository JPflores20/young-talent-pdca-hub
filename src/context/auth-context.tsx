import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

const isAdminEmail = (email: string) => {
  const emailLower = email.trim().toLowerCase();
  return emailLower.includes("jose.floresc-ext");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Local state for fallback users (allows Admin to add to it)
  const [mockUsers, setMockUsers] = useState<UserProfile[]>(
    INITIAL_MOCK_USERS.map(({ pass, ...rest }) => rest)
  );

  const [mockCredentials, setMockCredentials] = useState(INITIAL_MOCK_USERS);

  useEffect(() => {
    const storedUser = localStorage.getItem("pdca_auth_user");
    if (storedUser) {
      try {
        const parsed: UserProfile = JSON.parse(storedUser);
        if (parsed && isAdminEmail(parsed.email)) {
          parsed.role = "admin";
        }
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Error parsing stored auth user:", e);
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (user: UserProfile | null) => {
    if (user && isAdminEmail(user.email)) {
      user.role = "admin";
    }
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("pdca_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pdca_auth_user");
    }
  };

  const login = async (email: string, pass: string) => {
    const emailLower = email.trim().toLowerCase();
    const isAutoAdmin = isAdminEmail(emailLower);
    
    // Autenticar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(primaryAuth, emailLower, pass);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;
    
    // Obtener perfil de Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as Omit<UserProfile, "uid">;
      const role: UserRole = isAutoAdmin ? "admin" : (data.role || "user");
      if (isAutoAdmin && data.role !== "admin") {
        await setDoc(doc(db, "users", uid), { role: "admin" }, { merge: true });
      }
      persistSession({ uid, ...data, role, email: emailLower });
    } else {
      // El perfil no existía en Firestore (posible fallo durante registro).
      // Lo creamos automáticamente con los datos disponibles.
      const autoProfile: UserProfile = {
        uid,
        name: firebaseUser.displayName || emailLower.split("@")[0] || "Usuario",
        email: emailLower,
        role: isAutoAdmin ? "admin" : "user",
        area: "Usuario",
      };
      await setDoc(doc(db, "users", uid), {
        name: autoProfile.name,
        email: autoProfile.email,
        role: autoProfile.role,
        area: autoProfile.area,
        createdAt: new Date().toISOString(),
      });
      persistSession(autoProfile);
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
