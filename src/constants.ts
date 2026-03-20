import { Scenario, Quest } from './types';

export const WORLDS = [
  { id: 'forest', name: '우정의 숲', color: 'bg-emerald-500', icon: 'Trees', desc: '대화 시작, 친구 사귀기, 협동 기술 (국어: 화법의 기초, 공감적 듣기)' },
  { id: 'sea', name: '공감의 바다', color: 'bg-blue-500', icon: 'Waves', desc: '가정 및 온라인 예절, 비언어적 신호 읽기 (국어: 언어 예절, 매체 언어 분석)' },
  { id: 'city', name: '자립의 도시', color: 'bg-amber-500', icon: 'Building2', desc: '기능적 생활 기술 및 사회 규칙 (국어: 실용적 텍스트 읽기, 정보 전달)' },
  { id: 'castle', name: '내면의 성', color: 'bg-purple-500', icon: 'Castle', desc: '갈등 해결, 거절하기, 자존감 회복 (국어: 설득하는 말하기, 비판적 사고)' },
] as const;

const SCENARIO_TITLES = [
  // 숲 (1~40)
  "관심사 나누기", "먼저 인사하기", "칭찬 건네기", "급식실 규칙 준수", "운동장에서 끼워달라고 말하기",
  "모둠 역할 정하기", "준비물 빌리기", "빌린 물건 돌려주기(사과)", "발표하는 친구 경청하기", "수업 시간 질문하기",
  "짝꿍과 자리 정돈하기", "청소 구역 나누기", "교과서 같이 보기", "선생님께 심부름 가기", "교무실 예절 지키기",
  "오해 풀기", "장난과 괴롭힘 구분하기", "내 의견 주장하기", "친구의 부탁 거절하기", "사과 수용하기",
  "별명 부르지 않기", "비밀 지켜주기", "소외된 친구 챙기기", "다수결 결과 승복하기", "경쟁 게임 후 매너 지키기",
  "동아리 홍보하기", "전학 온 친구 안내하기", "선생님께 질문하기", "복도에서 우측보행하기", "보건실 이용하기",
  "도서관 정숙하기", "급식 잔반 줄이기 약속", "학교 기물 아껴 쓰기", "방송 수업 집중하기", "교문 앞 교통안전",
  "학급 회의 참여", "건의함에 의견 넣기", "스승의 날 감사 전하기", "현장학습 팀 정하기", "졸업/종업식 인사",
  // 바다 (41~60)
  "부모님께 외출 허락 받기", "형제/남매와 간식 나누기", "집안일 돕기 제안", "밤늦게 조용히 하기", "부모님 고민 들어드리기",
  "친척 어른께 전화하기", "식사 예절 지키기", "택배 기사님께 인사", "반려동물 책임지기", "가족 회의 제안",
  "단톡방 첫인사", "단톡방 싸움 중재", "SNS 댓글 예절", "사이버 폭력 방지", "온라인 게임 매너",
  "정보 검색 및 출처 밝히기", "개인정보 보호하기", "메일/메시지 정중히 쓰기", "스마트폰 사용 시간 조절", "디지털 격차 도와주기",
  // 도시 (61~85)
  "편의점 물건 사고 계산", "유통기한 지난 물건 환불", "버스 노선 묻기", "지하철 길 찾기", "키오스크 주문하기",
  "도서관 회원증 만들기", "은행 번호표 뽑고 대기", "동사무소 서류 요청", "공원 쓰레기 줍기", "횡단보도 신호 지키기",
  "식당에서 주문 오류 수정", "병원 진료 예약하기", "약국에서 증상 설명", "엘리베이터 양보하기", "이웃에게 층간소음 사과",
  "분리수거 규칙 준수", "길 잃은 사람 도와주기", "공공장소 반려견 에티켓", "전시관 관람 예절", "영화관 좌석 찾기",
  "카페에서 조용히 대화", "마트 시식 코너 예절", "전통시장 흥정해보기", "분실물 센터 신고", "지역 축제 참여하기",
  // 성 (86~105)
  "부당한 요구 단호히 거절", "실패 후 스스로 위로하기", "질투심 다스리기", "불안한 마음 표현하기", "화가 날 때 멈추기",
  "자존감 높이는 혼잣말", "나의 장점 5가지 쓰기", "미래의 나에게 편지 쓰기", "스트레스 해소법 나누기", "진로 고민 털어놓기",
  "다양성 존중하기", "소수 의견 경청하기", "비판적인 의견 정중히 말하기", "공동체 목표 설정", "용서하고 화해하기",
  "봉사활동 신청하기", "타인의 슬픔 공감하기", "정의로운 행동 용기 내기", "평화로운 사회 만들기 캠페인", "최종 유능감 인증(마스터)"
];

