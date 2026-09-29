const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'demo-test' });
const db = admin.firestore();

async function test() {
  try {
    await db.collection('test').doc('test').set({ myField: [ [1] ] });
  } catch (e) {
    console.log('Test 1 (myField: [[1]]):', e.message);
  }
  
  try {
    await db.collection('test').doc('test').set({ evidenciasSolucion: [ { array: [ [1] ] } ] });
  } catch (e) {
    console.log('Test 2 (evidenciasSolucion with array: [[1]]):', e.message);
  }

  try {
    await db.collection('test').doc('test').set({ array: [ [1] ] });
  } catch (e) {
    console.log('Test 3 (array: [[1]]):', e.message);
  }
}
test();
