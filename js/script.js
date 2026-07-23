const pages = {
  home: document.querySelector('#home-page'),
  intro: document.querySelector('#intro-page'),
  quiz: document.querySelector('#quiz-page'),
  iris: document.querySelector("#iris-page"),
  result: document.querySelector('#result-page'),
};

const introContents = {
  main: {
    badge: 'LPTI',
    eyebrow: 'Lens Personality Type Indicator',
    title: 'LPTI',
    description:
      '네 가지 취향 축과 AI 이미지 분석을 통해 나만의 렌즈 성향을 찾습니다.',
    visual:  'assets/analysis-panel.png',
    subtitle: 'LPTI는 무엇인가요?',
    body:
      'Warm/Cool, Everyday/Unique, Puppy/Kitty, Large/Medium의<br>네 가지 축을 조합해 렌즈 취향 유형을 분석합니다.',
    keywords: [
      'Warm / Cool',
      'Everyday / Unique',
      'Puppy / Kitty',
      'Large / Medium',
    ],
  },

  wc: {
    badge: 'W / C',
    eyebrow: 'Color Temperature',
    title: 'Warm or Cool',
    description:
      '나에게 조화롭게 어울리는 렌즈 컬러 온도를 알아보는 축입니다.',
    visual: 'assets/card-wc.png',
    subtitle: '따뜻한 컬러와 차가운 컬러',
    body:
      'Warm은 브라운, 코랄, 베이지처럼 부드럽고 따뜻한 색감을 의미합니다.<br>Cool은 그레이, 블루, 라벤더처럼 맑고 차분한 색감을 의미합니다.',
    keywords: [
      'Warm Brown',
      'Coral Beige',
      'Cool Gray',
      'Lavender Blue',
    ],
  },

  eu: {
    badge: 'E / U',
    eyebrow: 'Lens Styling',
    title: 'Everyday or Unique',
    description:
      '자연스러운 데일리 렌즈와 개성 있는 포인트 렌즈 중 선호도를 분석합니다.',
    visual: 'assets/card-eu.png',
    subtitle: '매일 편안하게, 또는 특별하게',
    body:
      'Everyday는 일상에서 부담 없이 사용할 수 있는 자연스러운 스타일입니다.<br>Unique는 사진, 여행, 공연처럼 특별한 순간에 분위기를 강조하는 스타일입니다.',
    keywords: [
      'Natural',
      'Daily',
      'Point Color',
      'Statement',
    ],
  },

  pk: {
    badge: 'P / K',
    eyebrow: 'Eye Impression',
    title: 'Puppy or Kitty',
    description:
      '렌즈를 착용했을 때 원하는 눈매와 전체적인 인상 방향을 찾습니다.',
    visual: 'assets/card-pk.png',
    subtitle: '부드러운 눈빛과 또렷한 눈빛',
    body:
      'Puppy는 맑고 순하며 친근한 인상을 강조합니다.<br>Kitty는 또렷하고 세련되며 분위기 있는 인상을 강조합니다.',
    keywords: [
      'Soft',
      'Friendly',
      'Sharp',
      'Chic',
    ],
  },

  lm: {
    badge: 'L / M',
    eyebrow: 'Graphic Diameter',
    title: 'Large or Medium',
    description:
      '원하는 눈동자 확대감과 렌즈 그래픽 크기를 분석하는 축입니다.',
    visual: 'assets/card-lm.png',
    subtitle: '또렷한 확대감과 자연스러운 균형',
    body:
      'Large는 눈동자를 더욱 크고 선명하게 표현하는 스타일입니다.<br>Medium은 본래 눈동자와 자연스럽게 어우러지는 균형 잡힌 스타일입니다.',
    keywords: [
      'Defined',
      'Enlarging',
      'Natural',
      'Balanced',
    ],
  },
};

const navLinks = document.querySelectorAll('.nav-link[data-page]');
const pageButtons = document.querySelectorAll('[data-page]');
const toast = document.querySelector('#toast');
const introNavLink = document.querySelector('.nav-link[data-intro="main"]');

