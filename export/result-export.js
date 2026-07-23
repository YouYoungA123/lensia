/* =========================================================
   LENSIA 결과 이미지 저장 전용 JS
   파일 위치: export/result-export.js
========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    saveButton: "#save-result-image",
    result: ".result-dashboard",
    width: 1400,
    scale: 1.5,
    filePrefix: "LENSIA_LPTI_RESULT",
    html2canvasUrl:
      "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
  };

  let exporting = false;
  let html2canvasPromise = null;

  function init() {
    const button = document.querySelector(CONFIG.saveButton);

    if (!button || button.dataset.exportInitialized === "true") {
      return;
    }

    button.dataset.exportInitialized = "true";
    button.addEventListener("click", saveResultImage);
  }

  async function saveResultImage(event) {
    event.preventDefault();

    if (exporting) {
      return;
    }

    const button = event.currentTarget;
    let stage = null;

    try {
      exporting = true;
      setButtonLoading(button, true);
      showMessage("결과 이미지를 만들고 있어요.");

      const original = document.querySelector(CONFIG.result);

      if (!original) {
        throw new Error(
          `저장할 영역을 찾지 못했습니다: ${CONFIG.result}`,
        );
      }

      await loadHtml2Canvas();
      await waitForFonts();
      await waitForImages(original);

      stage = createExportStage(original);

      await waitForImages(stage);
      await nextFrames(3);

      const target = stage.querySelector(
        ".lensia-export-mode",
      );

      if (!target) {
        throw new Error(
          "저장용 결과 영역 생성에 실패했습니다.",
        );
      }

      const height = Math.ceil(
        Math.max(
          target.scrollHeight,
          target.getBoundingClientRect().height,
        ),
      );

      const canvas = await window.html2canvas(target, {
        backgroundColor: "#f9f9f9",

        scale: CONFIG.scale,

        useCORS: true,
        allowTaint: false,

        logging: false,
        imageTimeout: 15000,

        width: CONFIG.width,
        windowWidth: CONFIG.width,

        height,
        windowHeight: height,

        scrollX: 0,
        scrollY: 0,

        x: 0,
        y: 0,

        foreignObjectRendering: false,
        removeContainer: true,

        onclone(clonedDocument) {
          const clonedTarget =
            clonedDocument.querySelector(
              ".lensia-export-mode",
            );

          if (!clonedTarget) {
            return;
          }

          clonedTarget.style.width =
            `${CONFIG.width}px`;

          clonedTarget.style.minWidth =
            `${CONFIG.width}px`;

          clonedTarget.style.maxWidth = "none";
        },
      });

      await downloadCanvas(canvas);

      showMessage("결과 이미지가 저장되었어요.");
    } catch (error) {
      console.error(
        "[LENSIA EXPORT] 저장 오류",
        error,
      );

      showMessage(
        "이미지 저장에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      stage?.remove();

      exporting = false;
      setButtonLoading(button, false);
    }
  }

  function createExportStage(original) {
    const stage = document.createElement("div");

    stage.className = "lensia-export-stage";
    stage.setAttribute("aria-hidden", "true");

    const clone = original.cloneNode(true);

    clone.classList.add("lensia-export-mode");

    /*
     * 원본과 복제본 구조가 같을 때
     * 동적 상태부터 복사합니다.
     */
    copyFormValues(original, clone);
    copyCanvasContents(original, clone);
    copyVideoFrames(original, clone);

    /*
     * 저장본에서 조작용 UI를 제거합니다.
     */
    removeExcludedElements(clone);

    /*
     * 가상 착용 좌우 패널과 화살표에
     * 저장 전용 클래스를 추가합니다.
     */
    prepareTryOnLayout(clone);

    /*
     * 원본과 ID 충돌 방지
     */
    renameIds(clone);

    stage.appendChild(clone);
    document.body.appendChild(stage);

    return stage;
  }

  function removeExcludedElements(container) {
    const selectors = [
      ".result-bottom-actions",

      "#restart-test",
      "#save-result-image",

      ".result-placeholder-button",
      ".result-detail-button",
      ".result-try-button",

      "#tryon-camera-button",
      "#tryon-upload-button",
      "#tryon-analyze-button",

      "#tryon-camera-input",
      "#tryon-file-input",
      "#tryon-file-status",

      /*
       * 가상 착용 왼쪽 조작 패널 전체 제거
       */
      ".result-tryon-control",

      "[data-export-exclude]",
    ];

    selectors.forEach((selector) => {
      container
        .querySelectorAll(selector)
        .forEach((element) => {
          element.remove();
        });
    });
  }

  function prepareTryOnLayout(container) {
    const wrap = container.querySelector(
      ".result-tryon-preview-wrap",
    );

    if (!wrap) {
      console.warn(
        "[LENSIA EXPORT] .result-tryon-preview-wrap 없음",
      );

      return;
    }

    /*
     * 기존 클래스가 정상적으로 붙어 있는 경우
     */
    const knownPanels = Array.from(
      wrap.querySelectorAll(
        ":scope > .result-tryon-preview",
      ),
    );

    const knownArrow = wrap.querySelector(
      [
        ":scope > .result-tryon-arrow",
        ":scope > .tryon-arrow",
        ":scope > .result-preview-arrow",
      ].join(", "),
    );

    if (knownPanels.length >= 2) {
      knownPanels[0].classList.add(
        "lensia-export-tryon-panel",
      );

      knownPanels[
        knownPanels.length - 1
      ].classList.add(
        "lensia-export-tryon-panel",
      );

      knownArrow?.classList.add(
        "lensia-export-tryon-arrow",
      );

      if (knownArrow) {
        knownArrow.textContent = "›";
        knownArrow.setAttribute(
          "aria-label",
          "가상 착용 결과 방향",
        );

        wrap.appendChild(knownArrow);
      }

      return;
    }

    /*
     * 클래스명이 다른 경우에도
     * 첫 번째 / 가운데 / 마지막 요소로 판별
     */
    const children = Array.from(
      wrap.children,
    ).filter((element) => {
      return !element.matches(
        "script, style, template, [hidden]",
      );
    });

    if (children.length < 2) {
      return;
    }

    children[0].classList.add(
      "lensia-export-tryon-panel",
    );

    children[
      children.length - 1
    ].classList.add(
      "lensia-export-tryon-panel",
    );

    if (children.length >= 3) {
      const arrow = children[1];

      arrow.classList.add(
        "lensia-export-tryon-arrow",
      );

      arrow.textContent = "›";
      arrow.setAttribute(
        "aria-label",
        "가상 착용 결과 방향",
      );

      wrap.appendChild(arrow);
    }
  }

  function renameIds(container) {
    container
      .querySelectorAll("[id]")
      .forEach((element, index) => {
        const originalId = element.id;

        element.dataset.originalExportId =
          originalId;

        element.id =
          `export-${originalId}-${index}`;
      });
  }

  function copyFormValues(original, clone) {
    const originals =
      original.querySelectorAll(
        "input, textarea, select",
      );

    const clones =
      clone.querySelectorAll(
        "input, textarea, select",
      );

    originals.forEach((source, index) => {
      const target = clones[index];

      if (!target) {
        return;
      }

      if (
        source instanceof HTMLInputElement
      ) {
        target.value = source.value;
        target.checked = source.checked;

        return;
      }

      if (
        source instanceof HTMLTextAreaElement
      ) {
        target.value = source.value;
        target.textContent = source.value;

        return;
      }

      if (
        source instanceof HTMLSelectElement
      ) {
        target.value = source.value;
      }
    });
  }

  function copyCanvasContents(original, clone) {
    const originals =
      original.querySelectorAll("canvas");

    const clones =
      clone.querySelectorAll("canvas");

    originals.forEach((source, index) => {
      const target = clones[index];

      if (!target) {
        return;
      }

      target.width = source.width;
      target.height = source.height;

      try {
        const context =
          target.getContext("2d");

        context?.drawImage(
          source,
          0,
          0,
        );
      } catch (error) {
        console.warn(
          "[LENSIA EXPORT] canvas 복사 실패",
          error,
        );
      }
    });
  }

  function copyVideoFrames(original, clone) {
    const originals =
      original.querySelectorAll("video");

    const clones =
      clone.querySelectorAll("video");

    originals.forEach((source, index) => {
      const target = clones[index];

      if (
        !target ||
        !source.videoWidth ||
        !source.videoHeight
      ) {
        return;
      }

      const canvas =
        document.createElement("canvas");

      canvas.width = source.videoWidth;
      canvas.height = source.videoHeight;

      try {
        const context =
          canvas.getContext("2d");

        context?.drawImage(
          source,
          0,
          0,
        );

        const image =
          document.createElement("img");

        image.src =
          canvas.toDataURL("image/png");

        image.alt =
          source.getAttribute(
            "aria-label",
          ) ||
          "가상 착용 이미지";

        image.className =
          target.className;

        target.replaceWith(image);
      } catch (error) {
        console.warn(
          "[LENSIA EXPORT] video 복사 실패",
          error,
        );
      }
    });
  }

  function loadHtml2Canvas() {
    if (
      typeof window.html2canvas ===
      "function"
    ) {
      return Promise.resolve(
        window.html2canvas,
      );
    }

    if (html2canvasPromise) {
      return html2canvasPromise;
    }

    html2canvasPromise =
      new Promise((resolve, reject) => {
        const existing =
          document.querySelector(
            'script[data-lensia-html2canvas="true"]',
          );

        if (existing) {
          existing.addEventListener(
            "load",
            () => {
              if (
                typeof window.html2canvas ===
                "function"
              ) {
                resolve(
                  window.html2canvas,
                );
              } else {
                reject(
                  new Error(
                    "html2canvas 초기화 실패",
                  ),
                );
              }
            },
            {
              once: true,
            },
          );

          existing.addEventListener(
            "error",
            () => {
              reject(
                new Error(
                  "html2canvas 불러오기 실패",
                ),
              );
            },
            {
              once: true,
            },
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src =
          CONFIG.html2canvasUrl;

        script.async = true;

        script.dataset.lensiaHtml2canvas =
          "true";

        script.onload = () => {
          if (
            typeof window.html2canvas ===
            "function"
          ) {
            resolve(
              window.html2canvas,
            );
          } else {
            reject(
              new Error(
                "html2canvas 초기화 실패",
              ),
            );
          }
        };

        script.onerror = () => {
          html2canvasPromise = null;

          reject(
            new Error(
              "html2canvas 불러오기 실패",
            ),
          );
        };

        document.head.appendChild(script);
      });

    return html2canvasPromise;
  }

  async function waitForImages(container) {
    const images = Array.from(
      container.querySelectorAll("img"),
    );

    await Promise.all(
      images.map((image) => {
        if (
          image.hidden ||
          !image.getAttribute("src")
        ) {
          return Promise.resolve();
        }

        if (image.complete) {
          if (
            typeof image.decode ===
            "function"
          ) {
            return image
              .decode()
              .catch(() => undefined);
          }

          return Promise.resolve();
        }

        return new Promise((resolve) => {
          let completed = false;

          const finish = () => {
            if (completed) {
              return;
            }

            completed = true;

            image.removeEventListener(
              "load",
              finish,
            );

            image.removeEventListener(
              "error",
              finish,
            );

            resolve();
          };

          image.addEventListener(
            "load",
            finish,
            {
              once: true,
            },
          );

          image.addEventListener(
            "error",
            finish,
            {
              once: true,
            },
          );

          window.setTimeout(
            finish,
            10000,
          );
        });
      }),
    );
  }

  async function waitForFonts() {
    if (!document.fonts?.ready) {
      return;
    }

    try {
      await document.fonts.ready;
    } catch (error) {
      console.warn(
        "[LENSIA EXPORT] 폰트 대기 실패",
        error,
      );
    }
  }

  function nextFrames(count = 1) {
    return new Promise((resolve) => {
      let remaining =
        Math.max(1, count);

      const next = () => {
        remaining -= 1;

        if (remaining <= 0) {
          resolve();

          return;
        }

        requestAnimationFrame(next);
      };

      requestAnimationFrame(next);
    });
  }

  async function downloadCanvas(canvas) {
    const blob =
      await new Promise(
        (resolve, reject) => {
          canvas.toBlob(
            (result) => {
              if (result) {
                resolve(result);
              } else {
                reject(
                  new Error(
                    "PNG 생성 실패",
                  ),
                );
              }
            },
            "image/png",
          );
        },
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = createFileName();

    document.body.appendChild(link);

    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function createFileName() {
    const type =
      document
        .querySelector("#type-code")
        ?.textContent?.trim()
        .replace(
          /[^a-zA-Z0-9가-힣_-]/g,
          "",
        ) ||
      "RESULT";

    const now = new Date();

    const date = [
      now.getFullYear(),
      String(
        now.getMonth() + 1,
      ).padStart(2, "0"),
      String(
        now.getDate(),
      ).padStart(2, "0"),
    ].join("");

    const time = [
      String(
        now.getHours(),
      ).padStart(2, "0"),
      String(
        now.getMinutes(),
      ).padStart(2, "0"),
      String(
        now.getSeconds(),
      ).padStart(2, "0"),
    ].join("");

    return (
      `${CONFIG.filePrefix}_` +
      `${type}_` +
      `${date}_` +
      `${time}.png`
    );
  }

  function setButtonLoading(
    button,
    loading,
  ) {
    button.disabled = loading;

    button.classList.toggle(
      "is-exporting",
      loading,
    );

    button.setAttribute(
      "aria-busy",
      String(loading),
    );
  }

  function showMessage(message) {
    if (
      typeof window.showResultToast ===
      "function"
    ) {
      window.showResultToast(message);

      return;
    }

    const toast =
      document.querySelector("#toast");

    if (!toast) {
      console.log(
        `[LENSIA EXPORT] ${message}`,
      );

      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(
      showMessage.timeoutId,
    );

    showMessage.timeoutId =
      window.setTimeout(() => {
        toast.classList.remove(
          "show",
        );
      }, 2400);
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true,
      },
    );
  } else {
    init();
  }
})();