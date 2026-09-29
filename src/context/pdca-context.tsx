import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { fetchPdcasFromFirestore } from "@/services/pdca-service";
import { type Pdca } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";

interface PdcaContextValue {
  /** PDCAs filtered by the current user role/ownership. */
  pdcaList: Pdca[];
  /** All raw PDCAs unfiltered — for admin-level views. */
  allPdcas: Pdca[];
  /** True until the first batch arrives from Firestore. */
  loading: boolean;
  /** Function to manually refresh the list from Firestore. */
  refresh: () => Promise<void>;
}

const PdcaContext = createContext<PdcaContextValue>({
  pdcaList: [],
  allPdcas: [],
  loading: true,
  refresh: async () => {},
});

/**
 * Place ONCE near the root (inside AuthProvider, above all routes).
 *
 * Fetches data ONCE per load to save massive read quotas.
 */
export function PdcaProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [rawPdcas, setRawPdcas] = useState<Pdca[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const loadData = async () => {
    try {
      const pdcas = await fetchPdcasFromFirestore();
      setRawPdcas(pdcas);
    } catch (error) {
      console.error("Error fetching pdcas:", error);
    } finally {
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!currentUser) {
      setRawPdcas([]);
      setLoading(false);
      initialLoadDone.current = false;
      return;
    }

    const load = async () => {
      try {
        const pdcas = await fetchPdcasFromFirestore();
        if (isMounted) setRawPdcas(pdcas);
      } catch (error) {
        console.error("Error fetching pdcas:", error);
      } finally {
        if (isMounted && !initialLoadDone.current) {
          initialLoadDone.current = true;
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  const pdcaList: Pdca[] = (() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return rawPdcas;
    const emailLower = currentUser.email.toLowerCase();
    return rawPdcas.filter((p) => {
      // Si el PDCA no tiene asignados, usamos la lógica original
      if (!p.asignados || p.asignados.length === 0) {
        if (!p.autorEmail) return true;
        return p.autorEmail.toLowerCase() === emailLower || p.autor === currentUser.name;
      }

      // Si tiene asignados, verificamos si el usuario actual está en la lista o es el autor original
      const isAssigned = p.asignados.some((a) => a.email.toLowerCase() === emailLower);
      const isAuthor = p.autorEmail?.toLowerCase() === emailLower || p.autor === currentUser.name;
      return isAssigned || isAuthor;
    });
  })();

  return (
    <PdcaContext.Provider value={{ pdcaList, allPdcas: rawPdcas, loading, refresh: loadData }}>
      {children}
    </PdcaContext.Provider>
  );
}

/**
 * Returns the PDCAs visible to the current user plus a loading flag.
 * Must be used inside a <PdcaProvider>.
 */
export function usePdcas(): PdcaContextValue {
  return useContext(PdcaContext);
}
