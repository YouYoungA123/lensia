/* =========================================================
   LENSIA 결과보기 페이지 전용 JS

   - LPTI 유형 결과 표시
   - 유형별 렌즈 1~3순위 추천
   - 렌즈 제품 이미지 표시
   - 스펙트럼 위치 변경
   - 홍채 이미지 결과 표시
   - 피부·홍채 API 분석 결과 표시
   - 가상 착용 이미지 업로드 미리보기
========================================================= */

/* =========================================================
   유형별 결과 문구
========================================================= */

const typeData = {
  WEPL: {
    name: "햇살 가득 캠퍼스 타입",
    description:
      "밝고 단정한 분위기를 가진 타입이에요. 부드러운 브라운 컬러와 자연스러운 확대감의 데일리 렌즈가 잘 어울려요.",
  },

  WEPM: {
    name: "포근한 캠퍼스 데이 타입",
    description:
      "편안하고 따뜻한 분위기가 돋보이는 타입이에요. 은은한 웜 브라운 컬러와 부담 없는 직경으로 맑고 친근한 인상을 살려보세요.",
  },

  WEKL: {
    name: "차분한 클래식 오피스 타입",
    description:
      "단정하고 성숙한 분위기가 돋보이는 타입이에요. 차분한 카라멜 브라운과 또렷한 외곽선으로 세련된 눈매를 연출해 보세요.",
  },

  WEKM: {
    name: "부드러운 내추럴 오피스 타입",
    description:
      "편안하면서도 세련된 분위기를 가진 타입이에요. 자연스러운 브라운과 적당한 확대감으로 부드럽고 또렷한 인상을 만들어요.",
  },

  WUPL: {
    name: "로맨틱 드리밍 타입",
    description:
      "여리여리하고 사랑스러운 분위기가 돋보이는 타입이에요. 화사한 웜 컬러와 큰 그래픽의 렌즈로 로맨틱한 눈빛을 완성해 보세요.",
  },

  WUPM: {
    name: "러블리 캔디 팝 타입",
    description:
      "밝고 발랄한 개성이 돋보이는 타입이에요. 피치와 코랄 계열의 포인트 컬러로 사랑스럽고 생기 있는 분위기를 표현해 보세요.",
  },

  WUKL: {
    name: "우아한 로즈 글램 타입",
    description:
      "성숙하고 화려한 분위기를 가진 타입이에요. 골드와 로즈 브라운 계열의 선명한 렌즈로 우아한 존재감을 높여보세요.",
  },

  WUKM: {
    name: "사랑스러운 발레코어 타입",
    description:
      "섬세하고 로맨틱한 개성이 돋보이는 타입이에요. 앰버와 로즈 브라운 계열의 렌즈로 부드러우면서도 특별한 분위기를 연출해 보세요.",
  },

  CEPL: {
    name: "청량한 데일리 캠퍼스 타입",
    description:
      "맑고 편안한 분위기를 가진 타입이에요. 차분한 애쉬 컬러와 부드러운 그래픽으로 깨끗하고 친근한 인상을 살려보세요.",
  },

  CEPM: {
    name: "산뜻한 프레피 캠퍼스 타입",
    description:
      "밝고 활동적인 분위기가 돋보이는 타입이에요. 자연스러운 그레이 브라운과 적당한 확대감으로 산뜻한 데일리 눈빛을 완성해 보세요.",
  },

  CEKL: {
    name: "도회적인 모던 오피스 타입",
    description:
      "차분하고 세련된 분위기를 가진 타입이에요. 맑은 그레이와 또렷한 라인의 렌즈로 도회적이고 선명한 눈매를 연출해 보세요.",
  },

  CEKM: {
    name: "담백한 시티 캐주얼 타입",
    description:
      "편안하면서도 감각적인 분위기가 돋보이는 타입이에요. 차분한 애쉬 브라운과 자연스러운 직경으로 세련된 인상을 만들어 보세요.",
  },

  CUPL: {
    name: "세련된 트위드 레이디 타입",
    description:
      "우아하면서도 개성 있는 분위기를 가진 타입이에요. 라벤더와 로즈 그레이 계열의 큰 직경 렌즈로 화려한 눈빛을 완성해 보세요.",
  },

  CUPM: {
    name: "힙한 프레피 스타 타입",
    description:
      "발랄하고 트렌디한 개성이 돋보이는 타입이에요. 블루와 그레이 계열의 포인트 렌즈로 과하지 않게 특별한 분위기를 더해보세요.",
  },

  CUKL: {
    name: "몽환적인 문라이트 글램 타입",
    description:
      "신비롭고 화려한 분위기를 가진 타입이에요. 블루 그레이와 바이올렛 계열의 선명한 렌즈로 몽환적인 눈빛을 연출해 보세요.",
  },

  CUKM: {
    name: "시크한 다크 아카데미 타입",
    description:
      "차분하고 시크한 개성이 돋보이는 타입이에요. 애쉬 바이올렛과 스모키 그레이 계열의 렌즈로 세련된 포인트를 더해보세요.",
  },
};

