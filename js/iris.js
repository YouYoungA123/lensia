/* =========================================================
   LENSIA IRIS ANALYSIS PAGE
   현재는 API 없이 이미지 선택, 미리보기, 페이지 이동만 처리합니다.
========================================================= */

(() => {
  "use strict";

  const uploadButton = document.querySelector("#iris-upload-button");
  const cameraButton = document.querySelector("#iris-camera-button");

  const fileInput = document.querySelector("#iris-file-input");
  const cameraInput = document.querySelector("#iris-camera-input");

  const previewBox = document.querySelector("#iris-preview-box");
  const previewImage = document.querySelector("#iris-preview-image");
  const previewPlaceholder = document.querySelector(
    "#iris-preview-placeholder"
  );

  const fileStatus = document.querySelector(".iris-file-status");
  const fileStatusIcon = document.querySelector(
    "#iris-file-status-icon"
  );
  const fileStatusText = document.querySelector(
    "#iris-file-status-text"
  );

  const analyzeButton = document.querySelector(
    "#iris-analyze-button"
  );
  const analyzeButtonText = document.querySelector(
    "#iris-analyze-button-text"
  );

  const skipButton = document.querySelector("#iris-skip-button");
  const removeButton = document.querySelector(
    "#iris-remove-button"
  );

  const loadingLayer = document.querySelector(
    "#iris-analysis-loading"
  );

  let selectedFile = null;
  let previewUrl = null;
  let isAnalyzing = false;

  /*
   * 다른 파일에서도 홍채 분석 여부를 확인할 수 있도록
   * 간단한 전역 상태를 만들어 둡니다.
   */
  window.lensiaIrisState = {
    analyzed: false,
    skipped: false,
    hasImage: false,
    fileName: "",
  };

  function openUploadPicker() {
    if (!fileInput) {
      return;
    }

    fileInput.value = "";
    fileInput.click();
  }

  function openCameraPicker() {
    if (!cameraInput) {
      return;
    }

    cameraInput.value = "";
    cameraInput.click();
  }

  function releasePreviewUrl() {
    if (!previewUrl) {
      return;
    }

    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  function setSelectedFile(file) {
    if (!file) {
      resetSelectedFile();
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("이미지 파일만 선택할 수 있어요.");
      resetSelectedFile();
      return;
    }

    selectedFile = file;

    releasePreviewUrl();
    previewUrl = URL.createObjectURL(file);

    if (previewImage) {
      previewImage.src = previewUrl;
      previewImage.hidden = false;
    }

    if (previewPlaceholder) {
      previewPlaceholder.hidden = true;
    }

    if (previewBox) {
      previewBox.classList.add("has-image");
    }

    if (removeButton) {
      removeButton.hidden = false;
    }

    if (analyzeButton) {
      analyzeButton.disabled = false;
    }

    if (fileStatus) {
      fileStatus.classList.add("has-file");
    }

    if (fileStatusIcon) {
      fileStatusIcon.textContent = "✓";
    }

    if (fileStatusText) {
      fileStatusText.textContent = file.name;
    }

    window.lensiaIrisState.hasImage = true;
    window.lensiaIrisState.fileName = file.name;
    window.lensiaIrisState.skipped = false;
  }

  function resetSelectedFile() {
    selectedFile = null;

    releasePreviewUrl();

    if (fileInput) {
      fileInput.value = "";
    }

    if (cameraInput) {
      cameraInput.value = "";
    }

    if (previewImage) {
      previewImage.removeAttribute("src");
      previewImage.hidden = true;
    }

    if (previewPlaceholder) {
      previewPlaceholder.hidden = false;
    }

    if (previewBox) {
      previewBox.classList.remove("has-image");
    }

    if (removeButton) {
      removeButton.hidden = true;
    }

    if (analyzeButton) {
      analyzeButton.disabled = true;
    }

    if (fileStatus) {
      fileStatus.classList.remove("has-file");
    }

    if (fileStatusIcon) {
      fileStatusIcon.textContent = "○";
    }

    if (fileStatusText) {
      fileStatusText.textContent =
        "아직 선택된 이미지가 없어요.";
    }

    window.lensiaIrisState.analyzed = false;
    window.lensiaIrisState.skipped = false;
    window.lensiaIrisState.hasImage = false;
    window.lensiaIrisState.fileName = "";
  }

  function goToResultPage() {
    if (typeof window.showPage === "function") {
      window.showPage("result");
      return;
    }

    /*
     * showPage가 전역으로 연결되지 않은 경우를 위한 예비 처리
     */
    window.location.hash = "result";
    window.location.reload();
  }

  function startTemporaryAnalysis() {
    if (!selectedFile || isAnalyzing) {
      return;
    }

    isAnalyzing = true;

    if (loadingLayer) {
      loadingLayer.hidden = false;
    }

    if (analyzeButton) {
      analyzeButton.disabled = true;
    }

    if (analyzeButtonText) {
      analyzeButtonText.textContent = "이미지 분석 중";
    }

    /*
     * 현재는 실제 API가 없으므로
     * 약 1.2초 동안 분석 화면만 보여준 뒤 결과로 이동합니다.
     *
     * 추후 친구가 API를 연결할 때 이 setTimeout 부분을
     * fetch API 호출로 교체하면 됩니다.
     */
    window.setTimeout(() => {
      window.lensiaIrisState.analyzed = true;
      window.lensiaIrisState.skipped = false;
      window.lensiaIrisState.hasImage = true;
      window.lensiaIrisState.fileName = selectedFile.name;

      sessionStorage.setItem(
        "lensiaIrisState",
        JSON.stringify(window.lensiaIrisState)
      );

      if (loadingLayer) {
        loadingLayer.hidden = true;
      }

      if (analyzeButtonText) {
        analyzeButtonText.textContent =
          "홍채 이미지 분석하기";
      }

      isAnalyzing = false;
      goToResultPage();
    }, 1200);
  }

  function skipIrisAnalysis() {
    if (isAnalyzing) {
      return;
    }

    window.lensiaIrisState.analyzed = false;
    window.lensiaIrisState.skipped = true;
    window.lensiaIrisState.hasImage = Boolean(selectedFile);
    window.lensiaIrisState.fileName =
      selectedFile?.name ?? "";

    sessionStorage.setItem(
      "lensiaIrisState",
      JSON.stringify(window.lensiaIrisState)
    );

    goToResultPage();
  }

  uploadButton?.addEventListener("click", openUploadPicker);
  cameraButton?.addEventListener("click", openCameraPicker);

  fileInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  });

  cameraInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  });

  removeButton?.addEventListener("click", resetSelectedFile);
  analyzeButton?.addEventListener(
    "click",
    startTemporaryAnalysis
  );
  skipButton?.addEventListener("click", skipIrisAnalysis);

  window.addEventListener("beforeunload", releasePreviewUrl);
})();