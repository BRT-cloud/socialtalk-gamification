import { db } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { INITIAL_SCENARIOS } from './constants';

export async function initializeDatabase() {
  // Initialize Scenarios
  console.log("Syncing scenarios with new 1st-person narratives...");
  for (const scenario of INITIAL_SCENARIOS) {
    await setDoc(doc(db, 'scenarios', scenario.id), scenario);
  }
}