const questions = [
  /* A. W / C : Warm vs Cool */

  {
    id: 'q1',
    axis: 'wc',
    title: '평소 본인에게 더 잘 어울린다고 느끼는 색은 무엇인가요?',
    description: '옷, 메이크업, 액세서리 색을 떠올리며 골라주세요.',
    options: [
      {
        value: 'warm_color',
        icon: '☀️',
        title: '베이지, 브라운, 코랄, 골드 계열',
        text: '따뜻하고 부드러운 색감이 잘 어울리는 편',
        score: { W: 1 },
      },
      {
        value: 'cool_color',
        icon: '❄️',
        title: '화이트, 그레이, 핑크, 실버 계열',
        text: '맑고 차분한 색감이 잘 어울리는 편',
        score: { C: 1 },
      },
      {
        value: 'unknown_color',
        icon: '？',
        title: '잘 모르겠음',
        text: '이 경우 사진 분석 결과를 우선 반영할 수 있어요.',
        score: {},
      },
    ],
  },

  {
    id: 'q2',
    axis: 'wc',
    title: '평소 사용하는 립/블러셔 색상은 어느 쪽에 가까운가요?',
    description: '메이크업을 거의 하지 않는다면 잘 모르겠음을 선택해도 괜찮아요.',
    options: [
      {
        value: 'warm_makeup',
        icon: '🍑',
        title: '코랄, 오렌지, 피치, 브릭',
        text: '따뜻하고 생기 있는 메이크업 색상',
        score: { W: 1 },
      },
      {
        value: 'cool_makeup',
        icon: '🌷',
        title: '핑크, 로즈, 모브, 베리',
        text: '맑거나 차분한 메이크업 색상',
        score: { C: 1 },
      },
      {
        value: 'no_makeup',
        icon: '○',
        title: '메이크업을 거의 하지 않음 / 잘 모르겠음',
        text: '이 경우 사진 분석 결과를 우선 반영할 수 있어요.',
        score: {},
      },
    ],
  },

  /* B. E / U : Everyday vs Unique */
  {
    id: 'q3',
    axis: 'wc',
    title: '액세서리는 어느 쪽이 더 잘 어울린다고 느끼나요?',
    description: '평소 착용했을 때 얼굴이 더 살아 보이는 쪽을 골라주세요.',
    options: [
      {
        value: 'gold',
        icon: '🥇',
        title: '골드',
        text: '따뜻한 금빛 액세서리가 잘 어울리는 편',
        score: { W: 1 },
      },
      {
        value: 'silver',
        icon: '🥈',
        title: '실버',
        text: '차갑고 맑은 은빛 액세서리가 잘 어울리는 편',
        score: { C: 1 },
      },
      {
        value: 'both_accessory',
        icon: '◐',
        title: '둘 다 비슷함 / 잘 모르겠음',
        text: '이 문항은 보정 문항으로만 사용해요.',
        score: {},
      },
    ],
  },

  /* C. P / K : Puppy vs Kitty */
  {
    id: 'q4',
    axis: 'wc',
    title: '본인의 퍼스널컬러를 알고 있나요?',
    description: '알고 있다면 가장 가까운 타입을 골라주세요.',
    options: [
      {
        value: 'spring_warm',
        icon: '🌼',
        title: '봄 웜',
        text: '밝고 따뜻한 색감이 잘 어울리는 타입',
        score: { W: 2 },
      },
      {
        value: 'autumn_warm',
        icon: '🍂',
        title: '가을 웜',
        text: '깊고 따뜻한 색감이 잘 어울리는 타입',
        score: { W: 2 },
      },
      {
        value: 'summer_cool',
        icon: '🫧',
        title: '여름 쿨',
        text: '맑고 부드러운 쿨톤 색감이 잘 어울리는 타입',
        score: { C: 2 },
      },
      {
        value: 'winter_cool',
        icon: '🧊',
        title: '겨울 쿨',
        text: '선명하고 차가운 쿨톤 색감이 잘 어울리는 타입',
        score: { C: 2 },
      },
      {
        value: 'unknown_personal_color',
        icon: '？',
        title: '모름',
        text: '사진 분석 결과를 우선 반영할 수 있어요.',
        score: {},
      },
    ],
  },

  /* D. L / M : Large vs Medium */
  {
    id: 'q5',
    axis: 'eu',
    title: '컬러렌즈를 주로 착용하려는 목적은 무엇인가요?',
    description: '가장 자주 사용할 상황을 기준으로 골라주세요.',
    options: [
      {
        value: 'daily_school_work',
        icon: '🏫',
        title: '출근 / 등교 / 일상용',
        text: '매일 부담 없이 착용하고 싶어요.',
        score: { E: 2 },
      },
      {
        value: 'natural_clear',
        icon: '🫧',
        title: '자연스럽게 눈만 또렷해지는 용도',
        text: '렌즈 티는 적고 눈매만 또렷했으면 해요.',
        score: { E: 2 },
      },
      {
        value: 'selfie_photo',
        icon: '📸',
        title: '사진 / 셀카 촬영용',
        text: '사진에서 발색과 분위기가 잘 보였으면 해요.',
        score: { U: 2 },
      },
      {
        value: 'event_travel',
        icon: '✨',
        title: '여행 / 공연 / 행사용',
        text: '특별한 날 포인트를 주고 싶어요.',
        score: { U: 2 },
      },
      {
        value: 'mood_change',
        icon: '🌙',
        title: '분위기 변화를 주는 용도',
        text: '평소와 다른 이미지를 연출하고 싶어요.',
        score: { U: 2 },
      },
    ],
  },
  {
    id: 'q6',
    axis: 'eu',
    title: '원하는 렌즈 이미지는 어느 쪽에 가까운가요?',
    description: '착용했을 때 가장 원하는 느낌을 골라주세요.',
    options: [
      {
        value: 'not_obvious',
        icon: '🌿',
        title: '티 나지 않고 자연스러운 느낌',
        text: '렌즈를 낀 듯 안 낀 듯 편안한 느낌',
        score: { E: 1 },
      },
      {
        value: 'close_natural',
        icon: '🤍',
        title: '가까이 봐야 렌즈 낀 걸 알 수 있는 느낌',
        text: '은은하지만 눈은 또렷해지는 느낌',
        score: { E: 1 },
      },
      {
        value: 'photo_color',
        icon: '📷',
        title: '사진에서 발색이 잘 보이는 느낌',
        text: '사진에 렌즈 컬러가 또렷하게 나왔으면 해요.',
        score: { U: 1 },
      },
      {
        value: 'different_mood',
        icon: '💫',
        title: '평소와 다른 분위기로 바뀌는 느낌',
        text: '눈빛 자체가 달라 보였으면 해요.',
        score: { U: 1 },
      },
    ],
  },
  {
    id: 'q7',
    axis: 'eu',
    title: '컬러렌즈를 착용할 예상 빈도는 어느 정도인가요?',
    description: '앞으로 사용할 상황을 상상해서 골라주세요.',
    options: [
      {
        value: 'almost_everyday',
        icon: '📅',
        title: '거의 매일',
        text: '데일리 렌즈처럼 자주 착용할 예정이에요.',
        score: { E: 1 },
      },
      {
        value: 'two_three_week',
        icon: '🗓️',
        title: '주 2~3회',
        text: '일상에서도 꽤 자주 착용할 것 같아요.',
        score: { E: 1 },
      },
      {
        value: 'special_day',
        icon: '🎀',
        title: '특별한 날만',
        text: '약속이나 특별한 일정에만 착용할 것 같아요.',
        score: { U: 1 },
      },
      {
        value: 'shooting_travel',
        icon: '✈️',
        title: '촬영이나 여행 때만',
        text: '포인트가 필요한 순간에 착용하고 싶어요.',
        score: { U: 1 },
      },
    ],
  },
  {
    id: 'q8',
    axis: 'eu',
    title: '렌즈를 골랐을 때 더 피하고 싶은 상황은 무엇인가요?',
    description: '렌즈 구매 실패 상황을 기준으로 골라주세요.',
    options: [
      {
        value: 'too_flashy',
        icon: '😵‍💫',
        title: '너무 튀어서 부담스러운 것',
        text: '과한 발색이나 존재감은 피하고 싶어요.',
        score: { E: 1 },
      },
      {
        value: 'too_obvious',
        icon: '👀',
        title: '렌즈 낀 티가 많이 나는 것',
        text: '렌즈가 너무 도드라지는 건 부담스러워요.',
        score: { E: 1 },
      },
      {
        value: 'not_visible_photo',
        icon: '📸',
        title: '사진에서 티가 하나도 안 나는 것',
        text: '사진에서는 렌즈 느낌이 어느 정도 보였으면 해요.',
        score: { U: 1 },
      },
      {
        value: 'no_difference',
        icon: '🫥',
        title: '평소와 차이가 거의 없는 것',
        text: '착용 전후 차이가 너무 없으면 아쉬워요.',
        score: { U: 1 },
      },
    ],
  },

  /* C. P / K : Puppy vs Kitty */
  {
    id: 'q9',
    axis: 'pk',
    title: '평소 본인의 이미지에 더 가깝다고 느끼는 쪽은 무엇인가요?',
    description: '주변에서 듣는 인상이나 스스로 느끼는 분위기를 기준으로 골라주세요.',
    options: [
      {
        value: 'soft_image',
        icon: '🐶',
        title: '부드럽다, 순하다, 편안하다',
        text: '친근하고 순한 분위기에 가까워요.',
        score: { P: 1 },
      },
      {
        value: 'sharp_image',
        icon: '🐱',
        title: '또렷하다, 세련됐다, 시크하다',
        text: '선명하고 분위기 있는 인상에 가까워요.',
        score: { K: 1 },
      },
      {
        value: 'unknown_image',
        icon: '？',
        title: '잘 모르겠음',
        text: '사진 분석 결과를 우선 반영할 수 있어요.',
        score: {},
      },
    ],
  },
  {
    id: 'q10',
    axis: 'pk',
    title: '원하는 렌즈 착용 이미지는 어느 쪽에 가까운가요?',
    description: '렌즈를 꼈을 때 연출하고 싶은 인상을 골라주세요.',
    options: [
      {
        value: 'clear_cute',
        icon: '🫧',
        title: '맑고 귀여운 느낌',
        text: '눈빛이 맑고 사랑스러워 보였으면 해요.',
        score: { P: 1 },
      },
      {
        value: 'soft_gentle',
        icon: '🤎',
        title: '순하고 부드러운 느낌',
        text: '부담 없이 편안한 인상을 원해요.',
        score: { P: 1 },
      },
      {
        value: 'clear_sharp',
        icon: '✨',
        title: '또렷하고 선명한 느낌',
        text: '눈매가 더 뚜렷해 보였으면 해요.',
        score: { K: 1 },
      },
      {
        value: 'calm_mood',
        icon: '🌙',
        title: '차분하고 분위기 있는 느낌',
        text: '시크하고 세련된 이미지를 원해요.',
        score: { K: 1 },
      },
    ],
  },
  {
    id: 'q11',
    axis: 'pk',
    title: '평소 선호하는 메이크업 분위기는 무엇인가요?',
    description: '자주 하거나 좋아하는 메이크업 분위기를 골라주세요.',
    options: [
      {
        value: 'natural_makeup',
        icon: '🌿',
        title: '내추럴',
        text: '자연스럽고 편안한 분위기를 좋아해요.',
        score: { P: 1 },
      },
      {
        value: 'pure_makeup',
        icon: '🫧',
        title: '청순',
        text: '맑고 부드러운 분위기를 좋아해요.',
        score: { P: 1 },
      },
      {
        value: 'idol_makeup',
        icon: '🎤',
        title: '아이돌 / 화려한 메이크업',
        text: '눈에 띄고 선명한 스타일을 좋아해요.',
        score: { K: 1 },
      },
      {
        value: 'hip_makeup',
        icon: '🖤',
        title: '힙한 스타일',
        text: '개성 있고 스타일리시한 분위기를 좋아해요.',
        score: { K: 1 },
      },
      {
        value: 'chic_shadow',
        icon: '🌫️',
        title: '시크한 음영 메이크업',
        text: '차분하고 선명한 분위기를 좋아해요.',
        score: { K: 1 },
      },
    ],
  },
  {
    id: 'q12',
    axis: 'pk',
    title: '눈매 형태는 어느 쪽에 더 가깝나요?',
    description: '잘 모르겠다면 잘 모르겠음을 선택해도 괜찮아요.',
    options: [
      {
        value: 'round_eye',
        icon: '○',
        title: '둥근 눈매',
        text: '눈매가 둥글고 부드러운 편이에요.',
        score: { P: 1 },
      },
      {
        value: 'down_eye',
        icon: '⌄',
        title: '살짝 처진 눈매',
        text: '눈꼬리가 살짝 내려가 순한 편이에요.',
        score: { P: 1 },
      },
      {
        value: 'long_eye',
        icon: '─',
        title: '긴 눈매',
        text: '가로로 길고 또렷한 편이에요.',
        score: { K: 1 },
      },
      {
        value: 'up_eye',
        icon: '⌃',
        title: '살짝 올라간 눈매',
        text: '눈꼬리가 살짝 올라가 선명한 편이에요.',
        score: { K: 1 },
      },
      {
        value: 'unknown_eye_shape',
        icon: '？',
        title: '잘 모르겠음',
        text: '사진 분석 결과를 우선 반영할 수 있어요.',
        score: {},
      },
    ],
  },

  /* D. L / M : Large vs Medium */
  {
    id: 'q13',
    axis: 'lm',
    title: '선호하는 렌즈 직경은 무엇인가요?',
    description: '눈동자가 얼마나 또렷하거나 커 보였으면 하는지 골라주세요.',
    options: [
      {
        value: 'large_diameter',
        icon: '◉',
        title: '눈이 커 보이는 큰 직경',
        text: '확실한 확대감과 또렷함을 원해요.',
        score: { L: 2 },
      },
      {
        value: 'balanced_diameter',
        icon: '◐',
        title: '자연스럽지만 살짝 또렷한 직경',
        text: '자연스러움과 확대감을 둘 다 원해요.',
        score: { L: 1, M: 1 },
      },
      {
        value: 'natural_diameter',
        icon: '○',
        title: '내 눈동자와 비슷한 자연 직경',
        text: '과하지 않고 안정적인 직경을 원해요.',
        score: { M: 2 },
      },
      {
        value: 'unknown_diameter',
        icon: '？',
        title: '잘 모르겠음',
        text: '사진 분석과 훌라 경험을 함께 반영할 수 있어요.',
        score: {},
      },
    ],
  },
  {
    id: 'q14',
    axis: 'lm',
    title: '렌즈 착용 중 훌라 현상을 경험한 적이 있나요?',
    description: '렌즈가 눈에서 따로 움직이거나 밀리는 느낌이 있었는지 골라주세요.',
    options: [
      {
        value: 'no_hula',
        icon: '👌',
        title: '없음',
        text: '렌즈가 비교적 안정적으로 맞았어요.',
        score: { L: 1 },
      },
      {
        value: 'sometimes_hula',
        icon: '💧',
        title: '가끔 있음',
        text: '가끔 렌즈가 밀리거나 따로 노는 느낌이 있었어요.',
        score: { M: 2 },
      },
      {
        value: 'often_hula',
        icon: '⚠️',
        title: '자주 있음',
        text: '착용 안정성이 중요한 편이에요.',
        score: { M: 2 },
      },
      {
        value: 'specific_hula',
        icon: '🔍',
        title: '특정 제품에서만 있음',
        text: '제품에 따라 착용 안정성이 달랐어요.',
        score: { M: 2 },
      },
      {
        value: 'unknown_hula',
        icon: '？',
        title: '잘 모르겠음',
        text: '이 문항은 보정 없이 넘어가요.',
        score: {},
      },
    ],
  },
  {
    id: 'q15',
    axis: 'comfort',
    title: '렌즈를 선택할 때 가장 중요하게 생각하는 요소는 무엇인가요?',
    description: '가장 우선순위가 높은 요소를 골라주세요.',
    options: [
      {
        value: 'long_wear_comfort',
        icon: '☁️',
        title: '오래 착용해도 편안한 착용감',
        text: '장시간 착용해도 눈의 피로와 불편함이 적은 것이 중요해요.',
        score: {},
      },
      {
        value: 'lasting_moisture',
        icon: '💧',
        title: '촉촉함이 오래 유지되는 정도',
        text: '착용 시간이 길어져도 건조함이 적은 것이 중요해요.',
        score: {},
      },
      {
        value: 'low_eye_burden',
        icon: '🫧',
        title: '눈에 부담이 적은 소재',
        text: '눈에 자극이 적고 편안한 소재를 선호해요.',
        score: {},
      },
      {
        value: 'thin_soft_lens',
        icon: '🪽',
        title: '렌즈가 얇고 부드러운 정도',
        text: '렌즈가 가볍고 부드럽게 느껴지는 것이 중요해요.',
        score: {},
      },
      {
        value: 'stable_lens_fit',
        icon: '◎',
        title: '착용 중 렌즈가 안정적으로 유지되는 정도',
        text: '렌즈가 밀리거나 돌아가지 않고 안정적으로 맞는 것이 중요해요.',
        score: {},
      },
    ],
  },

  {
    id: 'q16',
    axis: 'comfort',
    title: '렌즈 착용 시 가장 자주 느끼는 불편함은 무엇인가요?',
    description: '평소 착용 경험에서 가장 가까운 항목을 골라주세요.',
    options: [
      {
        value: 'difficult_long_wear',
        icon: '⏳',
        title: '장시간 착용이 어려움',
        text: '착용 시간이 길어질수록 눈이 쉽게 피로하거나 불편해져요.',
        score: {},
      },
      {
        value: 'dry_stiff_eyes',
        icon: '💧',
        title: '눈이 건조하고 뻑뻑함',
        text: '렌즈 착용 중 촉촉함이 부족하고 눈이 마르는 느낌이 들어요.',
        score: {},
      },
      {
        value: 'foreign_body_sensation',
        icon: '👁️',
        title: '렌즈가 느껴지는 이물감',
        text: '눈을 깜빡일 때 렌즈가 걸리거나 느껴져요.',
        score: {},
      },
      {
        value: 'initial_wear_discomfort',
        icon: '😣',
        title: '처음 착용할 때 불편함',
        text: '렌즈를 착용한 직후 적응하기 어렵거나 자극이 느껴져요.',
        score: {},
      },
      {
        value: 'lens_shifting_rotating',
        icon: '↔️',
        title: '렌즈가 밀리거나 돌아가는 느낌',
        text: '착용 중 렌즈 위치가 움직여 시야나 착용감이 불안정해요.',
        score: {},
      },
    ],
  },
];