/* =========================================================
   렌즈 제품 데이터

   이미지 저장 위치:
   assets/lenses/파일명.png
========================================================= */

const lensProducts = {
  veilBrown: {
    name: "Veil Brown",
    nameKo: "베일 브라운",
    line: "Daily Veil Line",
    color: "저채도 브라운",
    diameter: 14.0,
    graphicDiameter: 13.0,
    bc: 8.6,
    image: "./assets/lenses/veil-brown.png",
    description:
      "진한 테두리 없이 본래 눈색을 따뜻하고 자연스럽게 정돈해 주는 데일리 렌즈예요.",
  },

  veilChoco: {
    name: "Veil Choco",
    nameKo: "베일 초코",
    line: "Daily Veil Line",
    color: "딥 초코 브라운",
    diameter: 14.0,
    graphicDiameter: 13.0,
    bc: 8.6,
    image: "./assets/lenses/veil-choco.png",
    description:
      "차분한 초코 컬러와 흐린 외곽선으로 자연스러운 또렷함을 더해주는 렌즈예요.",
  },

  veilAsh: {
    name: "Veil Ash",
    nameKo: "베일 애쉬",
    line: "Daily Veil Line",
    color: "애쉬 브라운",
    diameter: 14.0,
    graphicDiameter: 13.0,
    bc: 8.6,
    image: "./assets/lenses/veil-ash.png",
    description:
      "회색빛이 살짝 섞인 브라운 컬러로 차분하고 맑은 인상을 만들어주는 렌즈예요.",
  },

  veilOlive: {
    name: "Veil Olive",
    nameKo: "베일 올리브",
    line: "Daily Veil Line",
    color: "소프트 올리브 브라운",
    diameter: 14.0,
    graphicDiameter: 13.0,
    bc: 8.6,
    image: "./assets/lenses/veil-olive.png",
    description:
      "브라운 베이스에 낮은 채도의 올리브를 더해 은은한 분위기 변화를 주는 렌즈예요.",
  },

  warmHoney: {
    name: "Warm Honey",
    nameKo: "웜 허니",
    line: "Mood Tone Line",
    color: "허니 브라운",
    diameter: 14.2,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/warm-honey.png",
    description:
      "밝은 허니 컬러가 웜톤 눈빛에 따뜻한 생기와 부드러운 포인트를 더해줘요.",
  },

  warmHazel: {
    name: "Warm Hazel",
    nameKo: "웜 헤이즐",
    line: "Mood Tone Line",
    color: "헤이즐 브라운",
    diameter: 14.2,
    graphicDiameter: 13.3,
    bc: 8.6,
    image: "./assets/lenses/warm-hazel.png",
    description:
      "카키와 골드 브라운이 섞인 헤이즐 컬러로 성숙하고 세련된 분위기를 만들어줘요.",
  },

  coolGrayBrown: {
    name: "Cool Gray Brown",
    nameKo: "쿨 그레이 브라운",
    line: "Mood Tone Line",
    color: "그레이 브라운",
    diameter: 14.2,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/cool-gray-brown.png",
    description:
      "브라운 베이스에 회색빛을 더해 쿨톤 눈빛을 차분하게 정리해주는 렌즈예요.",
  },

  coolRoseGray: {
    name: "Cool Rose Gray",
    nameKo: "쿨 로즈 그레이",
    line: "Mood Tone Line",
    color: "로즈 그레이",
    diameter: 14.2,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/cool-rose-gray.png",
    description:
      "연한 그레이에 로즈빛을 더해 맑고 부드러운 쿨톤 분위기를 만들어줘요.",
  },

  puppyAlmond: {
    name: "Puppy Almond",
    nameKo: "퍼피 아몬드",
    line: "Soft Puppy Line",
    color: "아몬드 브라운",
    diameter: 14.2,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/puppy-almond.png",
    description:
      "둥근 도트와 흐린 초코 외곽선으로 눈을 부드럽고 편안하게 보여주는 렌즈예요.",
  },

  puppyMilkBrown: {
    name: "Puppy Milk Brown",
    nameKo: "퍼피 밀크 브라운",
    line: "Soft Puppy Line",
    color: "밀크 브라운",
    diameter: 14.0,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/puppy-milk-brown.png",
    description:
      "낮은 발색과 부드러운 밀크 브라운 컬러로 본래 눈을 자연스럽게 밝혀줘요.",
  },

  puppyPinkBrown: {
    name: "Puppy Pink Brown",
    nameKo: "퍼피 핑크 브라운",
    line: "Soft Puppy Line",
    color: "핑크 브라운",
    diameter: 14.2,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/puppy-milk-brown.png",
    description:
      "낮은 채도의 핑크 브라운이 맑고 부드러운 쿨톤 강아지상 분위기를 만들어줘요.",
  },

  puppyOliveCream: {
    name: "Puppy Olive Cream",
    nameKo: "퍼피 올리브 크림",
    line: "Soft Puppy Line",
    color: "크림 올리브",
    diameter: 14.2,
    graphicDiameter: 13.2,
    bc: 8.6,
    image: "./assets/lenses/puppy-olive-cream.png",
    description:
      "크림 브라운과 올리브가 어우러져 부드러움을 유지하면서 색다른 분위기를 더해줘요.",
  },

  kittyAshChoco: {
    name: "Kitty Ash Choco",
    nameKo: "키티 애쉬 초코",
    line: "Chic Kitty Line",
    color: "애쉬 초코",
    diameter: 14.3,
    graphicDiameter: 13.4,
    bc: 8.6,
    image: "./assets/lenses/kitty-ash-choco.png",
    description:
      "애쉬빛 초코 컬러와 얇은 외곽선으로 자연스럽고 또렷한 눈매를 만들어줘요.",
  },

  kittyHazelEdge: {
    name: "Kitty Hazel Edge",
    nameKo: "키티 헤이즐 엣지",
    line: "Chic Kitty Line",
    color: "헤이즐 브라운",
    diameter: 14.3,
    graphicDiameter: 13.4,
    bc: 8.6,
    image: "./assets/lenses/kitty-hazel-edge.png",
    description:
      "헤이즐 컬러와 방사형 그라데이션이 웜톤 고양이상 눈매를 선명하게 살려줘요.",
  },

  kittyGray: {
    name: "Kitty Gray",
    nameKo: "키티 그레이",
    line: "Chic Kitty Line",
    color: "쿨 그레이",
    diameter: 14.3,
    graphicDiameter: 13.4,
    bc: 8.6,
    image: "./assets/lenses/kitty-gray.png",
    description:
      "차분한 쿨 그레이와 얇고 또렷한 외곽선으로 시크한 인상을 만들어줘요.",
  },

  kittyVioletSmoke: {
    name: "Kitty Violet Smoke",
    nameKo: "키티 바이올렛 스모크",
    line: "Chic Kitty Line",
    color: "스모키 바이올렛 그레이",
    diameter: 14.3,
    graphicDiameter: 13.4,
    bc: 8.6,
    image: "./assets/lenses/kitty-violet-smoke.png",
    description:
      "바이올렛과 그레이가 섞인 스모키 컬러로 강한 개성과 시크함을 더해줘요.",
  },

  flashHoneyGlow: {
    name: "Flash Honey Glow",
    nameKo: "플래시 허니 글로우",
    line: "Flash Moment Line",
    color: "글로우 허니 브라운",
    diameter: 14.4,
    graphicDiameter: 13.6,
    bc: 8.6,
    image: "./assets/lenses/flash-honey-glow.png",
    description:
      "허니와 골드 브라운 컬러가 자연광에서 화사하고 선명하게 발색되는 포인트 렌즈예요.",
  },

  flashOlivePop: {
    name: "Flash Olive Pop",
    nameKo: "플래시 올리브 팝",
    line: "Flash Moment Line",
    color: "올리브 카키",
    diameter: 14.4,
    graphicDiameter: 13.5,
    bc: 8.6,
    image: "./assets/lenses/flash-olive-pop.png",
    description:
      "올리브 카키와 브라운 외곽선이 어우러져 힙하고 개성 있는 분위기를 만들어줘요.",
  },

  flashBlueGray: {
    name: "Flash Blue Gray",
    nameKo: "플래시 블루 그레이",
    line: "Flash Moment Line",
    color: "블루 그레이",
    diameter: 14.4,
    graphicDiameter: 13.6,
    bc: 8.6,
    image: "./assets/lenses/flash-blue-gray.png",
    description:
      "그레이 베이스에 낮은 채도의 블루를 더해 사진에서 맑고 차가운 눈빛을 만들어줘요.",
  },

  flashLavenderHaze: {
    name: "Flash Lavender Haze",
    nameKo: "플래시 라벤더 헤이즈",
    line: "Flash Moment Line",
    color: "라벤더 그레이",
    diameter: 14.4,
    graphicDiameter: 13.5,
    bc: 8.6,
    image: "./assets/lenses/flash-lavender-haze.png",
    description:
      "라벤더와 그레이가 섞인 스모키 그래픽으로 몽환적인 분위기를 만들어줘요.",
  },
};

