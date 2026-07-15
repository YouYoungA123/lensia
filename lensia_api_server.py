from __future__ import annotations

import cgi
import json
import mimetypes
import shutil
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

from lens_ratio_analyzer import analyze_image, create_detector, parse_hex_color


ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = ROOT / "web_uploads"
OUTPUT_DIR = ROOT / "web_output"
HOST = "127.0.0.1"
PORT = 8000


def file_url(path: str | Path) -> str:
    return "/files/" + "/".join(Path(path).resolve().relative_to(ROOT).parts)


def add_urls(result: dict) -> dict:
    artifacts = result.setdefault("artifacts", {})
    artifacts["tryon_preview_url"] = file_url(artifacts["tryon_preview"])
    artifacts["annotated_image_url"] = file_url(artifacts["annotated_image"])
    return result


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/":
            self.send_file(ROOT / "index.html")
        elif path.startswith("/files/"):
            self.send_file(ROOT / unquote(path.removeprefix("/files/")))
        else:
            self.send_file(ROOT / unquote(path.lstrip("/")))

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/analyze":
            self.send_json({"ok": False, "error": "unknown path"}, 404)
            return
        try:
            self.send_json({"ok": True, "result": add_urls(self.handle_analyze())})
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, 400)

    def handle_analyze(self) -> dict:
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": self.headers.get("Content-Type", "")},
        )
        image = form["image"] if "image" in form else None
        if image is None or not image.filename:
            raise ValueError("이미지를 업로드하거나 카메라로 촬영해 주세요.")
        suffix = Path(image.filename).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png"}:
            raise ValueError("JPG/PNG 파일만 지원합니다.")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        upload_path = UPLOAD_DIR / Path(image.filename).name
        with upload_path.open("wb") as output:
            shutil.copyfileobj(image.file, output)
        lens_color = parse_hex_color(form.getfirst("lens_color", "#8B5E3C"))
        graphic_scale = float(form.getfirst("graphic_scale", "1.0"))
        tryon_alpha = float(form.getfirst("tryon_alpha", "0.38"))
        with create_detector() as detector:
            return analyze_image(upload_path, OUTPUT_DIR, detector, lens_color, graphic_scale, tryon_alpha)

    def send_file(self, path: Path) -> None:
        resolved = path.resolve()
        try:
            resolved.relative_to(ROOT)
        except ValueError:
            self.send_error(403)
            return
        if not resolved.exists() or not resolved.is_file():
            self.send_error(404)
            return
        data = resolved.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(resolved.name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, data: dict, status: int = 200) -> None:
        encoded = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main() -> None:
    print(f"LENSIA: http://{HOST}:{PORT}")
    print("종료: Ctrl+C")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
