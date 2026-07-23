from __future__ import annotations

import json
import math
import tempfile
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import cv2
import mediapipe as mp
import numpy as np


SCHEMA_VERSION = "eye-lens-analysis.v1"
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/1/face_landmarker.task"
)
DEFAULT_MODEL_PATH = Path(tempfile.gettempdir()) / "lensia_models" / "face_landmarker.task"

IRIS_LANDMARKS = {
    "right_eye": (468, 469, 470, 471, 472),
    "left_eye": (473, 474, 475, 476, 477),
}
EYE_CORNERS = {
    "right_eye": (33, 133),
    "left_eye": (362, 263),
}
EYE_CONTOUR_LANDMARKS = {
    "right_eye": (33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246),
    "left_eye": (362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398),
}
FACE_WIDTH_LANDMARKS = (234, 454)
SKIN_SAMPLE_LANDMARKS = (50, 280, 205, 425)


@dataclass
class Point:
    x: float
    y: float


@dataclass
class Box:
    x: int
    y: int
    width: int
    height: int


@dataclass
class EyeAnalysis:
    eye: str
    eye_width_px: float
    visible_iris_width_px: float
    eye_to_face_width_ratio: float
    visible_iris_to_eye_width_ratio: float
    corner_points_px: list[Point]
    iris_center_px: Point
    landmark_iris_radius_px: float
    iris_radius_px: float
    iris_landmarks_px: list[Point]
    eye_contour_px: list[Point]
    crop_box_px: Box
    crop_file: str


@dataclass
class ColorAnalysis:
    hex: str
    rgb: dict[str, int]
    hsv: dict[str, float]
    lab: dict[str, float]
    warm_cool: str
    dark_light: str


def ensure_model(model_path: Path = DEFAULT_MODEL_PATH) -> Path:
    if model_path.exists():
        return model_path
    model_path.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(MODEL_URL, model_path)
    return model_path


def read_image(path: Path) -> np.ndarray:
    encoded = np.fromfile(str(path), dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"이미지를 읽을 수 없습니다: {path}")
    return image