/* =========================================================
   LPTI별 렌즈 추천 순위
========================================================= */

const lptiLensRanking = {
  WEPM: [
    "veilBrown",
    "puppyMilkBrown",
    "puppyAlmond",
  ],

  WEPL: [
    "veilChoco",
    "puppyAlmond",
    "warmHoney",
  ],

  WUPM: [
    "veilOlive",
    "puppyOliveCream",
    "warmHoney",
  ],

  WUPL: [
    "flashHoneyGlow",
    "puppyOliveCream",
    "flashOlivePop",
  ],

  WEKM: [
    "warmHazel",
    "kittyAshChoco",
    "veilChoco",
  ],

  WEKL: [
    "kittyHazelEdge",
    "veilChoco",
    "warmHazel",
  ],

  WUKM: [
    "kittyHazelEdge",
    "veilOlive",
    "warmHazel",
  ],

  WUKL: [
    "flashOlivePop",
    "kittyHazelEdge",
    "flashHoneyGlow",
  ],

  CEPM: [
    "veilAsh",
    "puppyPinkBrown",
    "coolGrayBrown",
  ],

  CEPL: [
    "puppyPinkBrown",
    "coolRoseGray",
    "veilAsh",
  ],

  CUPM: [
    "coolRoseGray",
    "puppyPinkBrown",
    "flashLavenderHaze",
  ],

  CUPL: [
    "flashLavenderHaze",
    "flashBlueGray",
    "coolRoseGray",
  ],

  CEKM: [
    "coolGrayBrown",
    "kittyAshChoco",
    "kittyGray",
  ],

  CEKL: [
    "kittyAshChoco",
    "kittyGray",
    "coolGrayBrown",
  ],

  CUKM: [
    "kittyGray",
    "coolRoseGray",
    "kittyVioletSmoke",
  ],

  CUKL: [
    "kittyVioletSmoke",
    "flashBlueGray",
    "kittyGray",
  ],
};

