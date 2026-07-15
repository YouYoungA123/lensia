const form = document.querySelector('#ai-form');
const imageInput = document.querySelector('#image-input');
const statusEl = document.querySelector('#status');
const summary = document.querySelector('#summary');
const analyzeButton = document.querySelector('#analyze-button');
const cameraPreview = document.querySelector('#camera-preview');
const cameraCanvas = document.querySelector('#camera-canvas');
const cameraStart = document.querySelector('#camera-start');
const cameraCapture = document.querySelector('#camera-capture');
const tryonImage = document.querySelector('#tryon-image');
const annotatedImage = document.querySelector('#annotated-image');
const tryonHelp = document.querySelector('#tryon-help');
const typeCode = document.querySelector('#type-code');
const typeFull = document.querySelector('#type-full');
const toast = document.querySelector('#toast');
let cameraStream = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function setStatus(message, error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', error);
}

function updateView(result) {
  const analysis = result.analysis;
  const artifacts = result.artifacts;
  const t = Date.now();
  tryonImage.src = `${artifacts.tryon_preview_url}?t=${t}`;
  annotatedImage.src = `${artifacts.annotated_image_url}?t=${t}`;
  tryonHelp.textContent = `${document.querySelector('[name="lens_color"]').value} 색상으로 가상 착용 이미지를 생성했습니다.`;
  summary.innerHTML = `
    <b>${analysis.lpti_hint.code}</b>
    <span>피부: ${analysis.skinColor} / ${analysis.skinTone}</span>
    <span>홍채: ${analysis.irisColor} / ${analysis.irisTone}</span>
    <span>눈·얼굴 비율: ${(analysis.average_eye_to_face_width_ratio * 100).toFixed(2)}%</span>
  `;
  typeCode.textContent = analysis.lpti_hint.code;
  typeFull.textContent = `${analysis.skinTone} 피부톤, ${analysis.irisTone} 홍채톤 기반 추천`;
}

async function analyzeCurrentImage() {
  const data = new FormData(form);
  if (!data.get('image')?.name) {
    setStatus('사진 업로드 또는 카메라 촬영을 먼저 해주세요.', true);
    showToast('사진이 필요합니다');
    return;
  }
  analyzeButton.disabled = true;
  setStatus('AI 분석 중입니다...');
  try {
    const response = await fetch('/api/analyze', { method: 'POST', body: data });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || '분석 실패');
    updateView(payload.result);
    setStatus('분석 완료. 가상 착용 결과가 갱신되었습니다.');
    showToast('AI 분석 완료');
  } catch (error) {
    setStatus(error.message, true);
    showToast('AI 분석 실패');
  } finally {
    analyzeButton.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  analyzeCurrentImage();
});

document.querySelector('#go-result').addEventListener('click', () => {
  document.querySelector('#result').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.try-button').forEach((button) => {
  button.addEventListener('click', async () => {
    document.querySelector('[name="lens_color"]').value = button.dataset.lensColor;
    await analyzeCurrentImage();
    document.querySelector('.tryon-grid').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

cameraStart.addEventListener('click', async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    cameraPreview.srcObject = cameraStream;
    cameraPreview.classList.add('active');
    cameraCapture.disabled = false;
    setStatus('카메라가 켜졌습니다. 얼굴을 맞춘 뒤 촬영해서 사용을 눌러주세요.');
  } catch {
    setStatus('카메라 권한을 허용해야 촬영할 수 있습니다.', true);
  }
});

cameraCapture.addEventListener('click', () => {
  if (!cameraPreview.videoWidth) {
    showToast('카메라 화면이 아직 준비되지 않았습니다.');
    return;
  }
  cameraCanvas.width = cameraPreview.videoWidth;
  cameraCanvas.height = cameraPreview.videoHeight;
  cameraCanvas.getContext('2d').drawImage(cameraPreview, 0, 0);
  cameraCanvas.toBlob(async (blob) => {
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    imageInput.files = transfer.files;
    await analyzeCurrentImage();
  }, 'image/jpeg', 0.92);
});
