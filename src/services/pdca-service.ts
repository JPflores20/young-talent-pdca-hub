import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { pdcas as initialMockPdcas, type Pdca } from "@/data/pdca";

const COLLECTION_NAME = "pdcas";
const CONFIG_DOC_ID = "_config";

export async function fetchPdcasFromFirestore(): Promise<Pdca[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    
    const configDoc = snapshot.docs.find((d) => d.id === CONFIG_DOC_ID);
    const isSeeded = configDoc?.data()?.[ "isSeeded" ] === true;

    if (!isSeeded) {
      console.log("Firestore collection is empty. Seeding initial PDCAs...");
      for (const pdca of initialMockPdcas) {
        await setDoc(doc(db, COLLECTION_NAME, pdca.id), pdca);
      }
      await setDoc(doc(db, COLLECTION_NAME, CONFIG_DOC_ID), { isSeeded: true });
      return initialMockPdcas;
    }

    const pdcas: Pdca[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id !== CONFIG_DOC_ID) {
        pdcas.push(docSnap.data() as Pdca);
      }
    });
    return pdcas;
  } catch (error) {
    console.error("Error fetching PDCAs from Firestore:", error);
    return [];
  }
}

export function subscribeToPdcas(onUpdate: (pdcas: Pdca[]) => void) {
  const colRef = collection(db, COLLECTION_NAME);
  
  return onSnapshot(colRef, async (snapshot) => {
    const configDoc = snapshot.docs.find((d) => d.id === CONFIG_DOC_ID);
    const isSeeded = configDoc?.data()?.[ "isSeeded" ] === true;

    if (!isSeeded) {
      console.log("Seeding initial PDCAs for first time setup...");
      for (const pdca of initialMockPdcas) {
        await setDoc(doc(db, COLLECTION_NAME, pdca.id), pdca);
      }
      await setDoc(doc(db, COLLECTION_NAME, CONFIG_DOC_ID), { isSeeded: true });
      onUpdate(initialMockPdcas);
      return;
    }

    const pdcas: Pdca[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.id !== CONFIG_DOC_ID) {
        pdcas.push(docSnap.data() as Pdca);
      }
    });
    onUpdate(pdcas);
  }, (error) => {
    console.error("Firestore realtime listener error:", error);
  });
}

export async function savePdcaToFirestore(pdca: Pdca): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, pdca.id);
    // Strip undefined values because Firestore rejects undefined values
    const cleanPdca = JSON.parse(JSON.stringify(pdca));
    await setDoc(docRef, cleanPdca, { merge: true });
  } catch (error) {
    console.error("Error saving PDCA to Firestore:", error);
  }
}

export async function deletePdcaFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting PDCA from Firestore:", error);
  }
}