/* =========================================================
   결과 페이지 상태
========================================================= */

const resultState = {
  irisImageUrl: null,

  tryOnImageFile: null,
  tryOnImageUrl: null,

  selectedLensId: null,
  selectedLensName: null,
};

/* =========================================================
   공통 함수
========================================================= */

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = value;
}

function formatTypeCode(code) {
  if (!code || code.length < 4) {
    return "WEP-L";
  }

  return `${code.slice(0, 3)}${code[3]}`;
}

function safeGetTypeCode() {
  try {
    if (typeof getTypeCode === "function") {
      const code = getTypeCode();

      if (code) {
        return String(code)
          .replaceAll("-", "")
          .toUpperCase();
      }
    }
  } catch (error) {
    console.warn(
      "LPTI 유형을 불러오지 못했습니다.",
      error,
    );
  }

  return "WEPL";
}

function safeGetSpectrumScores(code) {
  try {
    if (typeof calculateScores === "function") {
      const scores = calculateScores();

      const toPercent = (leftScore, rightScore) => {
        const left = Number(leftScore) || 0;
        const right = Number(rightScore) || 0;
        const total = left + right;

        if (total === 0) {
          return 50;
        }

        return (right / total) * 100;
      };

      return {
        wc: toPercent(scores.W, scores.C),
        eu: toPercent(scores.E, scores.U),
        pk: toPercent(scores.P, scores.K),
        lm: toPercent(scores.L, scores.M),
      };
    }
  } catch (error) {
    console.warn(
      "스펙트럼 점수를 불러오지 못했습니다.",
      error,
    );
  }

  return {
    wc: code[0] === "W" ? 27 : 73,
    eu: code[1] === "E" ? 27 : 73,
    pk: code[2] === "P" ? 27 : 73,
    lm: code[3] === "L" ? 27 : 73,
  };
}

function moveAxis(selector, score) {
  const dot = document.querySelector(selector);

  if (!dot) {
    return;
  }

  const numericScore = Number(score);

  const validScore = Number.isFinite(numericScore)
    ? numericScore
    : 50;

  const safeScore = Math.max(
    4,
    Math.min(96, validScore),
  );

  dot.style.left = `${safeScore}%`;
}

/* =========================================================
   추천 렌즈 카드 표시
========================================================= */

