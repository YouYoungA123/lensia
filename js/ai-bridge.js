/* =========================================================
   LENSIA AI BRIDGE
   Connects the latest UI to the local Python API server.
========================================================= */

(() => {
  "use strict";

  const DEFAULT_LENS_COLOR = "#8B5E3C";

  const lensColorById = {
    "lens-01": "#8B5E3C",
    "lens-02": "#C8A46F",
    "lens-03": "#6F5644",
  };

  const typeFallback = {
    WEPL: {
      name: "웜 데일리 브라운 타입",
      description: "부담 없는 확대감과 따뜻한 브라운 계열 렌즈가 잘 어울려요.",
    },
    CEPL: {
      name: "쿨 데일리 그레이 타입",
      description: "맑고 차분한 그레이, 초코 계열 렌즈가 자연스럽게 어울려요.",
    },
    WUPL: {
      name: "웜 유니크 포인트 타입",
      description: "따뜻한 컬러에 포인트 그래픽이 있는 렌즈로 분위기를 살려보세요.",
    },
    CUKL: {
      name: "쿨 유니크 시크 타입",
      description: "차가운 컬러감과 선명한 그래픽이 있는 렌즈가 잘 맞아요.",
    },
  };

  let selectedLensColor = DEFAULT_LENS_COLOR;
  let selectedImageFile = null;
  let analyzing = false;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function showToast(message) {
    if (typeof window.showResultToast === "function") {
      window.showResultToast(message);
      return;
    }

    const toast = qs("#toast");
    if (!toast) {
      window.alert(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function normalizeHex(value, fallback = "#000000") {
    if (!value || typeof value !== "string") {
      return fallback;
    }

    const trimmed = value.trim();
    return trimmed.startsWith("#") ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
  }

  function cacheBust(url) {
    if (!url) {
      return "";
    }

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
  }

  function setText(selector, value) {
    const element = qs(selector);
    if (element) {
      element.textContent = value;
    }
  }

  function getFileFromIrisPage() {
    return qs("#iris-file-input")?.files?.[0]
      || qs("#iris-camera-input")?.files?.[0]
      || selectedImageFile
      || window.lensiaSelectedImageFile
      || null;
  }

  function getFileFromTryOnPage() {
    return qs("#tryon-file-input")?.files?.[0]
      || qs("#tryon-camera-input")?.files?.[0]
      || selectedImageFile
      || window.lensiaSelectedImageFile
      || null;
  }

  async function postAnalyze(file, lensColor = selectedLensColor) {
    if (!file) {
      throw new Error("분석할 이미지가 없습니다.");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("lens_color", normalizeHex(lensColor, DEFAULT_LENS_COLOR));
    formData.append("graphic_scale", "1.0");
    formData.append("tryon_alpha", "0.38");

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      const message = data?.error || `분석 요청 실패 (${response.status})`;
      throw new Error(message);
    }

    return data.result;
  }

  function codeFromAiResult(result) {
    const hint = result?.analysis?.lpti_hint || {};
    const color = `${hint.warm_cool || hint.color_temperature || ""}`.toLowerCase().startsWith("cool") ? "C" : "W";
    const style = `${hint.everyday_unique || hint.style || ""}`.toLowerCase().startsWith("unique") ? "U" : "E";
    const impression = `${hint.puppy_kitty || hint.eye_impression || ""}`.toLowerCase().startsWith("kitty") ? "K" : "P";
    const size = `${hint.large_medium || hint.size || ""}`.toLowerCase().startsWith("medium") ? "M" : "L";
    return `${color}${style}${impression}${size}`;
  }

  function applyAiType(result) {
    const code = codeFromAiResult(result);
    const data = typeFallback[code] || typeFallback.WEPL;

    setText("#type-code", code);
    setText(
      "#type-full",
      [
        code[0] === "W" ? "Warm" : "Cool",
        code[1] === "E" ? "Everyday" : "Unique",
        code[2] === "P" ? "Puppy" : "Kitty",
        code[3] === "L" ? "Large" : "Medium",
      ].join(" "),
    );
    setText("#type-name", data.name);
    setText("#type-description", data.description);

    const characterImage = qs("#result-character-image");
    if (characterImage) {
      characterImage.src = `./assets/characters/${code}.png`;
      characterImage.alt = `${code} 유형 캐릭터`;
    }

    const axisValues = {
      "#axis-wc": code[0] === "W" ? 27 : 73,
      "#axis-eu": code[1] === "E" ? 27 : 73,
      "#axis-pk": code[2] === "P" ? 27 : 73,
      "#axis-lm": code[3] === "L" ? 27 : 73,
    };

    Object.entries(axisValues).forEach(([selector, score]) => {
      const dot = qs(selector);
      if (dot) {
        dot.style.left = `${score}%`;
      }
    });
  }

  function updateColorChips(result) {
    const skinFeature = result?.analysis?.color_features?.skin || {};
    const irisFeature = result?.analysis?.color_features?.iris || {};
    const skin = normalizeHex(skinFeature.hex || result?.analysis?.skinColor, "#C9A2A4");
    const iris = normalizeHex(irisFeature.hex || result?.analysis?.irisColor, "#3C282B");
    const lens = normalizeHex(selectedLensColor, DEFAULT_LENS_COLOR);
    const tone = result?.analysis?.irisTone || `${irisFeature.dark_light || ""}-${irisFeature.warm_cool || ""}`.replace(/^-|-$/g, "") || "unknown";
    const chips = qs(".result-color-chips");

    if (!chips) {
      return;
    }

    chips.innerHTML = `
      <span style="--chip:${skin}"><small>SKIN</small><b>${skin.replace("#", "")}</b></span>
      <span style="--chip:${iris}"><small>IRIS</small><b>${iris.replace("#", "")}</b></span>
      <span style="--chip:${lens}"><small>LENS</small><b>${lens.replace("#", "")}</b></span>
      <span style="--chip:${iris}"><small>TONE</small><b>${tone}</b></span>
    `;
  }

  function updateAnalysisList(result) {
    const list = qs(".result-analysis-list");
    if (!list) {
      return;
    }

    const skin = result?.analysis?.color_features?.skin || {};
    const iris = result?.analysis?.color_features?.iris || {};
    const ratio = result?.analysis?.average_eye_to_face_width_ratio;
    const eyes = result?.eyes || [];
    const irisRatio = eyes.length
      ? eyes.map((eye) => Number(eye.visible_iris_to_eye_width_ratio || 0)).filter(Boolean)
      : [];
    const averageIrisRatio = irisRatio.length
      ? irisRatio.reduce((sum, value) => sum + value, 0) / irisRatio.length
      : null;

    list.innerHTML = `
      <div><dt>피부톤</dt><dd>${normalizeHex(skin.hex || result?.analysis?.skinColor, "#C9A2A4")} / ${result?.analysis?.skinTone || `${skin.warm_cool || ""}-${skin.dark_light || ""}`.replace(/^-|-$/g, "") || "unknown"}</dd></div>
      <div><dt>홍채</dt><dd>${normalizeHex(iris.hex || result?.analysis?.irisColor, "#3C282B")} / ${result?.analysis?.irisTone || `${iris.dark_light || ""}-${iris.warm_cool || ""}`.replace(/^-|-$/g, "") || "unknown"}</dd></div>
      <div><dt>눈/얼굴 비율</dt><dd>${ratio ? `${(ratio * 100).toFixed(2)}%` : "측정 안 됨"}</dd></div>
      <div><dt>홍채/눈 비율</dt><dd>${averageIrisRatio ? `${(averageIrisRatio * 100).toFixed(2)}%` : "측정 안 됨"}</dd></div>
      <div><dt>추천 기준</dt><dd>${result?.analysis?.appearance_style?.style_hint || "사진 기반 비율과 컬러 분석"}</dd></div>
    `;
  }

  function updateResultImages(result) {
    const previewUrl = result?.artifacts?.tryon_preview_url
      || result?.artifacts?.annotated_image_url
      || "";

    const irisImage = qs("#result-iris-image");
    const irisPlaceholder = qs("#result-iris-placeholder");
    const irisPreview = qs("#result-iris-preview");
    const ringLabel = qs(".result-iris-ring b");

    if (irisImage && previewUrl) {
      irisImage.src = cacheBust(previewUrl);
      irisImage.hidden = false;
    }

    if (irisPlaceholder && previewUrl) {
      irisPlaceholder.hidden = true;
    }

    irisPreview?.classList.remove("is-empty");

    if (ringLabel) {
      ringLabel.textContent = "AI 분석 완료";
    }

    const tryOnImage = qs("#tryon-result-image");
    const tryOnPlaceholder = qs("#tryon-result-placeholder");
    if (tryOnImage && previewUrl) {
      tryOnImage.src = cacheBust(previewUrl);
      tryOnImage.hidden = false;
    }

    if (tryOnPlaceholder && previewUrl) {
      tryOnPlaceholder.hidden = true;
    }
  }

  function storeAiResult(result) {
    window.lensiaAiAnalysis = result;
    sessionStorage.setItem("lensiaAiAnalysis", JSON.stringify(result));

    const code = codeFromAiResult(result);
    const originalGetTypeCode = window.lensiaOriginalGetTypeCode || window.getTypeCode;
    window.lensiaOriginalGetTypeCode = originalGetTypeCode;
    window.getTypeCode = () => code;
  }

  function applyAiResult(result) {
    if (!result) {
      return;
    }

    storeAiResult(result);
    applyAiType(result);
    updateColorChips(result);
    updateAnalysisList(result);
    updateResultImages(result);
    setText("#iris-result-status", "· AI 이미지 분석 포함 결과");
  }

  function restoreAiResult() {
    const saved = sessionStorage.getItem("lensiaAiAnalysis");
    if (!saved) {
      return;
    }

    try {
      applyAiResult(JSON.parse(saved));
    } catch (error) {
      console.warn("저장된 AI 분석 결과를 불러오지 못했습니다.", error);
    }
  }

  function setIrisLoading(isLoading) {
    const loading = qs("#iris-analysis-loading");
    const button = qs("#iris-analyze-button");
    const buttonText = qs("#iris-analyze-button-text");

    if (loading) {
      loading.hidden = !isLoading;
    }

    if (button) {
      button.disabled = isLoading;
    }

    if (buttonText) {
      buttonText.textContent = isLoading ? "AI 분석 중..." : "홍채 이미지 분석하기";
    }
  }

  async function handleIrisAnalyze(event) {
    const file = getFileFromIrisPage();
    if (!file) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (analyzing) {
      return;
    }

    selectedImageFile = file;
    window.lensiaSelectedImageFile = file;
    analyzing = true;
    setIrisLoading(true);

    try {
      const result = await postAnalyze(file, selectedLensColor);
      applyAiResult(result);

      window.lensiaIrisState = {
        analyzed: true,
        skipped: false,
        hasImage: true,
        fileName: file.name,
      };
      sessionStorage.setItem("lensiaIrisState", JSON.stringify(window.lensiaIrisState));

      if (typeof window.showPage === "function") {
        window.showPage("result");
        window.setTimeout(() => applyAiResult(result), 0);
      }
    } catch (error) {
      showToast(`AI 분석 실패: ${error.message}`);
    } finally {
      analyzing = false;
      setIrisLoading(false);
    }
  }

  function previewTryOnOriginal(file) {
    if (!file) {
      return;
    }

    selectedImageFile = file;
    window.lensiaSelectedImageFile = file;

    const url = URL.createObjectURL(file);
    const image = qs("#tryon-original-image");
    const placeholder = qs("#tryon-original-placeholder");
    const analyzeButton = qs("#tryon-analyze-button");

    if (image) {
      image.src = url;
      image.hidden = false;
    }

    if (placeholder) {
      placeholder.hidden = true;
    }

    if (analyzeButton) {
      analyzeButton.disabled = false;
    }

    setText("#tryon-file-status", `선택한 이미지: ${file.name}`);
  }

  async function runTryOnAnalyze(file, lensColor = selectedLensColor) {
    if (!file) {
      showToast("먼저 얼굴 사진을 업로드하거나 카메라로 촬영해 주세요.");
      return;
    }

    if (analyzing) {
      return;
    }

    analyzing = true;
    const analyzeButton = qs("#tryon-analyze-button");
    if (analyzeButton) {
      analyzeButton.disabled = true;
      analyzeButton.textContent = "AI 가상 착용 생성 중...";
    }

    try {
      const result = await postAnalyze(file, lensColor);
      applyAiResult(result);
      showToast("AI 가상 착용 결과가 업데이트됐어요.");
    } catch (error) {
      showToast(`가상 착용 실패: ${error.message}`);
    } finally {
      analyzing = false;
      if (analyzeButton) {
        analyzeButton.disabled = false;
        analyzeButton.innerHTML = "홍채 이미지 분석하기 <b>→</b>";
      }
    }
  }

  function bindIrisPage() {
    const analyzeButton = qs("#iris-analyze-button");
    analyzeButton?.addEventListener("click", handleIrisAnalyze, true);

    ["#iris-file-input", "#iris-camera-input"].forEach((selector) => {
      qs(selector)?.addEventListener("change", (event) => {
        const file = event.target.files?.[0] || null;
        if (file) {
          selectedImageFile = file;
          window.lensiaSelectedImageFile = file;
        }
      });
    });
  }

  function bindTryOnPage() {
    ["#tryon-file-input", "#tryon-camera-input"].forEach((selector) => {
      qs(selector)?.addEventListener("change", (event) => {
        const file = event.target.files?.[0] || null;
        previewTryOnOriginal(file);
      });
    });

    qs("#tryon-analyze-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      runTryOnAnalyze(getFileFromTryOnPage(), selectedLensColor);
    }, true);

    qsa(".result-try-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const card = button.closest(".result-product-card");
        selectedLensColor = lensColorById[card?.dataset?.lensId] || DEFAULT_LENS_COLOR;
        window.lensiaSelectedLensColor = selectedLensColor;

        const file = getFileFromTryOnPage();
        if (file) {
          event.preventDefault();
          event.stopImmediatePropagation();
          runTryOnAnalyze(file, selectedLensColor);
          return;
        }

        showToast("렌즈를 골랐어요. 아래에서 사진을 업로드하면 바로 가상 착용됩니다.");
      }, true);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindIrisPage();
    bindTryOnPage();
    restoreAiResult();
  });

  window.addEventListener("hashchange", restoreAiResult);
})();
