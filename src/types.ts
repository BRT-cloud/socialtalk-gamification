export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  exp: number; // 경험치
  competenceIndex: number; // 유능감 지수 (Ericsson)
  wisdom: number; // 지혜 포인트
  level: number;
  badges: string[];
  role: 'student' | 'admin';
  stats: {
    cognitive: number;
    emotional: number;
    behavioral: number;
  };
  clearedWorlds: string[];
  unlockedStages: string[];
  clearedStages: string[];
  schoolpingCompleted: string[]; // 완료한 스쿨핑 미션 ID
}

export interface Quest {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'long-answer';
  question: string;
  options?: string[]; // For multiple-choice
  correctAnswer: string; // Model answer for long-answer, exact answer for others
  explanation?: string; // Explanation for the answer
  keywords?: string[]; // Keywords for long-answer self-evaluation
}

export interface Scenario {
  id: string;
  world: 'forest' | 'sea' | 'city' | 'castle';
  stage: number;
  isBoss: boolean;
  isSchoolping?: boolean;
  title: string;
  situation: string;
  mediaUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  quests: Quest[];
}

export interface Attempt {
  id?: string;
  uid: string;
  scenarioId: string;
  questId: string;
  userInput: string;
  isCorrect: boolean;
  timestamp: any;
}

export interface SchoolpingSubmission {
  uid: string;
  userName: string;
  imageUrl: string;
  text?: string;
  timestamp: any;
}

export interface SchoolpingMission {
  id: string;
  title: string;
  description: string;
  submissions: SchoolpingSubmission[];
}