function renderLensRecommendations(code) {
  const normalizedCode = String(code || "WEPL")
    .replaceAll("-", "")
    .toUpperCase();

  const lensIds =
    lptiLensRanking[normalizedCode] ||
    lptiLensRanking.WEPL;

  const cards = document.querySelectorAll(
    "#result-product-grid .result-product-card",
  );

  cards.forEach((card, index) => {
    const lensId = lensIds[index];
    const lens = lensProducts[lensId];

    if (!lens) {
      card.hidden = true;
      return;
    }

    card.hidden = false;
    card.dataset.lensId = lensId;
    card.dataset.rank = String(index + 1);

    const title = card.querySelector("h3");

    const description = card.querySelector(
      ".result-product-info > p",
    );

    const metaItems = card.querySelectorAll(
      ".result-product-meta span",
    );

    const imageWrap = card.querySelector(
      ".result-product-image-placeholder",
    );

    const tryButton = card.querySelector(
      ".result-try-button",
    );

    const detailButton = card.querySelector(
      ".result-detail-button",
    );

    if (title) {
      title.textContent = lens.nameKo;
      title.title = `${lens.name} · ${lens.line}`;
    }

    if (description) {
      description.textContent = lens.description;
    }

    if (metaItems[0]) {
      metaItems[0].textContent =
        `전체 ${lens.diameter.toFixed(1)}mm`;
    }

    if (metaItems[1]) {
      metaItems[1].textContent =
        `그래픽 ${lens.graphicDiameter.toFixed(1)}mm`;
    }

    if (imageWrap) {
      imageWrap.replaceChildren();

      const image = document.createElement("img");

      image.src = lens.image;
      image.alt = `${lens.nameKo} 렌즈 이미지`;
      image.loading = "lazy";

      image.style.width = "100%";
      image.style.height = "100%";
      image.style.display = "block";
      image.style.objectFit = "cover";
      image.style.borderRadius = "inherit";

      image.addEventListener("error", () => {
        image.remove();

        const placeholder =
          document.createElement("span");

        placeholder.textContent =
          `${lens.nameKo} 이미지 준비 중`;

        imageWrap.appendChild(placeholder);
      });

      imageWrap.appendChild(image);
    }

    if (tryButton) {
      tryButton.disabled = false;
      tryButton.dataset.lensId = lensId;
      tryButton.dataset.lensName = lens.nameKo;

      tryButton.setAttribute(
        "aria-label",
        `${lens.nameKo} 가상 착용`,
      );
    }

    if (detailButton) {
      detailButton.disabled = false;
      detailButton.dataset.lensId = lensId;
      detailButton.dataset.lensName = lens.nameKo;
    }

    let bestLabel = card.querySelector(
      ".result-best-label",
    );

    if (index === 0) {
      if (!bestLabel) {
        bestLabel = document.createElement("span");
        bestLabel.className = "result-best-label";

        card.prepend(bestLabel);
      }

      bestLabel.textContent = "BEST";
      bestLabel.hidden = false;
    } else if (bestLabel) {
      bestLabel.hidden = true;
    }
  });
}

/* =========================================================
   결과 페이지 전체 갱신
========================================================= */

function updateResult() {
  const code = safeGetTypeCode();
  const data = typeData[code] || typeData.WEPL;

  const fullTypeName = [
    code[0] === "W" ? "Warm" : "Cool",
    code[1] === "E" ? "Everyday" : "Unique",
    code[2] === "P" ? "Puppy" : "Kitty",
    code[3] === "L" ? "Large" : "Medium",
  ].join(" ");

  setText("#type-code", formatTypeCode(code));
  setText("#type-full", fullTypeName);
  setText("#type-name", data.name);
  setText("#type-description", data.description);

  renderLensRecommendations(code);

  const characterImage = document.querySelector(
    "#result-character-image",
  );

  const characterVisual = document.querySelector(
    ".result-character-visual",
  );

  if (characterImage && characterVisual) {
    let placeholder = characterVisual.querySelector(
      ".result-character-placeholder",
    );

    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.className =
        "result-character-placeholder";

      characterVisual.appendChild(placeholder);
    }

    /* 유형이 바뀔 때마다 placeholder 내용도 갱신 */
    placeholder.innerHTML = `
      <span>✦</span>
      <strong>캐릭터 이미지<br>준비 중</strong>
      <small>${formatTypeCode(code)} TYPE</small>
    `;

    /*
    * hidden 속성은 기존 CSS의 display에 덮일 수 있으므로
    * style.display로 확실하게 숨깁니다.
    */
    characterImage.style.display = "none";
    placeholder.style.display = "none";

    characterImage.onload = () => {
      characterImage.style.display = "block";
      placeholder.style.display = "none";
    };

    characterImage.onerror = () => {
      characterImage.style.display = "none";
      placeholder.style.display = "flex";

      /*
      * 깨진 이미지 아이콘과 alt 문구가 남지 않도록
      * 실패한 주소를 제거합니다.
      */
      characterImage.removeAttribute("src");
      characterImage.alt = "";
    };

    characterImage.alt =
      `${formatTypeCode(code)} 유형 캐릭터`;

    characterImage.src =
      `./assets/characters/${code}.png`;
  }
    
  const spectrum = safeGetSpectrumScores(code);

  moveAxis("#axis-wc", spectrum.wc);
  moveAxis("#axis-eu", spectrum.eu);
  moveAxis("#axis-pk", spectrum.pk);
  moveAxis("#axis-lm", spectrum.lm);

  restoreIrisPreview();
  restoreIrisAnalysisResult();
}