def write_image(path: Path, image: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ok, encoded = cv2.imencode(path.suffix or ".jpg", image)
    if not ok:
        raise ValueError(f"이미지를 저장할 수 없습니다: {path}")
    encoded.tofile(str(path))


def read_image_unchanged(path: Path) -> np.ndarray:
    encoded = np.fromfile(str(path), dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError(f"Could not read image: {path}")
    return image


def parse_hex_color(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.strip().lstrip("#")
    if len(value) != 6:
        raise ValueError("렌즈 색상은 #RRGGBB 형식이어야 합니다.")
    red = int(value[0:2], 16)
    green = int(value[2:4], 16)
    blue = int(value[4:6], 16)
    return blue, green, red


def create_detector(model_path: Path = DEFAULT_MODEL_PATH):
    ensure_model(model_path)
    options = mp.tasks.vision.FaceLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=str(model_path)),
        running_mode=mp.tasks.vision.RunningMode.IMAGE,
        num_faces=1,
        output_face_blendshapes=False,
        output_facial_transformation_matrixes=False,
    )
    return mp.tasks.vision.FaceLandmarker.create_from_options(options)


def detect_landmarks(image_bgr: np.ndarray, detector):
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = detector.detect(mp_image)
    if not result.face_landmarks:
        raise RuntimeError("얼굴이 감지되지 않았습니다. 정면 얼굴 사진을 사용해 주세요.")
    landmarks = result.face_landmarks[0]
    if len(landmarks) < 478:
        raise RuntimeError("홍채 랜드마크를 찾지 못했습니다.")
    return landmarks


def to_pixel_points(landmarks, indices: tuple[int, ...], width: int, height: int) -> np.ndarray:
    return np.array(
        [[landmarks[i].x * width, landmarks[i].y * height] for i in indices],
        dtype=np.float32,
    )


def point_from_array(point: np.ndarray) -> Point:
    return Point(round(float(point[0]), 3), round(float(point[1]), 3))


def points_from_array(points: np.ndarray) -> list[Point]:
    return [point_from_array(point) for point in points]


def distance(points: np.ndarray) -> float:
    return float(np.linalg.norm(points[0] - points[1]))


def expanded_crop_box(points: np.ndarray, width: int, height: int, padding: float) -> tuple[int, int, int, int]:
    x, y, w, h = cv2.boundingRect(np.round(points).astype(np.int32))
    pad_x = max(8, int(w * padding))
    pad_y = max(8, int(h * padding))
    return max(0, x - pad_x), max(0, y - pad_y), min(width, x + w + pad_x), min(height, y + h + pad_y)


def estimate_dark_iris_radius(image: np.ndarray, center_x: float, center_y: float, fallback_radius: float) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    height, width = gray.shape[:2]
    angles = np.linspace(0, 2 * np.pi, 96, endpoint=False)
    radii = np.linspace(fallback_radius * 0.45, fallback_radius * 1.25, 42)
    candidates: list[float] = []
    for angle in angles:
        values = []
        valid = []
        for radius in radii:
            x = int(round(center_x + math.cos(float(angle)) * radius))
            y = int(round(center_y + math.sin(float(angle)) * radius))
            if 0 <= x < width and 0 <= y < height:
                values.append(float(gray[y, x]))
                valid.append(float(radius))
        if len(values) < 8:
            continue
        profile = np.convolve(np.array(values, dtype=np.float32), np.ones(5) / 5.0, mode="same")
        gradient = np.diff(profile)
        start = max(1, int(len(gradient) * 0.25))
        end = max(start + 1, int(len(gradient) * 0.95))
        best = int(np.argmax(gradient[start:end]) + start)
        if gradient[best] > 1.5:
            candidates.append(valid[min(best + 1, len(valid) - 1)])
    if len(candidates) < 12:
        return round(float(fallback_radius), 3)
    refined = float(np.median(candidates))
    refined = min(max(refined, fallback_radius * 0.72), fallback_radius * 1.08)
    return round(refined, 3)


def bgr_to_hex(bgr: np.ndarray) -> str:
    blue, green, red = [int(round(float(v))) for v in bgr[:3]]
    return f"#{red:02X}{green:02X}{blue:02X}"


def classify_warm_cool(hsv: np.ndarray, lab: np.ndarray) -> str:
    hue = float(hsv[0])
    saturation = float(hsv[1])
    lab_b = float(lab[2])
    if saturation < 22:
        return "neutral"
    if 5 <= hue <= 38 or hue >= 155 or lab_b >= 142:
        return "warm"
    if 78 <= hue <= 135 or lab_b <= 122:
        return "cool"
    return "neutral"


def classify_dark_light(lab: np.ndarray) -> str:
    lightness = float(lab[0])
    if lightness < 90:
        return "dark"
    if lightness > 165:
        return "light"
    return "medium"


def analyze_bgr_color(mean_bgr: np.ndarray) -> ColorAnalysis:
    color = np.uint8([[mean_bgr[:3]]])
    hsv = cv2.cvtColor(color, cv2.COLOR_BGR2HSV)[0][0].astype(float)
    lab = cv2.cvtColor(color, cv2.COLOR_BGR2LAB)[0][0].astype(float)
    blue, green, red = [int(round(float(v))) for v in mean_bgr[:3]]
    return ColorAnalysis(
        hex=bgr_to_hex(mean_bgr),
        rgb={"r": red, "g": green, "b": blue},
        hsv={"h": round(float(hsv[0]) * 2.0, 2), "s": round(float(hsv[1]) / 255.0, 4), "v": round(float(hsv[2]) / 255.0, 4)},
        lab={"l": round(float(lab[0]) * 100.0 / 255.0, 2), "a": round(float(lab[1]) - 128.0, 2), "b": round(float(lab[2]) - 128.0, 2)},
        warm_cool=classify_warm_cool(hsv, lab),
        dark_light=classify_dark_light(lab),
    )


def mean_bgr_from_mask(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    pixels = image[mask > 0]
    if len(pixels) == 0:
        raise ValueError("색상 분석 픽셀이 없습니다.")
    return pixels.mean(axis=0)


def extract_skin_color(image: np.ndarray, landmarks, width: int, height: int, face_width_px: float) -> ColorAnalysis:
    mask = np.zeros((height, width), dtype=np.uint8)
    sample_points = to_pixel_points(landmarks, SKIN_SAMPLE_LANDMARKS, width, height)
    radius = max(8, int(face_width_px * 0.025))
    for point in sample_points:
        cv2.circle(mask, tuple(np.round(point).astype(int)), radius, 255, -1, cv2.LINE_AA)
    return analyze_bgr_color(mean_bgr_from_mask(image, mask))


def extract_iris_color(image: np.ndarray, eyes: list[EyeAnalysis]) -> ColorAnalysis:
    height, width = image.shape[:2]
    mask = np.zeros((height, width), dtype=np.uint8)
    pupil_mask = np.zeros((height, width), dtype=np.uint8)
    for eye in eyes:
        center = (round(eye.iris_center_px.x), round(eye.iris_center_px.y))
        cv2.circle(mask, center, max(2, round(eye.iris_radius_px * 0.78)), 255, -1, cv2.LINE_AA)
        cv2.circle(pupil_mask, center, max(1, round(eye.iris_radius_px * 0.34)), 255, -1, cv2.LINE_AA)
    mask[pupil_mask > 0] = 0
    return analyze_bgr_color(mean_bgr_from_mask(image, mask))


def classify_appearance_style(avg_eye_face_ratio: float, avg_iris_eye_ratio: float) -> dict[str, Any]:
    style = "medium_defined_graphic"
    if avg_eye_face_ratio < 0.19:
        style = "more_defined_graphic"
    elif avg_eye_face_ratio > 0.22:
        style = "natural_graphic"
    enlargement_note = "moderate_enlargement_effect"
    if avg_iris_eye_ratio < 0.46:
        enlargement_note = "enlargement_effect_will_be_more_visible"
    elif avg_iris_eye_ratio > 0.52:
        enlargement_note = "avoid_over_enlarged_look"
    return {
        "style_hint": style,
        "enlargement_note": enlargement_note,
        "medical_lens_diameter_recommendation": "not_determined_from_photo",
    }


def build_lpti_hint(skin: ColorAnalysis, iris: ColorAnalysis, style: dict[str, Any]) -> dict[str, str]:
    warm_cool = "Cool" if skin.warm_cool == "cool" else "Warm"
    everyday_unique = "Everyday" if style["style_hint"] != "more_defined_graphic" else "Unique"
    puppy_kitty = "Kitty" if iris.dark_light == "dark" else "Puppy"
    large_medium = "Large" if style["enlargement_note"] == "enlargement_effect_will_be_more_visible" else "Medium"
    return {
        "warm_cool": warm_cool,
        "everyday_unique": everyday_unique,
        "puppy_kitty": puppy_kitty,
        "large_medium": large_medium,
        "code": f"{warm_cool}-{everyday_unique}-{puppy_kitty}-{large_medium}",
    }


def alpha_blend_patch(base: np.ndarray, patch: np.ndarray, center: tuple[int, int], alpha_scale: float) -> None:
    patch_height, patch_width = patch.shape[:2]
    center_x, center_y = center
    x1 = max(0, center_x - patch_width // 2)
    y1 = max(0, center_y - patch_height // 2)
    x2 = min(base.shape[1], x1 + patch_width)
    y2 = min(base.shape[0], y1 + patch_height)
    if x1 >= x2 or y1 >= y2:
        return

    patch_x1 = max(0, patch_width // 2 - center_x)
    patch_y1 = max(0, patch_height // 2 - center_y)
    patch_x2 = patch_x1 + (x2 - x1)
    patch_y2 = patch_y1 + (y2 - y1)
    patch_roi = patch[patch_y1:patch_y2, patch_x1:patch_x2]

    if patch_roi.shape[2] == 4:
        patch_bgr = patch_roi[:, :, :3]
        patch_alpha = patch_roi[:, :, 3:4].astype(np.float32) / 255.0
    else:
        patch_bgr = patch_roi[:, :, :3]
        patch_alpha = np.ones((*patch_roi.shape[:2], 1), dtype=np.float32)

    patch_alpha = np.clip(patch_alpha * alpha_scale, 0.0, 1.0)
    base_roi = base[y1:y2, x1:x2].astype(np.float32)
    blended = patch_bgr.astype(np.float32) * patch_alpha + base_roi * (1.0 - patch_alpha)
    base[y1:y2, x1:x2] = np.clip(blended, 0, 255).astype(np.uint8)


def render_tryon_preview(
    image: np.ndarray,
    eyes: list[EyeAnalysis],
    lens_color: tuple[int, int, int],
    graphic_scale: float,
    alpha: float,
    lens_asset: np.ndarray | None = None,
) -> np.ndarray:
    preview = image.copy()
    overlay = image.copy()
    alpha = min(1.0, max(0.0, alpha))
    for eye in eyes:
        center = (round(eye.iris_center_px.x), round(eye.iris_center_px.y))
        radius = max(1, round(eye.iris_radius_px * graphic_scale))
        pupil_radius = max(1, round(eye.iris_radius_px * 0.35))
        if lens_asset is not None:
            diameter = max(2, radius * 2)
            resized = cv2.resize(lens_asset, (diameter, diameter), interpolation=cv2.INTER_AREA)
            alpha_blend_patch(preview, resized, center, alpha)
            cv2.circle(preview, center, pupil_radius, (0, 0, 0), -1, cv2.LINE_AA)
            continue
        cv2.circle(overlay, center, radius, lens_color, -1, cv2.LINE_AA)
        cv2.circle(overlay, center, pupil_radius, (0, 0, 0), -1, cv2.LINE_AA)
        cv2.circle(overlay, center, radius, tuple(int(v * 0.55) for v in lens_color), 2, cv2.LINE_AA)
    if lens_asset is not None:
        return preview
    cv2.addWeighted(overlay, alpha, preview, 1.0 - alpha, 0, preview)
    return preview


def draw_annotations(image: np.ndarray, face_points: np.ndarray, eyes: list[EyeAnalysis]) -> np.ndarray:
    annotated = image.copy()
    cv2.line(annotated, tuple(np.round(face_points[0]).astype(int)), tuple(np.round(face_points[1]).astype(int)), (255, 180, 0), 2)
    for eye in eyes:
        contour = np.array([[p.x, p.y] for p in eye.eye_contour_px], dtype=np.int32)
        cv2.polylines(annotated, [contour], True, (0, 200, 0), 1)
        cv2.circle(annotated, (round(eye.iris_center_px.x), round(eye.iris_center_px.y)), round(eye.iris_radius_px), (0, 0, 255), 2)
    return annotated


def analyze_image(
    image_path: Path,
    output_dir: Path,
    detector,
    lens_color: tuple[int, int, int],
    graphic_scale: float = 1.0,
    tryon_alpha: float = 0.38,
    lens_asset_path: Path | None = None,
) -> dict[str, Any]:
    image = read_image(image_path)
    height, width = image.shape[:2]
    landmarks = detect_landmarks(image, detector)
    image_output_dir = output_dir / image_path.stem
    image_output_dir.mkdir(parents=True, exist_ok=True)

    face_points = to_pixel_points(landmarks, FACE_WIDTH_LANDMARKS, width, height)
    face_width_px = distance(face_points)
    eyes: list[EyeAnalysis] = []

    for eye_name in IRIS_LANDMARKS:
        iris_points = to_pixel_points(landmarks, IRIS_LANDMARKS[eye_name], width, height)
        contour_points = to_pixel_points(landmarks, EYE_CONTOUR_LANDMARKS[eye_name], width, height)
        corner_points = to_pixel_points(landmarks, EYE_CORNERS[eye_name], width, height)
        eye_width_px = distance(corner_points)
        (center_x, center_y), landmark_radius = cv2.minEnclosingCircle(iris_points)
        iris_radius = estimate_dark_iris_radius(image, center_x, center_y, float(landmark_radius))
        x1, y1, x2, y2 = expanded_crop_box(contour_points, width, height, 0.45)
        crop_path = image_output_dir / f"{eye_name}_crop.jpg"
        write_image(crop_path, image[y1:y2, x1:x2])
        eyes.append(EyeAnalysis(
            eye=eye_name,
            eye_width_px=round(eye_width_px, 3),
            visible_iris_width_px=round(iris_radius * 2.0, 3),
            eye_to_face_width_ratio=round(eye_width_px / face_width_px, 6),
            visible_iris_to_eye_width_ratio=round((iris_radius * 2.0) / eye_width_px, 6),
            corner_points_px=points_from_array(corner_points),
            iris_center_px=Point(round(center_x, 3), round(center_y, 3)),
            landmark_iris_radius_px=round(float(landmark_radius), 3),
            iris_radius_px=round(float(iris_radius), 3),
            iris_landmarks_px=points_from_array(iris_points),
            eye_contour_px=points_from_array(contour_points),
            crop_box_px=Box(x1, y1, x2 - x1, y2 - y1),
            crop_file=str(crop_path),
        ))

    annotated_path = image_output_dir / "annotated_eye_face_ratio.jpg"
    tryon_path = image_output_dir / "tryon_preview.jpg"
    lens_asset = read_image_unchanged(lens_asset_path) if lens_asset_path else None
    write_image(annotated_path, draw_annotations(image, face_points, eyes))
    write_image(tryon_path, render_tryon_preview(image, eyes, lens_color, graphic_scale, tryon_alpha, lens_asset))

    avg_eye_face = sum(e.eye_to_face_width_ratio for e in eyes) / len(eyes)
    avg_iris_eye = sum(e.visible_iris_to_eye_width_ratio for e in eyes) / len(eyes)
    style = classify_appearance_style(avg_eye_face, avg_iris_eye)
    skin = extract_skin_color(image, landmarks, width, height, face_width_px)
    iris = extract_iris_color(image, eyes)

    result = {
        "schema_version": SCHEMA_VERSION,
        "input_image": str(image_path),
        "image": {"width": width, "height": height},
        "face": {"width_px": round(face_width_px, 3), "points_px": [asdict(p) for p in points_from_array(face_points)]},
        "eyes": [asdict(e) for e in eyes],
        "analysis": {
            "average_eye_to_face_width_ratio": round(avg_eye_face, 6),
            "average_visible_iris_to_eye_width_ratio": round(avg_iris_eye, 6),
            "iris_radius_method": "dark_boundary_refined",
            "skinColor": skin.hex,
            "skinTone": f"{skin.warm_cool}-{skin.dark_light}",
            "irisColor": iris.hex,
            "irisTone": f"{iris.dark_light}-{iris.warm_cool}",
            "color_features": {"skin": asdict(skin), "iris": asdict(iris)},
            "lpti_hint": build_lpti_hint(skin, iris, style),
            "appearance_style": style,
        },
        "artifacts": {
            "annotated_image": str(annotated_path),
            "tryon_preview": str(tryon_path),
            "lens_asset": str(lens_asset_path) if lens_asset_path else None,
            "output_dir": str(image_output_dir),
        },
        "measurement_notes": {
            "medical_lens_diameter_recommendation": "not_determined_from_photo",
            "photo_limit": "Camera distance, pose, and lens distortion prevent safe DIA/BC inference.",
        },
    }
    (image_output_dir / "measurements.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result
