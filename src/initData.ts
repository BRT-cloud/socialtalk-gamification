import { db } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { INITIAL_SCENARIOS } from './constants';

export async function initializeDatabase() {
  // Initialize Scenarios
  const scenarioSnap = await getDocs(collection(db, 'scenarios'));
  // Always update if structure changed or empty
  console.log("Initializing scenarios...");
  for (const scenario of INITIAL_SCENARIOS) {
    await setDoc(doc(db, 'scenarios', scenario.id), scenario);
  }
}