/* =========================================================
   홍채 분석 결과 표시
========================================================= */

const DEFAULT_ANALYSIS_COLOR = "#D9DCE5";

function normalizeHexColor(value) {
  if (!value) {
    return null;
  }

  const text = String(value).trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
    return text.toUpperCase();
  }

  if (/^[0-9A-Fa-f]{6}$/.test(text)) {
    return `#${text.toUpperCase()}`;
  }

  return null;
}

function formatHsv(hsv) {
  if (!hsv) {
    return "분석 결과 없음";
  }

  const h = Number(hsv.h);
  const s = Number(hsv.s);
  const v = Number(hsv.v);

  if (
    !Number.isFinite(h) ||
    !Number.isFinite(s) ||
    !Number.isFinite(v)
  ) {
    return "분석 결과 없음";
  }

  return `H ${h.toFixed(0)}, S ${s.toFixed(4)}, V ${v.toFixed(4)}`;
}

function setColorChipPending(
  chipSelector,
  valueSelector,
  label,
) {
  const chip = document.querySelector(chipSelector);

  if (chip) {
    chip.style.setProperty(
      "--chip",
      DEFAULT_ANALYSIS_COLOR,
    );

    chip.classList.add("is-pending");
  }

  setText(valueSelector, label);
}

function setAnalysisPendingState(
  message = "테스트 전입니다",
  chipLabel = "테스트 전",
) {
  setColorChipPending(
    "#skin-color-chip",
    "#skin-color-chip-value",
    chipLabel,
  );

  setColorChipPending(
    "#iris-color-chip",
    "#iris-color-chip-value",
    chipLabel,
  );

  setColorChipPending(
    "#lens-color-chip",
    "#lens-color-chip-value",
    chipLabel,
  );

  setColorChipPending(
    "#tone-color-chip",
    "#tone-color-chip-value",
    chipLabel,
  );

  setText("#skin-color-detail", message);
  setText("#iris-color-detail", message);
  setText("#eye-face-ratio", message);
  setText("#skin-hsv-detail", message);
  setText("#iris-hsv-detail", message);
}

function updateColorChip(
  chipSelector,
  valueSelector,
  color,
) {
  const chip = document.querySelector(chipSelector);
  const normalizedColor = normalizeHexColor(color);

  if (!chip || !normalizedColor) {
    setColorChipPending(
      chipSelector,
      valueSelector,
      "결과 없음",
    );

    return;
  }

  chip.style.setProperty(
    "--chip",
    normalizedColor,
  );

  chip.classList.remove("is-pending");

  setText(
    valueSelector,
    normalizedColor.replace("#", ""),
  );
}

function renderIrisAnalysisResult(data) {
  if (!data || typeof data !== "object") {
    setAnalysisPendingState();
    return;
  }

  updateColorChip(
    "#skin-color-chip",
    "#skin-color-chip-value",
    data.skinColor,
  );

  updateColorChip(
    "#iris-color-chip",
    "#iris-color-chip-value",
    data.irisColor,
  );

  updateColorChip(
    "#lens-color-chip",
    "#lens-color-chip-value",
    data.lensColor,
  );

  updateColorChip(
    "#tone-color-chip",
    "#tone-color-chip-value",
    data.toneColor,
  );

  const skinColor = normalizeHexColor(
    data.skinColor,
  );

  const irisColor = normalizeHexColor(
    data.irisColor,
  );

  setText(
    "#skin-color-detail",
    skinColor
      ? `${skinColor} / ${data.skinTone || "톤 분석 완료"}`
      : "피부톤 결과 없음",
  );

  setText(
    "#iris-color-detail",
    irisColor
      ? `${irisColor} / ${data.irisTone || "톤 분석 완료"}`
      : "홍채 컬러 결과 없음",
  );

  const ratio = Number(data.eyeFaceRatio);

  setText(
    "#eye-face-ratio",
    Number.isFinite(ratio)
      ? `${ratio.toFixed(2)}%`
      : "비율 결과 없음",
  );

  setText(
    "#skin-hsv-detail",
    formatHsv(data.skinHsv),
  );

  setText(
    "#iris-hsv-detail",
    formatHsv(data.irisHsv),
  );
}

function restoreIrisAnalysisResult() {
  const savedResult = sessionStorage.getItem(
    "lensiaIrisAnalysisResult",
  );

  const stateText = sessionStorage.getItem(
    "lensiaIrisState",
  );

  let state = null;

  if (stateText) {
    try {
      state = JSON.parse(stateText);
    } catch (error) {
      console.warn(
        "홍채 분석 상태를 읽지 못했습니다.",
        error,
      );
    }
  }

  if (state?.skipped) {
    setAnalysisPendingState(
      "홍채 분석을 진행하지 않았어요",
      "미분석",
    );

    return;
  }

  if (!savedResult) {
    setAnalysisPendingState(
      state?.hasImage
        ? "이미지는 등록되었지만 아직 분석 전입니다"
        : "테스트 전입니다",
      "테스트 전",
    );

    return;
  }

  try {
    renderIrisAnalysisResult(
      JSON.parse(savedResult),
    );
  } catch (error) {
    console.warn(
      "홍채 분석 결과를 읽지 못했습니다.",
      error,
    );

    setAnalysisPendingState(
      "분석 결과를 불러오지 못했어요",
      "오류",
    );
  }
}

