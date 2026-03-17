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

  // Initialize Schoolping Missions
  const schoolpingSnap = await getDocs(collection(db, 'schoolping'));
  if (schoolpingSnap.empty) {
    console.log("Initializing schoolping missions...");
    const initialMissions = [
      {
        id: 'mission-1',
        title: '급식실에서 감사 인사하기',
        description: '급식을 배식해주시는 분들께 "감사합니다"라고 크게 인사하고 인증샷을 남겨주세요.',
        submissions: []
      },
      {
        id: 'mission-2',
        title: '친구에게 칭찬 한 마디',
        description: '오늘 하루 친구의 장점을 찾아 칭찬해주고, 친구의 웃는 얼굴(또는 하이파이브)을 찍어보세요.',
        submissions: []
      }
    ];
    for (const mission of initialMissions) {
      await setDoc(doc(db, 'schoolping', mission.id), mission);
    }
  }
}
