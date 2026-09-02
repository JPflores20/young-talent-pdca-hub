import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  updateDoc,
  query,
  limit,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { pdcas as initialMockPdcas, type Pdca } from "@/data/pdca";

const COLLECTION_NAME = "pdcas";
const CONFIG_DOC_ID = "_config";

// Cache original copies to calculate granular diffs
const pdcaCache = new Map<string, string>();

export async function fetchPdcasFromFirestore(maxLimit?: number): Promise<Pdca[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = maxLimit ? query(colRef, limit(maxLimit)) : colRef;
    const snapshot = await getDocs(q);
    
    const configDoc = snapshot.docs.find((d) => d.id === CONFIG_DOC_ID);
    const isSeeded = configDoc?.data()?.[ "isSeeded" ] === true;

    if (!isSeeded) {
      console.log("Firestore collection is empty. Seeding initial PDCAs...");
      for (const pdca of initialMockPdcas) {
        await setDoc(doc(db, COLLECTION_NAME, pdca.id), pdca);
        pdcaCache.set(pdca.id, JSON.stringify(pdca));
      }
      await setDoc(doc(db, COLLECTION_NAME, CONFIG_DOC_ID), { isSeeded: true });
      return initialMockPdcas;
    }

    const pdcas: Pdca[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id !== CONFIG_DOC_ID) {
        const data = docSnap.data() as Pdca;
        pdcas.push(data);
        pdcaCache.set(data.id, JSON.stringify(data));
      }
    });
    return pdcas;
  } catch (error) {
    console.error("Error fetching PDCAs from Firestore:", error);
    return [];
  }
}

export function subscribeToPdcas(onUpdate: (pdcas: Pdca[]) => void, maxLimit?: number) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = maxLimit ? query(colRef, limit(maxLimit)) : colRef;
  
  return onSnapshot(q, async (snapshot) => {
    const configDoc = snapshot.docs.find((d) => d.id === CONFIG_DOC_ID);
    const isSeeded = configDoc?.data()?.[ "isSeeded" ] === true;

    if (!isSeeded) {
      console.log("Seeding initial PDCAs for first time setup...");
      for (const pdca of initialMockPdcas) {
        await setDoc(doc(db, COLLECTION_NAME, pdca.id), pdca);
        pdcaCache.set(pdca.id, JSON.stringify(pdca));
      }
      await setDoc(doc(db, COLLECTION_NAME, CONFIG_DOC_ID), { isSeeded: true });
      onUpdate(initialMockPdcas);
      return;
    }

    const pdcas: Pdca[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id !== CONFIG_DOC_ID) {
        const data = docSnap.data() as Pdca;
        pdcas.push(data);
        pdcaCache.set(data.id, JSON.stringify(data));
      }
    });
    onUpdate(pdcas);
  }, (error) => {
    console.error("Firestore realtime listener error:", error);
  });
}

function getShallowDiff(original: Record<string, any>, current: Record<string, any>): Record<string, any> {
  const diff: Record<string, any> = {};
  for (const key in current) {
    if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
      diff[key] = current[key];
    }
  }
  return diff;
}

export async function savePdcaToFirestore(pdca: Pdca): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, pdca.id);
    const cleanPdca = JSON.parse(JSON.stringify(pdca));
    
    // Optimizacion: Actualización Granular (Solo enviar campos que cambiaron)
    const originalStr = pdcaCache.get(pdca.id);
    if (originalStr) {
      const originalPdca = JSON.parse(originalStr);
      const diff = getShallowDiff(originalPdca, cleanPdca);
      
      if (Object.keys(diff).length === 0) {
        console.log("No changes detected, skipping network request.");
        return;
      }
      
      console.log(`Sending granular update for fields: ${Object.keys(diff).join(', ')}`);
      await updateDoc(docRef, diff);
    } else {
      // Fallback si no estaba cacheado
      await setDoc(docRef, cleanPdca, { merge: true });
    }
    
    // Actualizar caché
    pdcaCache.set(pdca.id, JSON.stringify(cleanPdca));
  } catch (error) {
    console.error("Error saving PDCA to Firestore:", error);
    // Fallback de emergencia a guardar todo completo
    try {
      const docRef = doc(db, COLLECTION_NAME, pdca.id);
      const cleanPdca = JSON.parse(JSON.stringify(pdca));
      await setDoc(docRef, cleanPdca, { merge: true });
      pdcaCache.set(pdca.id, JSON.stringify(cleanPdca));
    } catch(err2) {}
  }
}

export async function deletePdcaFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    pdcaCache.delete(id);
  } catch (error) {
    console.error("Error deleting PDCA from Firestore:", error);
  }
}