/* =========================================================
   홍채 이미지 미리보기
========================================================= */

function applyIrisResult({
  imageUrl,
  statusText = "· 홍채 컬러 분석 포함 결과",
}) {
  const image = document.querySelector(
    "#result-iris-image",
  );

  const placeholder = document.querySelector(
    "#result-iris-placeholder",
  );

  const ringLabel = document.querySelector(
    ".result-iris-ring b",
  );

  if (!image || !placeholder) {
    return;
  }

  if (
    resultState.irisImageUrl &&
    resultState.irisImageUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(
      resultState.irisImageUrl,
    );
  }

  resultState.irisImageUrl = imageUrl || null;

  if (resultState.irisImageUrl) {
    image.src = resultState.irisImageUrl;
    image.hidden = false;

    placeholder.hidden = true;

    if (ringLabel) {
      ringLabel.textContent = "분석 대기";
    }
  } else {
    image.removeAttribute("src");
    image.hidden = true;

    placeholder.hidden = false;

    if (ringLabel) {
      ringLabel.textContent = "분석 대기";
    }
  }

  setText("#iris-result-status", statusText);
}

function restoreIrisPreview() {
  const savedDataUrl = sessionStorage.getItem(
    "lensiaIrisImageDataUrl",
  );

  const stateText = sessionStorage.getItem(
    "lensiaIrisState",
  );

  let state = null;

  if (stateText) {
    try {
      state = JSON.parse(stateText);
    } catch (error) {
      console.warn(
        "홍채 이미지 상태를 읽지 못했습니다.",
        error,
      );
    }
  }

  if (state?.skipped) {
    applyIrisResult({
      imageUrl: null,
      statusText:
        "· 홍채 이미지 미분석 — LPTI 취향 기반 결과",
    });

    return;
  }

  if (savedDataUrl) {
    applyIrisResult({
      imageUrl: savedDataUrl,
      statusText:
        "· 홍채 이미지 등록 완료 — 분석 결과 대기 중",
    });

    return;
  }

  applyIrisResult({
    imageUrl: null,
    statusText:
      "· 홍채 이미지가 없어요 — 촬영 또는 첨부 후 분석할 수 있어요",
  });
}

/* =========================================================
   가상 착용 기능
========================================================= */

function initializeTryOn() {
  const cameraButton = document.querySelector(
    "#tryon-camera-button",
  );

  const uploadButton = document.querySelector(
    "#tryon-upload-button",
  );

  const cameraInput = document.querySelector(
    "#tryon-camera-input",
  );

  const fileInput = document.querySelector(
    "#tryon-file-input",
  );

  const analyzeButton = document.querySelector(
    "#tryon-analyze-button",
  );

  cameraButton?.addEventListener("click", () => {
    cameraInput?.click();
  });

  uploadButton?.addEventListener("click", () => {
    fileInput?.click();
  });

  cameraInput?.addEventListener(
    "change",
    handleTryOnFile,
  );

  fileInput?.addEventListener(
    "change",
    handleTryOnFile,
  );

  analyzeButton?.addEventListener("click", () => {
    if (!resultState.tryOnImageUrl) {
      showResultToast(
        "가상 착용에 사용할 사진을 먼저 선택해 주세요.",
      );

      return;
    }

    if (!resultState.selectedLensName) {
      showResultToast(
        "먼저 추천 렌즈의 가상 착용 버튼을 선택해 주세요.",
      );

      return;
    }

    const resultImage = document.querySelector(
      "#tryon-result-image",
    );

    const resultPlaceholder =
      document.querySelector(
        "#tryon-result-placeholder",
      );

    if (resultImage) {
      resultImage.src =
        resultState.tryOnImageUrl;

      resultImage.hidden = false;
    }

    if (resultPlaceholder) {
      resultPlaceholder.hidden = true;
    }

    showResultToast(
      `${resultState.selectedLensName} 가상 착용 API 연결 자리입니다.`,
    );
  });

  document
    .querySelectorAll(".result-try-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        resultState.selectedLensId =
          button.dataset.lensId ||
          button.closest(
            ".result-product-card",
          )?.dataset.lensId ||
          null;

        resultState.selectedLensName =
          button.dataset.lensName ||
          "선택 렌즈";

        if (resultState.tryOnImageUrl) {
          showResultToast(
            `${resultState.selectedLensName} 렌즈를 선택했어요.`,
          );
        } else {
          showResultToast(
            `${resultState.selectedLensName} 렌즈를 선택했어요. 사진을 준비해 주세요.`,
          );
        }

        document
          .querySelector(
            ".result-tryon-card",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    });
}