interface StageData {
  stage: number;
  world: 'forest' | 'sea' | 'city' | 'castle';
  title: string;
  situation: string;
  quests: Omit<Quest, 'id'>[];
}

const STAGE_DATA: StageData[] = [
  {
    stage: 1,
    world: 'forest',
    title: '관심사 나누기',
    situation: '교실 창가에서 친구가 내가 좋아하는 판타지 소설을 읽고 있습니다. 친구는 책에 깊이 집중하고 있지만, 당신은 공통 관심사를 나누고 싶어 다가갑니다. 상대방의 독서를 방해하지 않으면서도 자연스럽게 말을 건네야 하는 상황입니다. 어떻게 다가가는 것이 가장 좋을까요?',
    quests: [
      {
        type: 'multiple-choice',
        question: '현재 친구가 책에 집중하고 있음을 알 수 있는 비언어적 신호는?',
        options: ['고개를 숙이고 시선이 책에 고정됨', '창밖을 멍하니 바라봄', '주변을 두리번거림'],
        correctAnswer: '고개를 숙이고 시선이 책에 고정됨',
        explanation: '의사소통은 목적 달성뿐 아니라 사회적 욕구 충족의 기능을 합니다. 상대의 비언어적 신호(93%의 중요도)를 읽고 정서적 진실성을 담아 소통하세요.'
      },
      {
        type: 'multiple-choice',
        question: '대화를 시작하기 전 가장 먼저 고려해야 할 사항은?',
        options: ['상대방이 대화할 준비가 되었는지 확인하기', '내가 하고 싶은 말부터 꺼내기', '무작정 책을 빼앗기'],
        correctAnswer: '상대방이 대화할 준비가 되었는지 확인하기',
        explanation: '의사소통은 목적 달성뿐 아니라 사회적 욕구 충족의 기능을 합니다. 상대의 비언어적 신호(93%의 중요도)를 읽고 정서적 진실성을 담아 소통하세요.'
      },
      {
        type: 'short-answer',
        question: '상대방의 기분을 존중하며 말을 거는 기술의 명칭은?',
        correctAnswer: '정중한 요청',
        explanation: '의사소통은 목적 달성뿐 아니라 사회적 욕구 충족의 기능을 합니다. 상대의 비언어적 신호(93%의 중요도)를 읽고 정서적 진실성을 담아 소통하세요.'
      },
      {
        type: 'long-answer',
        question: '친구에게 건넬 첫 마디를 적어보세요.',
        correctAnswer: '안녕! 실례가 안 된다면 그 책 무슨 내용인지 물어봐도 될까? 나도 그 시리즈 정말 좋아하거든.',
        explanation: '의사소통은 목적 달성뿐 아니라 사회적 욕구 충족의 기능을 합니다. 상대의 비언어적 신호(93%의 중요도)를 읽고 정서적 진실성을 담아 소통하세요.',
        keywords: ['안녕', '실례가 안 된다면', '무슨 내용', '좋아하거든']
      },
      {
        type: 'multiple-choice',
        question: '만약 친구가 단답형으로 대답하고 다시 책을 본다면 적절한 대처는?',
        options: ['"나중에 다 읽으면 이야기하자!"라고 말하며 물러나기', '계속해서 질문하며 귀찮게 하기', '화를 내며 자리로 돌아가기'],
        correctAnswer: '"나중에 다 읽으면 이야기하자!"라고 말하며 물러나기',
        explanation: '의사소통은 목적 달성뿐 아니라 사회적 욕구 충족의 기능을 합니다. 상대의 비언어적 신호(93%의 중요도)를 읽고 정서적 진실성을 담아 소통하세요.'
      }
    ]
  },
  {
    stage: 4,
    world: 'forest',
    title: '급식실 규칙 준수',
    situation: '배가 고픈 급식 시간, 맛있는 냄새를 따라 급식실에 도착했습니다. 그런데 친한 친구가 장난을 치며 슬쩍 당신의 앞에 끼어들려고 합니다. 뒤에 서 있는 다른 학생들은 불쾌한 표정으로 여러분을 바라보고 있습니다. 친구와의 우정도 소중하지만, 공동체의 규칙을 지키는 것도 중요한 순간입니다. 당신은 이 상황에서 친구의 기분을 상하지 않게 하면서도 규칙을 지키자고 어떻게 말해야 할까요?',
    quests: [
      {
        type: 'multiple-choice',
        question: '현재 상황에서 가장 먼저 고려해야 할 사회적 규칙은?',
        options: ['새치기 하지 않고 줄 서기', '친구와 재미있게 장난치기', '맛있는 반찬 먼저 받기'],
        correctAnswer: '새치기 하지 않고 줄 서기',
        explanation: '공동체 생활에서는 개인의 욕구나 친분보다 모두가 합의한 규칙(줄 서기)을 우선적으로 지키는 것이 중요합니다.'
      },
      {
        type: 'multiple-choice',
        question: '뒤에 서 있는 학생들의 비언어적 신호(표정)는 무엇을 의미하나요?',
        options: ['새치기에 대한 불만과 항의', '배가 고파서 지친 표정', '우리와 친해지고 싶어하는 표정'],
        correctAnswer: '새치기에 대한 불만과 항의',
        explanation: '불쾌한 표정은 규칙 위반에 대한 무언의 항의입니다. 주변의 비언어적 신호를 빠르게 캐치하는 것이 공감의 첫걸음입니다.'
      },
      {
        type: 'short-answer',
        question: '내 감정과 상황을 객관적으로 전달하여 갈등을 줄이는 화법은?',
        correctAnswer: '나-전달법',
        explanation: '상대를 비난하지 않고 "네가 ~하면, 나는 ~게 느껴져"라고 말하는 나-전달법은 친구의 기분을 상하지 않게 거절할 때 유용합니다.'
      },
      {
        type: 'long-answer',
        question: '친구에게 \'나-전달법\'을 사용하여 규칙 준수를 제안하는 문장을 쓰세요.',
        correctAnswer: '네가 앞에 끼어들면 뒤에 있는 친구들이 불쾌해할 것 같아. 우리 뒤로 가서 같이 줄 서자.',
        explanation: '상황(끼어들기)과 영향(다른 친구들의 불쾌함), 그리고 대안(뒤로 가서 줄 서기)을 명확하고 부드럽게 제시했습니다.',
        keywords: ['뒤로', '줄 서자', '불쾌해할']
      },
      {
        type: 'multiple-choice',
        question: '규칙을 지켰을 때 얻을 수 있는 가장 큰 장점은?',
        options: ['모두가 공평하고 기분 좋게 식사할 수 있음', '밥을 더 빨리 먹을 수 있음', '친구에게 칭찬받을 수 있음'],
        correctAnswer: '모두가 공평하고 기분 좋게 식사할 수 있음',
        explanation: '규칙은 공동체 구성원 모두의 권리를 보호하고 평화로운 환경을 유지하기 위해 존재합니다.'
      }
    ]
  }
];

