import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const app = initializeApp({ projectId: 'demo-test' });
const db = getFirestore(app);

async function test() {
  const ref = doc(db, 'pdcas/test');
  
  // Test 1: Array of arrays
  try {
    await setDoc(ref, { testField: [ [1] ] });
  } catch (e) {
    console.log('Error 1:', e.message);
  }

  // Test 2: Field named 'array'
  try {
    await setDoc(ref, { array: [ [1] ] });
  } catch (e) {
    console.log('Error 2:', e.message);
  }

  process.exit(0);
}
test();
