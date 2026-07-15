# LENSIA

오프라인 렌즈 매장용 AI 렌즈 추천 키오스크 MVP입니다.

UI는 `ykunjii-creator/lensia-site`의 LENSIA 웹 프로토타입을 기반으로 하고, 여기에 AI 이미지 분석/카메라/가상 시착 API를 연결했습니다.

사진 업로드 또는 노트북 카메라 촬영으로 얼굴/눈/홍채를 분석하고, 피부색·홍채색·LPTI 힌트·가상 렌즈 시착 이미지를 생성합니다.

## 주요 기능

- 얼굴/눈/홍채 랜드마크 감지
- 눈 가로폭, 홍채 폭, 눈/얼굴 비율 계산
- 피부 대표색 `skinColor`, 홍채 대표색 `irisColor` 추출
- `warm/cool`, `dark/light` 간단 분류
- LPTI 힌트 생성
- 렌즈 색상별 가상 시착 이미지 생성
- 웹 화면에서 사진 업로드 또는 노트북 카메라 촬영
- 원본 LENSIA UI 기반 홈/소개/테스트/추천 렌즈 화면

## 실행 방법

```powershell
cd "C:\Users\study\Downloads\경디공\lensia"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe lensia_api_server.py
```

브라우저에서 엽니다.

```text
http://127.0.0.1:8000
```

## 사용 흐름

1. `추천 렌즈` 화면으로 이동
2. 얼굴 사진 업로드 또는 `노트북 카메라 켜기`
3. `AI 분석하기` 또는 `촬영해서 사용`
4. 피부/홍채 분석 결과 확인
5. `가상 착용 결과`에서 시착 이미지 확인
6. 추천 렌즈 카드의 `가상 착용` 버튼으로 렌즈 색상 변경

## 프로젝트 구조

```text
.
├─ index.html
├─ css/
│  ├─ style.css
│  └─ result.css
├─ js/
│  ├─ script.js
│  └─ result.js
├─ assets/
├─ lensia_api_server.py
├─ lens_ratio_analyzer.py
├─ requirements.txt
└─ README.md
```

## 주의

이 프로젝트는 미용적 렌즈 스타일 추천 MVP입니다. 실제 콘택트렌즈의 `DIA`, `BC` 등 의료적 피팅 값은 사진만으로 안전하게 결정할 수 없으며, 전문가 상담이 필요합니다.
