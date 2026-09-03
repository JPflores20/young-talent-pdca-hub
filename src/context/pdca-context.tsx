import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { subscribeToPdcas } from "@/services/pdca-service";
import { type Pdca } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";

interface PdcaContextValue {
  /** PDCAs filtered by the current user role/ownership. */
  pdcaList: Pdca[];
  /** All raw PDCAs unfiltered — for admin-level views. */
  allPdcas: Pdca[];
  /** True until the first batch arrives from Firestore. */
  loading: boolean;
}

const PdcaContext = createContext<PdcaContextValue>({
  pdcaList: [],
  allPdcas: [],
  loading: true,
});

/**
 * Place ONCE near the root (inside AuthProvider, above all routes).
 *
 * Opens a SINGLE onSnapshot listener and distributes data to every consumer
 * via context. Previously layout, dashboard and index each opened their own
 * subscription — tripling Firestore read costs for the same data.
 */
export function PdcaProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [rawPdcas, setRawPdcas] = useState<Pdca[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      setRawPdcas([]);
      setLoading(false);
      initialLoadDone.current = false;
      return;
    }

    const unsubscribe = subscribeToPdcas((pdcas) => {
      setRawPdcas(pdcas);
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        setLoading(false);
      }
    });

    return () => unsubscribe();
    // Only re-subscribe when the logged-in user identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const pdcaList: Pdca[] = (() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return rawPdcas;
    const emailLower = currentUser.email.toLowerCase();
    return rawPdcas.filter((p) => {
      if (!p.autorEmail) return true;
      return (
        p.autorEmail.toLowerCase() === emailLower ||
        p.autor === currentUser.name
      );
    });
  })();

  return (
    <PdcaContext.Provider value={{ pdcaList, allPdcas: rawPdcas, loading }}>
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
