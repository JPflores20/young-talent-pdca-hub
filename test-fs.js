import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';

const app = initializeApp({ projectId: 'demo-test' });
const db = getFirestore(app);

async function test() {
  const d = doc(db, 't/t');
  try { await setDoc(d, { a: 1 }); } catch(e) {}
  
  try {
    await updateDoc(d, { 
      evidenciasSolucion: [ [1] ]
    });
  } catch(e) {
    console.log('Update array in array:', e.message);
  }

  try {
    await updateDoc(d, { 
      evidenciasSolucion: [ undefined ]
    });
  } catch(e) {
    console.log('Update undefined in array:', e.message);
  }
  process.exit(0);
}
test();