// Generate the remaining stages (1 to 105)
for (let i = 1; i <= 105; i++) {
  // Skip manually defined stages
  if (i === 1 || i === 4) continue;

  let world: 'forest' | 'sea' | 'city' | 'castle' = 'forest';
  if (i > 40 && i <= 60) world = 'sea';
  else if (i > 60 && i <= 85) world = 'city';
  else if (i > 85) world = 'castle';

  const title = SCENARIO_TITLES[i - 1] || `스테이지 ${i}`;
  
  const places = {
    forest: '학교의 어느 활기찬 공간',
    sea: '가정이나 온라인의 일상적인 공간',
    city: '지역사회의 공공장소',
    castle: '내면의 감정을 마주하는 조용한 공간'
  };

  STAGE_DATA.push({
    stage: i,
    world,
    title: title,
    situation: `당신은 지금 ${places[world]}에 있습니다. 이번 목표는 '${title}'입니다. 주변에는 당신과 상호작용할 사람들이 있으며, 각자의 감정과 입장이 다릅니다. 이 상황에서 당신은 올바른 의사소통 방식을 선택하여 갈등을 예방하고 긍정적인 관계를 형성해야 합니다. 상대방의 기분을 존중하면서도 당신의 목적을 달성할 수 있는 최선의 방법을 고민해 보세요. 당신의 선택이 앞으로의 관계에 중요한 영향을 미칠 것입니다.`,
    quests: [
      {
        type: 'multiple-choice',
        question: `'${title}' 상황에서 가장 먼저 고려해야 할 핵심 요소는 무엇인가요?`,
        options: ['상대방의 감정과 상황 존중하기', '내 목적만 빠르게 달성하기', '상황을 피하고 무시하기'],
        correctAnswer: '상대방의 감정과 상황 존중하기',
        explanation: '모든 의사소통의 기본은 상대방에 대한 존중과 공감입니다.'
      },
      {
        type: 'multiple-choice',
        question: `이 상황에서 관찰할 수 있는 중요한 비언어적 신호는 무엇일까요?`,
        options: ['상대방의 표정과 시선, 자세', '주변의 날씨와 온도', '내가 입고 있는 옷차림'],
        correctAnswer: '상대방의 표정과 시선, 자세',
        explanation: '비언어적 신호는 상대방의 진짜 감정을 파악하는 데 매우 중요합니다.'
      },
      {
        type: 'short-answer',
        question: `갈등을 줄이고 내 마음을 잘 전달하기 위해 사용하는 화법(ㅇ-ㅈㄷㅂ)은 무엇인가요?`,
        correctAnswer: '나-전달법',
        explanation: '나-전달법(I-message)은 상대를 비난하지 않고 내 감정과 상황을 객관적으로 전달하는 훌륭한 대화 기술입니다.'
      },
      {
        type: 'long-answer',
        question: `'${title}' 상황을 해결하기 위해 상대방에게 건넬 첫 마디를 작성해 보세요.`,
        correctAnswer: '상황에 맞는 부드럽고 명확한 요청이나 공감의 말',
        explanation: '정중하고 솔직한 첫 마디는 긍정적인 대화의 문을 엽니다.',
        keywords: ['안녕', '미안', '고마워', '부탁', '생각']
      },
      {
        type: 'multiple-choice',
        question: `이 상황을 성공적으로 마무리했을 때 얻을 수 있는 긍정적인 결과는?`,
        options: ['서로에 대한 신뢰와 유대감 형성', '나 혼자만의 일시적인 만족', '상대방과의 관계 단절'],
        correctAnswer: '서로에 대한 신뢰와 유대감 형성',
        explanation: '올바른 소통은 장기적으로 건강하고 신뢰받는 관계를 만듭니다.'
      }
    ]
  });
}

// Sort STAGE_DATA by stage number
STAGE_DATA.sort((a, b) => a.stage - b.stage);

const generateScenarios = (): Scenario[] => {
  return STAGE_DATA.map(data => {
    const isSchoolping = data.stage % 10 === 0;
    
    // Use thematic seeds based on the world
    const seedPrefix = {
      forest: 'school',
      sea: 'home',
      city: 'city',
      castle: 'mind'
    }[data.world];
    
    const imageUrl = `https://picsum.photos/seed/${seedPrefix}${data.stage}/800/600`;

    return {
      id: `stage-${data.stage}`,
      world: data.world,
      stage: data.stage,
      isBoss: isSchoolping,
      isSchoolping: isSchoolping,
      title: data.title,
      situation: data.situation,
      mediaUrl: imageUrl,
      difficulty: isSchoolping ? 'hard' : 'medium',
      quests: data.quests.map((q, idx) => ({
        ...q,
        id: `s${data.stage}-q${idx + 1}`
      }))
    };
  });
};

export const INITIAL_SCENARIOS = generateScenarios();

export const getStageData = (id: string): Scenario | undefined => {
  return INITIAL_SCENARIOS.find(s => s.id === id);
};
