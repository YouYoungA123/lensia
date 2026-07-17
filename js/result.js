/* =========================================================
   LENSIA 결과보기 페이지 전용 JS
   - LPTI 유형 결과 표시
   - 스펙트럼 위치 변경
   - 홍채 이미지 결과 표시
   - 가상 착용 이미지 업로드 미리보기
   - API 연결 전 임시 동작
========================================================= */

/* 유형별 결과 문구 */
const typeData = {
  WEPL: {
    name: "포근한 밀크 브라운 타입",
    description:
      "따뜻하고 부드러운 인상을 살려주는 자연스러운 브라운 렌즈를 추천해요.",
  },

  WEPM: {
    name: "내추럴 코코아 타입",
    description:
      "부담 없는 확대감과 따뜻한 컬러가 어우러진 데일리 렌즈가 잘 어울려요.",
  },

  WEKL: {
    name: "선명한 카라멜 캣 타입",
    description:
      "따뜻한 카라멜 컬러와 또렷한 테두리로 세련된 눈매를 연출해 보세요.",
  },

  WEKM: {
    name: "차분한 허니 캣 타입",
    description:
      "은은한 브라운과 자연스러운 직경으로 또렷하지만 편안한 인상을 만들어요.",
  },

  WUPL: {
    name: "러블리 코랄 브라운 타입",
    description:
      "따뜻한 포인트 컬러와 큰 그래픽으로 사랑스럽고 특별한 분위기를 완성해요.",
  },

  WUPM: {
    name: "피치 글로우 타입",
    description:
      "코랄빛 포인트와 적당한 확대감으로 화사한 개성을 표현해 보세요.",
  },

  WUKL: {
    name: "골든 카라멜 캣 타입",
    description:
      "골드와 카라멜 컬러가 조합된 선명한 렌즈로 존재감을 높여보세요.",
  },

  WUKM: {
    name: "앰버 시크 타입",
    description:
      "앰버 브라운의 유니크함과 자연스러운 직경을 함께 즐기는 타입이에요.",
  },

  CEPL: {
    name: "맑은 애쉬 퍼피 타입",
    description:
      "차분한 애쉬 컬러와 부드러운 디자인으로 맑고 친근한 인상을 연출해요.",
  },

  CEPM: {
    name: "데일리 소프트 그레이 타입",
    description:
      "자연스러운 회색빛과 적당한 확대감으로 매일 편하게 착용하기 좋아요.",
  },

  CEKL: {
    name: "클리어 그레이 캣 타입",
    description:
      "맑은 회색과 또렷한 라인으로 세련되고 선명한 눈매를 만들어 보세요.",
  },

  CEKM: {
    name: "모던 애쉬 타입",
    description:
      "차분하고 도회적인 애쉬 컬러가 자연스러운 눈매와 잘 어울려요.",
  },

  CUPL: {
    name: "라벤더 드림 타입",
    description:
      "쿨한 컬러와 큰 직경으로 몽환적이고 사랑스러운 분위기를 연출해요.",
  },

  CUPM: {
    name: "미스티 블루 타입",
    description:
      "은은한 블루·그레이 컬러로 과하지 않게 특별한 포인트를 더해요.",
  },

  CUKL: {
    name: "문라이트 캣 타입",
    description:
      "차가운 컬러와 선명한 디자인으로 신비롭고 시크한 인상을 완성해요.",
  },

  CUKM: {
    name: "시크 애쉬 바이올렛 타입",
    description:
      "애쉬 바이올렛의 개성과 자연스러운 직경을 함께 즐기는 타입이에요.",
  },
};

/* 결과 페이지에서 사용할 상태 */
const resultState = {
  irisImageUrl: null,

  tryOnImageFile: null,
  tryOnImageUrl: null,

  selectedLensId: null,
  selectedLensName: null,
};

/* =========================================================
   LPTI 결과 표시
========================================================= */

/**
 * WEPM → WEP-M 형식으로 표시
 */
function formatTypeCode(code) {
  if (!code || code.length < 4) {
    return "WEPL";
  }

  return `${code.slice(0, 3)}${code[3]}`;
}

/**
 * script.js에 getTypeCode()가 있으면 실제 결과를 사용하고,
 * 아직 없거나 오류가 나면 WEPM을 기본값으로 사용
 */
function safeGetTypeCode() {
  try {
    if (typeof getTypeCode === "function") {
      return getTypeCode();
    }
  } catch (error) {
    console.warn("LPTI 유형을 불러오지 못했습니다.", error);
  }

  return "WEPL";
}

