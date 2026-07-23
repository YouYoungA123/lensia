/* =========================================================
   LENSIA AI BRIDGE
   Connects the latest UI from lensia-site to the local Python API.
========================================================= */

(() => {
  "use strict";

  const DEFAULT_LENS_COLOR = "#8B5E3C";

  const lensColors = {
    veilBrown: "#8B5E3C",
    veilChoco: "#5B3929",
    veilAsh: "#7A746F",
    veilOlive: "#74724F",
    warmHoney: "#C98A36",
    warmHazel: "#A66A32",
    coolGrayBrown: "#7B7470",
    coolRoseGray: "#9A7A80",
    puppyAlmond: "#B57A45",
    puppyMilkBrown: "#B08A6A",
    puppyPinkBrown: "#B98586",
    puppyOliveCream: "#8C8A62",
    kittyAshChoco: "#5F504B",
    kittyHazelEdge: "#996334",
    kittyGray: "#777A80",
    kittyVioletSmoke: "#756D87",
    flashHoneyGlow: "#D09A3D",
    flashOlivePop: "#758046",
    flashBlueGray: "#657B91",
    flashLavenderHaze: "#8D7FA0",
  };

  let selectedImageFile = null;
  let selectedLensColor = DEFAULT_LENS_COLOR;
  let selectedLensId = null;
  let selectedLensAsset = "";
  let analyzing = false;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setText(selector, value) {
    const element = qs(selector);
    if (element) {
      element.textContent = value;
    }
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

  function normalizeHex(value, fallback = DEFAULT_LENS_COLOR) {
    if (!value || typeof value !== "string") {
      return fallback;
    }

    const trimmed = value.trim();
    return trimmed.startsWith("#")
      ? trimmed.toUpperCase()
      : `#${trimmed.toUpperCase()}`;
  }

  function lensAssetFromId(lensId) {
    if (!lensId) {
      return "";
    }

    if (lensId === "puppyPinkBrown") {
      return "assets/lenses-api/puppy-milk-brown.png";
    }

    const fileName = String(lensId).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    return `assets/lenses-api/${fileName}.png`;
  }

  function cacheBust(url) {
    if (!url) {
      return "";
    }

    return `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  }

  function dataUrlToFile(dataUrl, fileName) {
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const binary = atob(parts[1]);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new File([bytes], fileName, { type: mime });
  }

  function setIrisPreview(file) {
    const previewImage = qs("#iris-preview-image");
    const previewPlaceholder = qs("#iris-preview-placeholder");
    const previewBox = qs("#iris-preview-box");
    const removeButton = qs("#iris-remove-button");
    const analyzeButton = qs("#iris-analyze-button");
    const fileStatus = qs(".iris-file-status");
    const fileStatusIcon = qs("#iris-file-status-icon");

    selectedImageFile = file;
    window.lensiaSelectedImageFile = file;

    if (previewImage) {
      previewImage.src = URL.createObjectURL(file);
      previewImage.hidden = false;
    }

    if (previewPlaceholder) {
      previewPlaceholder.hidden = true;
    }

    previewBox?.classList.add("has-image");

    if (removeButton) {
      removeButton.hidden = false;
    }

    if (analyzeButton) {
      analyzeButton.disabled = false;
    }

    fileStatus?.classList.add("has-file");

    if (fileStatusIcon) {
      fileStatusIcon.textContent = "●";
    }

    setText("#iris-file-status-text", file.name);
  }

  function stopStream(stream) {
    stream?.getTracks().forEach((track) => track.stop());
  }

  function closeCameraModal(modal, stream) {
    stopStream(stream);
    modal?.remove();
  }

  function createCameraModal(stream, target) {
    const modal = document.createElement("div");
    modal.className = "lensia-camera-modal";
    modal.innerHTML = `
      <div class="lensia-camera-panel" role="dialog" aria-modal="true" aria-label="카메라 촬영">
        <div class="lensia-camera-head">
          <strong>카메라 촬영</strong>
          <button type="button" class="lensia-camera-close" aria-label="닫기">×</button>
        </div>
        <video class="lensia-camera-video" autoplay playsinline muted></video>
        <div class="lensia-camera-actions">
          <button type="button" class="lensia-camera-shot">사진 찍기</button>
          <button type="button" class="lensia-camera-cancel">취소</button>
        </div>
        <p class="lensia-camera-note">얼굴이 정면으로 보이게 맞춘 뒤 촬영해 주세요.</p>
      </div>
    `;

    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "9999",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      background: "rgba(28, 24, 34, 0.58)",
      backdropFilter: "blur(8px)",
    });

    const panel = modal.querySelector(".lensia-camera-panel");
    Object.assign(panel.style, {
      width: "min(720px, 94vw)",
      borderRadius: "28px",
      padding: "20px",
      background: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 24px 80px rgba(30, 24, 40, 0.28)",
    });

    const head = modal.querySelector(".lensia-camera-head");
    Object.assign(head.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px",
      color: "#2f2b35",
      fontSize: "18px",
    });

    const video = modal.querySelector(".lensia-camera-video");
    Object.assign(video.style, {
      width: "100%",
      maxHeight: "62vh",
      borderRadius: "20px",
      background: "#111",
      objectFit: "cover",
    });

    const actions = modal.querySelector(".lensia-camera-actions");
    Object.assign(actions.style, {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      marginTop: "16px",
    });

    modal.querySelectorAll("button").forEach((button) => {
      Object.assign(button.style, {
        border: "0",
        borderRadius: "999px",
        padding: "12px 18px",
        fontWeight: "800",
        cursor: "pointer",
      });
    });

    const shotButton = modal.querySelector(".lensia-camera-shot");
    Object.assign(shotButton.style, {
      background: "linear-gradient(135deg, #9f95ff, #7d6ce8)",
      color: "#fff",
    });

    const closeButton = modal.querySelector(".lensia-camera-close");
    const cancelButton = modal.querySelector(".lensia-camera-cancel");
    const note = modal.querySelector(".lensia-camera-note");
    Object.assign(note.style, {
      margin: "12px 0 0",
      textAlign: "center",
      color: "#77717f",
      fontSize: "13px",
    });

    video.srcObject = stream;

    const close = () => closeCameraModal(modal, stream);
    closeButton.addEventListener("click", close);
    cancelButton.addEventListener("click", close);

    shotButton.addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      const file = dataUrlToFile(
        canvas.toDataURL("image/jpeg", 0.92),
        `camera-${Date.now()}.jpg`,
      );

      if (target === "tryon") {
        previewOriginal(file);
      } else {
        setIrisPreview(file);
      }

      close();
    });

    document.body.appendChild(modal);
  }

  async function openCamera(target) {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast("이 브라우저에서는 카메라 촬영을 지원하지 않아요. 사진 업로드를 사용해 주세요.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: target === "tryon" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      createCameraModal(stream, target);
    } catch (error) {
      console.warn("Camera permission or device error", error);
      showToast("카메라를 열 수 없어요. 브라우저 권한을 허용하거나 사진 업로드를 사용해 주세요.");
    }
  }

  function fileFromInputs(selectors) {
    for (const selector of selectors) {
      const file = qs(selector)?.files?.[0];
      if (file) {
        return file;
      }
    }

    return selectedImageFile || window.lensiaSelectedImageFile || null;
  }

  function codeFromAiResult(result) {
    const hint = result?.analysis?.lpti_hint || {};
    const warmCool = hint.warm_cool || hint.color_temperature || "";
    const everydayUnique = hint.everyday_unique || hint.style || "";
    const puppyKitty = hint.puppy_kitty || hint.eye_impression || "";
    const largeMedium = hint.large_medium || hint.size || "";

    const color = String(warmCool).toLowerCase().startsWith("cool") ? "C" : "W";
    const style = String(everydayUnique).toLowerCase().startsWith("unique") ? "U" : "E";
    const impression = String(puppyKitty).toLowerCase().startsWith("kitty") ? "K" : "P";
    const size = String(largeMedium).toLowerCase().startsWith("medium") ? "M" : "L";

    return `${color}${style}${impression}${size}`;
  }

  function hsvFromFeature(feature) {
    const hsv = feature?.hsv || {};
    return {
      h: Number(hsv.h || 0),
      s: Number(hsv.s || 0),
      v: Number(hsv.v || 0),
    };
  }

  function uiResultFromApi(result, lensColor = selectedLensColor) {
    const analysis = result?.analysis || {};
    const skinFeature = analysis.color_features?.skin || {};
    const irisFeature = analysis.color_features?.iris || {};
    const eyeFaceRatio = Number(analysis.average_eye_to_face_width_ratio || 0) * 100;
    const irisEyeRatio = Number(analysis.average_visible_iris_to_eye_width_ratio || 0) * 100;

    return {
      skinColor: normalizeHex(skinFeature.hex || analysis.skinColor, "#C9A2A4"),
      skinTone: analysis.skinTone || `${skinFeature.warm_cool || "unknown"}-${skinFeature.dark_light || "tone"}`,
      irisColor: normalizeHex(irisFeature.hex || analysis.irisColor, "#3C282B"),
      irisTone: analysis.irisTone || `${irisFeature.dark_light || "unknown"}-${irisFeature.warm_cool || "tone"}`,
      lensColor: normalizeHex(lensColor),
      toneColor: normalizeHex(irisFeature.hex || analysis.irisColor, "#3C282B"),
      eyeFaceRatio: Number.isFinite(eyeFaceRatio) ? eyeFaceRatio : null,
      irisEyeRatio: Number.isFinite(irisEyeRatio) ? irisEyeRatio : null,
      skinHsv: hsvFromFeature(skinFeature),
      irisHsv: hsvFromFeature(irisFeature),
      lptiCode: codeFromAiResult(result),
      styleHint: analysis.appearance_style?.style_hint || "",
    };
  }

  function storeTypeOverride(result) {
    const code = codeFromAiResult(result);
    window.lensiaAiTypeCode = code;

    if (!window.lensiaOriginalGetTypeCode && typeof window.getTypeCode === "function") {
      window.lensiaOriginalGetTypeCode = window.getTypeCode;
    }

    window.getTypeCode = () => code;
  }

  function storeResults(result, lensColor = selectedLensColor) {
    const uiResult = uiResultFromApi(result, lensColor);

    window.lensiaAiAnalysis = result;
    window.lensiaIrisAnalysisResult = uiResult;

    sessionStorage.setItem("lensiaAiAnalysis", JSON.stringify(result));
    sessionStorage.setItem("lensiaIrisAnalysisResult", JSON.stringify(uiResult));
    sessionStorage.setItem(
      "lensiaIrisState",
      JSON.stringify({
        analyzed: true,
        skipped: false,
        hasImage: true,
        fileName: selectedImageFile?.name || "",
      }),
    );

    storeTypeOverride(result);
    return uiResult;
  }

  function updateImages(result) {
    const previewUrl =
      result?.artifacts?.tryon_preview_url ||
      result?.artifacts?.annotated_image_url ||
      "";

    if (!previewUrl) {
      return;
    }

    const resultIrisImage = qs("#result-iris-image");
    const resultIrisPlaceholder = qs("#result-iris-placeholder");
    const resultIrisPreview = qs("#result-iris-preview");
    const ringLabel = qs(".result-iris-ring b");
    const tryOnImage = qs("#tryon-result-image");
    const tryOnPlaceholder = qs("#tryon-result-placeholder");

    if (resultIrisImage) {
      resultIrisImage.src = cacheBust(previewUrl);
      resultIrisImage.hidden = false;
    }

    if (resultIrisPlaceholder) {
      resultIrisPlaceholder.hidden = true;
    }

    resultIrisPreview?.classList.remove("is-empty");

    if (ringLabel) {
      ringLabel.textContent = "AI 분석 완료";
    }

    if (tryOnImage) {
      tryOnImage.src = cacheBust(previewUrl);
      tryOnImage.hidden = false;
    }

    if (tryOnPlaceholder) {
      tryOnPlaceholder.hidden = true;
    }
  }

  function applyResultToLatestUi(result, lensColor = selectedLensColor) {
    const uiResult = storeResults(result, lensColor);

    if (typeof window.renderIrisAnalysisResult === "function") {
      window.renderIrisAnalysisResult(uiResult);
    }

    updateImages(result);
    setText("#iris-result-status", "· AI 이미지 분석 포함 결과");

    if (typeof window.updateResult === "function") {
      window.updateResult();
      window.setTimeout(() => {
        if (typeof window.renderIrisAnalysisResult === "function") {
          window.renderIrisAnalysisResult(uiResult);
        }
        updateImages(result);
        setText("#iris-result-status", "· AI 이미지 분석 포함 결과");
      }, 0);
    }
  }

  async function postAnalyze(file, lensColor = selectedLensColor) {
    if (!file) {
      throw new Error("분석할 이미지가 없습니다.");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("lens_color", normalizeHex(lensColor));
    formData.append("graphic_scale", "1.0");
    formData.append("tryon_alpha", selectedLensAsset ? "0.52" : "0.38");

    if (selectedLensAsset) {
      formData.append("lens_asset", selectedLensAsset);
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || `분석 요청 실패 (${response.status})`);
    }

    return payload.result;
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

  async function analyzeFromIrisPage(event) {
    const file = fileFromInputs(["#iris-file-input", "#iris-camera-input"]);
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
      applyResultToLatestUi(result, selectedLensColor);

      if (typeof window.showPage === "function") {
        window.showPage("result");
        window.setTimeout(() => applyResultToLatestUi(result, selectedLensColor), 0);
      }
    } catch (error) {
      showToast(`AI 분석 실패: ${error.message}`);
    } finally {
      analyzing = false;
      setIrisLoading(false);
    }
  }

  function previewOriginal(file) {
    if (!file) {
      return;
    }

    selectedImageFile = file;
    window.lensiaSelectedImageFile = file;

    const originalImage = qs("#tryon-original-image");
    const originalPlaceholder = qs("#tryon-original-placeholder");
    const analyzeButton = qs("#tryon-analyze-button");
    const imageUrl = URL.createObjectURL(file);

    if (originalImage) {
      originalImage.src = imageUrl;
      originalImage.hidden = false;
    }

    if (originalPlaceholder) {
      originalPlaceholder.hidden = true;
    }

    if (analyzeButton) {
      analyzeButton.disabled = false;
    }

    setText("#tryon-file-status", `선택한 이미지: ${file.name}`);
  }

  async function runTryOn(file, lensColor = selectedLensColor) {
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
      applyResultToLatestUi(result, lensColor);
      showToast("AI 가상 착용 결과가 업데이트됐어요.");
    } catch (error) {
      showToast(`가상 착용 실패: ${error.message}`);
    } finally {
      analyzing = false;

      if (analyzeButton) {
        analyzeButton.disabled = false;
        analyzeButton.innerHTML = "홍채 이미지 분석하기 <b>›</b>";
      }
    }
  }

  function updateSelectedLensFromButton(button) {
    const card = button.closest(".result-product-card");
    const lensId = button.dataset.lensId || card?.dataset?.lensId || null;

    selectedLensId = lensId;
    selectedLensColor = lensColors[lensId] || DEFAULT_LENS_COLOR;
    selectedLensAsset = lensAssetFromId(lensId);
    window.lensiaSelectedLensId = selectedLensId;
    window.lensiaSelectedLensColor = selectedLensColor;
    window.lensiaSelectedLensAsset = selectedLensAsset;
  }

  function restoreSavedAiResult() {
    const saved = sessionStorage.getItem("lensiaAiAnalysis");
    if (!saved) {
      return;
    }

    try {
      const result = JSON.parse(saved);
      storeTypeOverride(result);
      updateImages(result);
      setText("#iris-result-status", "· AI 이미지 분석 포함 결과");
    } catch (error) {
      console.warn("AI 분석 결과를 복원하지 못했습니다.", error);
    }
  }

  function bindInputs() {
    ["#iris-file-input", "#iris-camera-input", "#tryon-file-input", "#tryon-camera-input"].forEach((selector) => {
      qs(selector)?.addEventListener("change", (event) => {
        const file = event.target.files?.[0] || null;

        if (file) {
          selectedImageFile = file;
          window.lensiaSelectedImageFile = file;
        }

        if (selector.startsWith("#tryon")) {
          previewOriginal(file);
        }
      });
    });
  }

  function bindActions() {
    qs("#iris-camera-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCamera("iris");
    }, true);

    qs("#tryon-camera-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCamera("tryon");
    }, true);

    qs("#iris-analyze-button")?.addEventListener("click", analyzeFromIrisPage, true);

    qs("#tryon-analyze-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      runTryOn(
        fileFromInputs(["#tryon-file-input", "#tryon-camera-input"]),
        selectedLensColor,
      );
    }, true);

    qsa(".result-try-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        updateSelectedLensFromButton(button);

        const file = fileFromInputs(["#tryon-file-input", "#tryon-camera-input"]);
        if (file) {
          event.preventDefault();
          event.stopImmediatePropagation();
          runTryOn(file, selectedLensColor);
          return;
        }

        showToast("렌즈를 선택했어요. 아래에서 사진을 올리면 바로 가상 착용됩니다.");
      }, true);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindInputs();
    bindActions();
    restoreSavedAiResult();
  });

  window.addEventListener("hashchange", restoreSavedAiResult);
})();
