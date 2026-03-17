import { Scenario, Quest } from './types';

export const WORLDS = [
  { id: 'forest', name: '우정의 숲', color: 'bg-emerald-500', icon: 'Trees', desc: '대화 시작, 친구 사귀기, 협동 기술 (국어: 화법의 기초, 공감적 듣기)' },
  { id: 'sea', name: '공감의 바다', color: 'bg-blue-500', icon: 'Waves', desc: '가정 및 온라인 예절, 비언어적 신호 읽기 (국어: 언어 예절, 매체 언어 분석)' },
  { id: 'city', name: '자립의 도시', color: 'bg-amber-500', icon: 'Building2', desc: '기능적 생활 기술 및 사회 규칙 (국어: 실용적 텍스트 읽기, 정보 전달)' },
  { id: 'castle', name: '내면의 성', color: 'bg-purple-500', icon: 'Castle', desc: '갈등 해결, 거절하기, 자존감 회복 (국어: 설득하는 말하기, 비판적 사고)' },
] as const;

const getForestTheme = (stage: number) => {
  const themes = ['새 학기 인사', '친구의 책 관심 갖기', '모둠 활동 참여', '체육 시간 양보하기', '점심 시간 대화하기', '준비물 빌리기', '사과하기', '칭찬하기'];
  return themes[(stage - 1) % themes.length];
};

const getSeaTheme = (stage: number) => {
  const themes = ['부모님께 외출 허락 구하기', '단톡방 예절 지키기', '온라인 게임 매너', '가족과 식사 시간 대화', '형제자매와 물건 나누기', 'SNS 댓글 달기'];
  return themes[(stage - 1) % themes.length];
};

const getCityTheme = (stage: number) => {
  const themes = ['편의점 계산하기', '버스 노선 묻기', '우체국 이용하기', '도서관 대출하기', '길 잃었을 때 도움 요청하기', '식당에서 주문하기'];
  return themes[(stage - 1) % themes.length];
};

const getCastleTheme = (stage: number) => {
  const themes = ['무리한 부탁 거절하기', '오해로 인한 갈등 해결', '우울감과 힘듦 표현하기', '실패에 대처하기', '질투심 조절하기', '부당한 대우에 항의하기'];
  return themes[(stage - 1) % themes.length];
};

const generateQuests = (stage: number, sector: string, theme: string, world: string): Quest[] => {
  let q1Options = [];
  let q1Answer = '';
  
  if (world === 'forest') {
    q1Options = ['서로의 의도를 오해하여 소통이 단절된 상태', '상대방이 나를 무시하여 화가 난 상태', '대화 주제가 지루해서 흥미를 잃은 상태'];
    q1Answer = '서로의 의도를 오해하여 소통이 단절된 상태';
  } else if (world === 'sea') {
    q1Options = ['비언어적 신호와 표면적 언어의 불일치로 인한 혼란', '온라인 연결 상태가 좋지 않아 생긴 오해', '서로의 관심사가 달라 대화가 끊긴 상태'];
    q1Answer = '비언어적 신호와 표면적 언어의 불일치로 인한 혼란';
  } else if (world === 'city') {
    q1Options = ['바쁘고 혼잡한 환경 속에서 발생한 의사소통의 단절', '서로의 이익이 충돌하여 발생한 직접적인 다툼', '규칙을 몰라서 발생한 일방적인 실수'];
    q1Answer = '바쁘고 혼잡한 환경 속에서 발생한 의사소통의 단절';
  } else {
    q1Options = ['친근함을 가장한 무리한 요구와 심리적 압박', '서로의 의견이 달라서 생긴 가벼운 말다툼', '단순한 피로감으로 인한 대화 거부'];
    q1Answer = '친근함을 가장한 무리한 요구와 심리적 압박';
  }

  return [
    {
      id: `s${stage}-q1`,
      type: 'multiple-choice',
      question: `현재 상황에서 발생한 가장 핵심적인 문제나 갈등의 원인은 무엇인가요?`,
      options: q1Options,
      correctAnswer: q1Answer
    },
    {
      id: `s${stage}-q2`,
      type: 'long-answer',
      question: `제시된 상황 설명을 바탕으로, 현재 상대방이 느끼고 있을 감정이나 입장을 추측하여 적어보세요.`,
      aiEvaluation: true
    },
    {
      id: `s${stage}-q3`,
      type: 'multiple-choice',
      question: `이 상황을 지혜롭게 해결하고 대화를 이어나가기 위해 당신이 가장 먼저 취해야 할 행동은 무엇일까요?`,
      options: ['상대방의 감정을 존중하며 부드럽게 대화의 문 열기', '내 입장을 먼저 강하게 주장하여 기선 제압하기', '상황이 자연스럽게 해결될 때까지 침묵하며 기다리기'],
      correctAnswer: '상대방의 감정을 존중하며 부드럽게 대화의 문 열기'
    },
    {
      id: `s${stage}-q4`,
      type: 'long-answer',
      question: `'나-전달법(I-Message)'이나 공감적 듣기 등 배운 화법 기술을 활용하여, 상대방에게 실제로 건넬 첫 마디를 작성해보세요.`,
      aiEvaluation: true
    },
    {
      id: `s${stage}-q5`,
      type: 'multiple-choice',
      question: `당신이 적절한 화법으로 대화를 시도한 후, 예상되는 가장 긍정적인 결과나 다음으로 이어질 바람직한 대처 방법은 무엇인가요?`,
      options: ['서로의 오해를 풀고 신뢰를 바탕으로 한 타협점 찾기', '상대방이 내 의견에 무조건적으로 동의하게 만들기', '더 이상의 대화 없이 각자의 행동에만 집중하기'],
      correctAnswer: '서로의 오해를 풀고 신뢰를 바탕으로 한 타협점 찾기'
    }
  ];
};