let currentQuestion = 0;
const answers = {};

function showPage(name) {
  Object.values(pages).forEach((page) => {
    page.classList.remove('active-page');
  });

  pages[name]?.classList.add('active-page');

  const activeNavPage =
  name === "iris"
    ? "quiz"
    : name;

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.dataset.page === activeNavPage
    );
  });

  introNavLink?.classList.toggle('active', name === 'intro');

  if (name === 'quiz') renderQuestion();
  if (name === 'result') updateResult();

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  history.replaceState(null, '', `#${name}`);
}

window.showPage = showPage;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderQuestion() {
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  document.querySelector('#progress-label').textContent =
  `${String(currentQuestion + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
  document.querySelector('#progress-percent').textContent = `${Math.round(progress)}%`;
  document.querySelector('#progress-bar').style.width = `${progress}%`;
  document.querySelector('.question-kicker').textContent = `QUESTION ${String(currentQuestion + 1).padStart(2, '0')}`;
  document.querySelector('#question-title').textContent = question.title;
  document.querySelector('#question-description').textContent = question.description;

  const answerGrid = document.querySelector('#answer-grid');
  answerGrid.innerHTML = question.options.map((option) => `
    <button class="answer-card ${answers[question.id] === option.value ? 'selected' : ''}" type="button" data-value="${option.value}">
      <span>${option.icon}</span>
      <strong>${option.title}</strong>
      <small>${option.text}</small>
    </button>
  `).join('');

  answerGrid.querySelectorAll('.answer-card').forEach((card) => {
    card.addEventListener('click', () => {
      answers[question.id] = card.dataset.value;
      renderQuestion();
    });
  });

  const prevButton = document.querySelector('#prev-question');
  const nextButton = document.querySelector('#next-question');
  prevButton.disabled = currentQuestion === 0;
  nextButton.disabled = !answers[question.id];
  nextButton.textContent =
  currentQuestion === questions.length - 1
  ? '다음 단계'
  : '다음';
}

function calculateScores() {
  const scores = {
    W: 0,
    C: 0,
    E: 0,
    U: 0,
    P: 0,
    K: 0,
    L: 0,
    M: 0,
  };

  questions.forEach((question) => {
    const selectedValue = answers[question.id];
    const selectedOption = question.options.find((option) => option.value === selectedValue);

    if (!selectedOption || !selectedOption.score) return;

    Object.entries(selectedOption.score).forEach(([type, point]) => {
      scores[type] += point;
    });
  });

  return scores;
}

function pickType(scores, leftType, rightType, defaultType) {
  if (scores[leftType] > scores[rightType]) return leftType;
  if (scores[rightType] > scores[leftType]) return rightType;
  return defaultType;
}

function getTypeCode() {
  const answeredCount = Object.keys(answers).length;

  if (answeredCount === 0) {
    return "WEPL";
  }

  const scores = calculateScores();

  const wc = pickType(scores, "W", "C", "W");
  const eu = pickType(scores, "E", "U", "E");
  const pk = pickType(scores, "P", "K", "P");
  const lm = pickType(scores, "L", "M", "M");

  return `${wc}${eu}${pk}${lm}`;
}

pageButtons.forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.page));
});

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    showPage('home');
    setTimeout(() => document.querySelector(`#${button.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth' }), 150);
  });
});