/**
 * 결과 페이지 전체 갱신
 *
 * script.js의 showPage("result")에서
 * updateResult()를 호출하는 기존 구조와 함께 사용할 수 있음
 */
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

  const characterImage = document.querySelector(
    "#result-character-image"
  );

  if (characterImage) {
    characterImage.src = `./assets/characters/${code}.png`;
    characterImage.alt = `${code} 유형 캐릭터`;
  }

  /*
   * 현재는 유형에 따라 27% 또는 73%로 표시
   * 나중에 문항별 실제 점수를 구하면
   * 해당 점수를 0~100으로 직접 넣어도 됨
   */
  moveAxis("#axis-wc", code[0] === "W" ? 27 : 73);
  moveAxis("#axis-eu", code[1] === "E" ? 27 : 73);
  moveAxis("#axis-pk", code[2] === "P" ? 27 : 73);
  moveAxis("#axis-lm", code[3] === "L" ? 27 : 73);

  restoreIrisPreview();
}

/**
 * 요소 텍스트를 안전하게 변경
 */
function setText(selector, value) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = value;
}

/**
 * 스펙트럼 동그라미 위치 변경
 */
function moveAxis(selector, score) {
  const dot = document.querySelector(selector);

  if (!dot) {
    return;
  }

  const numericScore = Number(score);
  const validScore = Number.isFinite(numericScore) ? numericScore : 50;

  /*
   * 점이 양끝으로 완전히 빠져나가지 않도록
   * 4%~96% 사이로 제한
   */
  const safeScore = Math.max(4, Math.min(96, validScore));

  dot.style.left = `${safeScore}%`;
}

/* =========================================================
   홍채 분석 결과 표시
========================================================= */

/**
 * 홍채 분석 API 연결 후 이 함수에 결과를 넣으면 됨.
 *
 * 사용 예시:
 *
 * applyIrisResult({
 *   imageUrl: data.irisImageUrl,
 *   statusText: "· 홍채 컬러 분석 포함 결과",
 * });
 */