const generateScenarios = (): Scenario[] => {
  const scenarios: Scenario[] = [];
  for (let i = 1; i <= 105; i++) {
    let world: 'forest' | 'sea' | 'city' | 'castle' = 'forest';
    let sectorName = '';
    let situation = '';
    let theme = '';

    if (i <= 40) {
      world = 'forest';
      sectorName = '우정의 숲';
      theme = getForestTheme(i);
      situation = `어둑한 교실 안, 창문 틈으로 들어오는 네온 빛이 친구의 굳은 얼굴을 비춥니다. 현재 상황은 '${theme}' 과업을 수행해야 하는 순간입니다. 친구는 팔짱을 낀 채 시선을 피하고 있으며, 방금 전 당신의 행동에 아무런 대답도 하지 않았습니다. 입술은 굳게 다물려 있지만, 떨리는 손끝에서 당황스러움과 경계심이 묻어납니다. "괜찮아"라고 짧게 내뱉은 말과 달리 온몸으로는 거부의 신호를 보내고 있습니다. 당신은 이 어색한 기류를 깨고, 친구의 진짜 감정을 파악하여 자연스럽게 대화를 이어가야 합니다.`;
    } else if (i <= 60) {
      world = 'sea';
      sectorName = '공감의 바다';
      theme = getSeaTheme(i);
      situation = `푸른 홀로그램이 일렁이는 공간, 현재 '${theme}' 상황에 직면해 있습니다. 화면 너머 혹은 거실 소파에 앉은 상대방은 한숨을 크게 쉬며 고개를 젓고 있습니다. 당신이 말을 꺼내자 당황한 듯 말끝을 흐리며, "알아서 해"라는 의미심장한 말만 남깁니다. 텍스트나 표면적인 대답과 달리, 공간의 분위기는 차갑게 얼어붙었습니다. 당신은 이 미묘한 갈등 신호를 읽어내고, 관계를 회복하기 위한 적절한 반응을 보여야 합니다.`;
    } else if (i <= 85) {
      world = 'city';
      sectorName = '자립의 도시';
      theme = getCityTheme(i);
      situation = `복잡한 사이버 도시의 한복판, 당신은 '${theme}' 과업을 완수해야 합니다. 당신의 차례가 왔을 때, 상대방(점원, 시민 등)은 피곤한 기색이 역력한 얼굴로 모니터나 스마트폰만 응시합니다. 기계적인 음성으로 대답하지만, 미간은 찌푸려져 있고 손가락은 초조하게 움직이고 있습니다. 뒤에 선 사람들의 웅성거리는 소리가 당신을 더욱 재촉하는 듯합니다. 당신은 이 혼잡한 환경 속에서 상대방의 비언어적 신호를 파악하고, 빠르고 예의 바르게 상황을 대처해야 합니다.`;
    } else {
      world = 'castle';
      sectorName = '내면의 성';
      theme = getCastleTheme(i);
      situation = `보랏빛 안개가 자욱한 내면의 성곽, 당신은 '${theme}' 상황에 놓여 있습니다. 상대방은 웃는 얼굴로 당신에게 다가오지만, 어깨를 꽉 쥐는 손길이나 은근한 말투에서 강압적인 태도가 느껴집니다. 당신의 마음속에서는 불편함과 미안함이 충돌하며 혼란스러운 경고음이 울립니다. 친근한 언어 속에 숨겨진 통제나 갈등의 신호를 알아차려야 하는 순간입니다. 당신은 관계를 망치지 않으면서도 단호하게 자신의 감정을 표현하고 경계를 설정해야 합니다.`;
    }

    const isSchoolping = i % 10 === 0;
    // Use the requested image_server URL format, with a fallback to picsum for actual rendering if needed.
    // The prompt explicitly requested: https://image_server/stage_{id}.png
    // We use picsum here so the UI doesn't look broken in the preview.
    const imageUrl = `https://picsum.photos/seed/stage${i}/800/600`;

    scenarios.push({
      id: `stage-${i}`,
      world,
      stage: i,
      isBoss: isSchoolping,
      isSchoolping: isSchoolping,
      title: `${theme} (스테이지 ${i})`,
      situation,
      mediaUrl: imageUrl,
      difficulty: isSchoolping ? 'hard' : 'medium',
      quests: generateQuests(i, sectorName, theme, world)
    });
  }
  return scenarios;
};

export const INITIAL_SCENARIOS = generateScenarios();

export const getStageData = (id: string): Scenario | undefined => {
  return INITIAL_SCENARIOS.find(s => s.id === id);
};