document.querySelector('#prev-question')?.addEventListener('click', () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  }
});

document.querySelector('#next-question')?.addEventListener('click', () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
  } else {
    showPage('iris');
  }
});

document.querySelector('#restart-test')?.addEventListener('click', () => {
  Object.keys(answers).forEach((key) => delete answers[key]);
  currentQuestion = 0;
  showPage('quiz');
});

document.querySelector('.save-button')?.addEventListener('click', () => showToast('QR 결과 저장 기능을 연결할 자리예요.'));
document.querySelectorAll('.try-button').forEach((button) => button.addEventListener('click', () => showToast('가상 착용 카메라 기능을 연결할 자리예요.')));
document.querySelectorAll('.detail-button').forEach((button) => button.addEventListener('click', () => showToast('제품 상세 페이지를 연결할 자리예요.')));

const initialPage = location.hash.replace('#', '');

if (initialPage === 'intro') {
  openIntroPage('main');
} else {
  showPage(
    ['home', 'quiz', 'iris', 'result'].includes(initialPage)
      ? initialPage
      : 'home'
  );
}

const introButtons = document.querySelectorAll('[data-intro]');

const introRoot = document.querySelector('#intro-root');

function openIntroPage(type) {
  const content = introContents[type];

  if (!content || !pages.intro || !introRoot) {
    console.error('소개 페이지 구성 요소를 찾지 못했습니다.', {
      type,
      content,
      introPage: pages.intro,
      introRoot,
    });
    return;
  }

  introRoot.innerHTML = `
    <div class="intro-page-card glass-card">
      <button
        class="intro-back-button"
        type="button"
        data-page="home"
      >
        홈으로
      </button>

      <div class="intro-heading">
        <span id="intro-badge">${content.badge}</span>

        <p id="intro-eyebrow">
          ${content.eyebrow}
        </p>

        <h1 id="intro-title">
          ${content.title}
        </h1>

        <p id="intro-description">
          ${content.description}
        </p>
      </div>

      <div class="intro-content">
        <div class="intro-visual intro-visual-${type}" id="intro-visual">
          <img
            src="${content.visual}"
            alt="${content.badge} 소개 이미지"
          />
        </div>

        <div class="intro-detail">
          <h2 id="intro-subtitle">
            ${content.subtitle}
          </h2>

          <p id="intro-body">
            ${content.body}
          </p>

          <div class="intro-keywords" id="intro-keywords">
            ${content.keywords
              .map((keyword) => {
                const introMap = {
                  'Warm / Cool': 'wc',
                  'Everyday / Unique': 'eu',
                  'Puppy / Kitty': 'pk',
                  'Large / Medium': 'lm',
                };

                const target = introMap[keyword];

                return target
                  ? `
                    <button
                      type="button"
                      class="intro-keyword-button"
                      data-intro-target="${target}"
                    >
                      ${keyword}
                    </button>
                  `
                  : `<span>${keyword}</span>`;
              })
              .join('')}
          </div>
        </div>
      </div>

      <button
        class="intro-test-button cta"
        type="button"
        data-page="quiz"
      >
        <span>✦</span>

        <strong>테스트 시작하기</strong>

        <b>›</b>
      </button>
    </div>
  `;

  showPage('intro');

  introRoot.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      showPage(button.dataset.page);
    });
  });

  introRoot
  .querySelectorAll('[data-intro-target]')
  .forEach((button) => {
    button.addEventListener('click', () => {
      openIntroPage(button.dataset.introTarget);
    });
  });
}

introButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openIntroPage(button.dataset.intro);
  });
});