function applyIrisResult({
  imageUrl,
  statusText = "· 홍채 컬러 분석 포함 결과",
}) {
  const image = document.querySelector("#result-iris-image");
  const placeholder = document.querySelector(
    "#result-iris-placeholder",
  );
  const ringLabel = document.querySelector(
    ".result-iris-ring b",
  );

  if (!image || !placeholder) {
    return;
  }

  /*
   * 이전에 생성한 blob URL이 있다면 메모리에서 해제
   */
  if (
    resultState.irisImageUrl &&
    resultState.irisImageUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(resultState.irisImageUrl);
  }

  resultState.irisImageUrl = imageUrl || null;

  if (resultState.irisImageUrl) {
    image.src = resultState.irisImageUrl;
    image.hidden = false;

    placeholder.hidden = true;

    if (ringLabel) {
      ringLabel.textContent = "분석 완료";
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

/**
 * 앞 단계에서 저장한 홍채 이미지를 복원
 *
 * 홍채 분석 단계에서 다음처럼 저장하면 됨:
 *
 * sessionStorage.setItem(
 *   "lensiaIrisImageDataUrl",
 *   imageDataUrl
 * );
 *
 * 분석 건너뛰기:
 *
 * sessionStorage.setItem(
 *   "lensiaIrisSkipped",
 *   "true"
 * );
 */
function restoreIrisPreview() {
  const savedDataUrl = sessionStorage.getItem(
    "lensiaIrisImageDataUrl",
  );

  const skipped =
    sessionStorage.getItem("lensiaIrisSkipped") === "true";

  if (savedDataUrl) {
    applyIrisResult({
      imageUrl: savedDataUrl,
      statusText: "· 홍채 컬러 분석 이미지 등록 완료",
    });

    return;
  }

  if (skipped) {
    applyIrisResult({
      imageUrl: null,
      statusText:
        "· 홍채 이미지 미분석 — LPTI 취향 기반 결과",
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

/**
 * 가상 착용 관련 버튼과 input 연결
 */
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

  /*
   * 카메라 버튼
   */
  cameraButton?.addEventListener("click", () => {
    cameraInput?.click();
  });

  /*
   * 이미지 업로드 버튼
   */
  uploadButton?.addEventListener("click", () => {
    fileInput?.click();
  });

  /*
   * 촬영 또는 업로드한 이미지 처리
   */
  cameraInput?.addEventListener(
    "change",
    handleTryOnFile,
  );

  fileInput?.addEventListener(
    "change",
    handleTryOnFile,
  );

  /*
   * API 연결 전 임시 분석 버튼
   *
   * 현재는 업로드한 원본 사진을
   * 결과 칸에도 그대로 표시함.
   *
   * 나중에는 이 부분에서 가상착용 API를 호출하고,
   * 응답 이미지 URL을 resultImage.src에 넣으면 됨.
   */
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

    const resultPlaceholder = document.querySelector(
      "#tryon-result-placeholder",
    );

    if (resultImage) {
      resultImage.src = resultState.tryOnImageUrl;
      resultImage.hidden = false;
    }

    if (resultPlaceholder) {
      resultPlaceholder.hidden = true;
    }

    showResultToast(
      `${resultState.selectedLensName} 가상 착용 API 연결 자리입니다.`,
    );
  });

  /*
   * 추천 렌즈 카드의 가상 착용 버튼
   */
  document
    .querySelectorAll(".result-try-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        resultState.selectedLensId =
          button.closest(".result-product-card")?.dataset
            .lensId || null;

        resultState.selectedLensName =
          button.dataset.lensName || "선택 렌즈";

        if (resultState.tryOnImageUrl) {
          showResultToast(
            `${resultState.selectedLensName} 렌즈를 선택했어요.`,
          );
        } else {
          showResultToast(
            `${resultState.selectedLensName} 렌즈를 선택했어요. 사진을 준비해 주세요.`,
          );
        }

        /*
         * 가상 착용 영역으로 부드럽게 이동
         */
        document
          .querySelector(".result-tryon-card")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    });
}

/**
 * 가상 착용용 파일 선택 처리
 */
function handleTryOnFile(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showResultToast("이미지 파일만 선택할 수 있어요.");

    event.target.value = "";

    return;
  }

  /*
   * 이전 blob URL 해제
   */
  if (
    resultState.tryOnImageUrl &&
    resultState.tryOnImageUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(resultState.tryOnImageUrl);
  }

  resultState.tryOnImageFile = file;
  resultState.tryOnImageUrl =
    URL.createObjectURL(file);

  const originalImage = document.querySelector(
    "#tryon-original-image",
  );

  const originalPlaceholder = document.querySelector(
    "#tryon-original-placeholder",
  );

  const resultImage = document.querySelector(
    "#tryon-result-image",
  );

  const resultPlaceholder = document.querySelector(
    "#tryon-result-placeholder",
  );

  const analyzeButton = document.querySelector(
    "#tryon-analyze-button",
  );

  /*
   * 원본 이미지 미리보기
   */
  if (originalImage) {
    originalImage.src = resultState.tryOnImageUrl;
    originalImage.hidden = false;
  }

  if (originalPlaceholder) {
    originalPlaceholder.hidden = true;
  }

  /*
   * 새로운 사진을 선택하면
   * 이전 가상 착용 결과는 초기화
   */
  if (resultImage) {
    resultImage.removeAttribute("src");
    resultImage.hidden = true;
  }

  if (resultPlaceholder) {
    resultPlaceholder.hidden = false;
  }

  /*
   * 분석 버튼 활성화
   */
  if (analyzeButton) {
    analyzeButton.disabled = false;
  }

  setText(
    "#tryon-file-status",
    `● ${file.name}`,
  );
}

/* =========================================================
   결과 하단 버튼
========================================================= */

/**
 * 결과 페이지 버튼 연결
 */
function initializeResultActions() {
  const saveButton = document.querySelector(
    "#save-result-image",
  );

  saveButton?.addEventListener("click", () => {
    showResultToast(
      "결과 이미지 저장 기능은 추후 연결하면 됩니다.",
    );
  });

  /*
   * 상세 보기 버튼 임시 동작
   */
  document
    .querySelectorAll(".result-detail-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        showResultToast(
          "제품 상세 페이지 연결 자리입니다.",
        );
      });
    });
}

/* =========================================================
   토스트 메시지
========================================================= */

/**
 * 기존 index.html에 #toast 요소가 있는 경우 사용
 */
function showResultToast(message) {
  const toast = document.querySelector("#toast");

  /*
   * toast 요소가 없을 때는 콘솔과 alert로 대체
   */
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showResultToast.timer);

  showResultToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* =========================================================
   초기 실행
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeTryOn();
  initializeResultActions();
  updateResult();
});