function handleTryOnFile(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showResultToast(
      "이미지 파일만 선택할 수 있어요.",
    );

    event.target.value = "";

    return;
  }

  if (
    resultState.tryOnImageUrl &&
    resultState.tryOnImageUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(
      resultState.tryOnImageUrl,
    );
  }

  resultState.tryOnImageFile = file;

  resultState.tryOnImageUrl =
    URL.createObjectURL(file);

  const originalImage = document.querySelector(
    "#tryon-original-image",
  );

  const originalPlaceholder =
    document.querySelector(
      "#tryon-original-placeholder",
    );

  const resultImage = document.querySelector(
    "#tryon-result-image",
  );

  const resultPlaceholder =
    document.querySelector(
      "#tryon-result-placeholder",
    );

  const analyzeButton = document.querySelector(
    "#tryon-analyze-button",
  );

  if (originalImage) {
    originalImage.src =
      resultState.tryOnImageUrl;

    originalImage.hidden = false;
  }

  if (originalPlaceholder) {
    originalPlaceholder.hidden = true;
  }

  if (resultImage) {
    resultImage.removeAttribute("src");
    resultImage.hidden = true;
  }

  if (resultPlaceholder) {
    resultPlaceholder.hidden = false;
  }

  if (analyzeButton) {
    analyzeButton.disabled = false;
  }

  setText(
    "#tryon-file-status",
    `● ${file.name}`,
  );
}

/* =========================================================
   하단 버튼
========================================================= */

function initializeResultActions() {
  const saveButton = document.querySelector(
    "#save-result-image",
  );

  saveButton?.addEventListener("click", () => {
    showResultToast(
      "결과 이미지 저장 기능은 추후 연결하면 됩니다.",
    );
  });

  document
    .querySelectorAll(".result-detail-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const lensId =
          button.dataset.lensId ||
          button.closest(
            ".result-product-card",
          )?.dataset.lensId;

        const lens = lensProducts[lensId];

        if (!lens) {
          showResultToast(
            "제품 상세 정보를 불러오지 못했습니다.",
          );

          return;
        }

        showResultToast(
          `${lens.nameKo} · ${lens.color} · BC ${lens.bc}`,
        );
      });
    });
}

/* =========================================================
   토스트 메시지
========================================================= */

function showResultToast(message) {
  const toast = document.querySelector("#toast");

  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(
    showResultToast.timer,
  );

  showResultToast.timer =
    window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
}

async function saveResultAsImage() {
  const resultPage = document.querySelector("#result-page");

  if (!resultPage) {
    showResultToast("저장할 결과 영역을 찾지 못했어요.");
    return;
  }

  if (typeof html2canvas === "undefined") {
    showResultToast("이미지 저장 라이브러리를 불러오지 못했어요.");
    return;
  }

  const exportWidth = 1400;

  const captureRoot = document.createElement("div");
  captureRoot.className = "result-export-capture";

  const clonedPage = resultPage.cloneNode(true);

  captureRoot.appendChild(clonedPage);
  document.body.appendChild(captureRoot);

  try {
    /*
     * 저장용 복제본 보정
     * - 숨김 페이지를 강제로 보이게
     * - 반응형 영향 줄이기 위해 고정 폭 사용
     */
    clonedPage.classList.add("active-page");
    clonedPage.style.display = "block";
    clonedPage.style.width = "100%";
    clonedPage.style.maxWidth = "none";

    /*
     * 혹시 결과 페이지 내부에 애니메이션/트랜스폼 때문에 흔들리면
     * 여기서 추가 보정 가능
     */
    const canvas = await html2canvas(clonedPage, {
      backgroundColor: "#f5f7fb",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,

      width: clonedPage.scrollWidth,
      height: clonedPage.scrollHeight,

      windowWidth: exportWidth,
      windowHeight: clonedPage.scrollHeight,

      scrollX: 0,
      scrollY: 0,
    });

    const typeCode =
      document.querySelector("#type-code")?.textContent?.trim() ||
      "LPTI";

    const link = document.createElement("a");
    link.download = `lensia-result-${typeCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showResultToast("결과 이미지가 저장되었어요.");
  } catch (error) {
    console.error("결과 저장 실패:", error);
    showResultToast("결과 이미지를 저장하지 못했어요.");
  } finally {
    captureRoot.remove();
  }
}

/* =========================================================
   초기 실행
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    updateResult();
    initializeTryOn();
    initializeResultActions();
  },
);
