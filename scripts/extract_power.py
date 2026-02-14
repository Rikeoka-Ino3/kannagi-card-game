import os
import re
import subprocess
import tempfile
import urllib.parse
from dataclasses import dataclass

from PIL import Image, ImageFilter


@dataclass
class Card:
    id: str
    name: str
    attribute: str
    image_url: str


def file_url_to_path(url: str) -> str:
    if url.startswith("file://"):
        parsed = urllib.parse.urlparse(url)
        return urllib.parse.unquote(parsed.path)
    return url


def parse_image_card_catalog(main_js_path: str) -> list[Card]:
    text = open(main_js_path, "r", encoding="utf-8").read()
    m = re.search(r"const imageCardCatalog\s*=\s*\[", text)
    if not m:
        raise RuntimeError("imageCardCatalog not found")

    # Very simple object parser: split on top-level "{ ... }," inside the array.
    start = m.end()
    end = text.find("];", start)
    if end == -1:
        raise RuntimeError("imageCardCatalog array end not found")
    body = text[start:end]

    # Capture each object block by braces at indentation level (best-effort).
    objs = []
    depth = 0
    buf = []
    in_obj = False
    for ch in body:
        if ch == "{":
            depth += 1
            in_obj = True
        if in_obj:
            buf.append(ch)
        if ch == "}":
            depth -= 1
            if in_obj and depth == 0:
                objs.append("".join(buf))
                buf = []
                in_obj = False

    cards: list[Card] = []
    lemon_m = re.search(r"const lemonImageUrl\s*=\s*\"([^\"]+)\"", text)
    lemon_url = lemon_m.group(1) if lemon_m else ""

    for obj in objs:
        id_m = re.search(r"id:\s*\"([^\"]+)\"", obj)
        name_m = re.search(r"name:\s*\"([^\"]+)\"", obj)
        attr_m = re.search(r"attribute:\s*\"([^\"]+)\"", obj)
        if not id_m or not name_m or not attr_m:
            continue
        # imageUrl: lemonImageUrl OR "file://..."
        img_m = re.search(r"imageUrl:\s*(?:\"([^\"]+)\"|lemonImageUrl)", obj)
        if not img_m:
            continue
        img_url = img_m.group(1) if img_m.group(1) else lemon_url
        cards.append(Card(id=id_m.group(1), name=name_m.group(1), attribute=attr_m.group(1), image_url=img_url))

    return cards


def crop_bottom_left(img: Image.Image, crop_variant: int) -> Image.Image:
    w, h = img.size
    # Variants try slightly different windows.
    variants = [
        (0.00, 0.72, 0.28, 1.00),
        (0.00, 0.75, 0.33, 1.00),
        (0.02, 0.74, 0.30, 0.98),
        (0.00, 0.68, 0.40, 0.98),
    ]
    x0p, y0p, x1p, y1p = variants[crop_variant % len(variants)]
    x0, y0, x1, y1 = int(w * x0p), int(h * y0p), int(w * x1p), int(h * y1p)
    return img.crop((x0, y0, x1, y1))


def find_red_bbox(img: Image.Image) -> tuple[int, int, int, int] | None:
    """
    Try to find the red power digits by scanning bottom-left region for red-ish pixels,
    then returning their bounding box (with padding).
    """
    rgb = img.convert("RGB")
    w, h = rgb.size
    # Search in bottom-left region (most likely location of the red number).
    x0, y0, x1, y1 = 0, int(h * 0.55), int(w * 0.55), h
    region = rgb.crop((x0, y0, x1, y1))
    rw, rh = region.size
    pix = region.load()

    minx, miny, maxx, maxy = rw, rh, -1, -1
    count = 0
    for y in range(rh):
        for x in range(rw):
            r, g, b = pix[x, y]
            is_red = r > 120 and (r - g) > 35 and (r - b) > 35
            if not is_red:
                continue
            count += 1
            if x < minx:
                minx = x
            if y < miny:
                miny = y
            if x > maxx:
                maxx = x
            if y > maxy:
                maxy = y

    # If too few red pixels, probably didn't find it.
    if count < 40 or maxx < 0:
        return None

    # Pad a bit and translate back to full-image coords.
    pad = 10
    bx0 = max(0, x0 + minx - pad)
    by0 = max(0, y0 + miny - pad)
    bx1 = min(w, x0 + maxx + pad)
    by1 = min(h, y0 + maxy + pad)
    # Ensure bbox isn't absurdly large.
    if (bx1 - bx0) > int(w * 0.5) or (by1 - by0) > int(h * 0.5):
        return None
    return (bx0, by0, bx1, by1)


def preprocess_red_digits(crop: Image.Image) -> Image.Image:
    crop = crop.convert("RGB")
    w, h = crop.size
    # Create a binary image: red-ish pixels -> black, else white
    out = Image.new("L", (w, h), 255)
    pix = crop.load()
    opix = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = pix[x, y]
            is_red = r > 120 and (r - g) > 35 and (r - b) > 35
            opix[x, y] = 0 if is_red else 255

    # Thicken strokes a bit and reduce speckle noise
    out = out.filter(ImageFilter.MaxFilter(3))
    out = out.filter(ImageFilter.MinFilter(3))

    # Upscale for OCR
    scale = 6
    out = out.resize((w * scale, h * scale), resample=Image.NEAREST)
    return out


def ocr_digits(img: Image.Image) -> str:
    with tempfile.TemporaryDirectory() as td:
        in_path = os.path.join(td, "in.png")
        img.save(in_path)
        for psm in ("8", "7", "10"):
            cmd = [
                "tesseract",
                in_path,
                "stdout",
                "-l",
                "eng",
                "--oem",
                "1",
                "--psm",
                psm,
                "-c",
                "tessedit_char_whitelist=0123456789",
            ]
            try:
                out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode("utf-8", errors="ignore")
            except Exception:
                continue
            digits = re.findall(r"\d+", out)
            if digits:
                return digits[0]
        return ""


def extract_power_for_image(path: str) -> int | None:
    try:
        img = Image.open(path)
    except Exception:
        return None
    # Try bbox detection first.
    bbox = find_red_bbox(img)
    if bbox:
        crop = img.crop(bbox)
        pre = preprocess_red_digits(crop)
        d = ocr_digits(pre)
        if d:
            try:
                return int(d)
            except ValueError:
                pass

    # Fallback to a few coarse crops.
    for variant in range(8):
        crop = crop_bottom_left(img, variant)
        pre = preprocess_red_digits(crop)
        d = ocr_digits(pre)
        if d:
            try:
                return int(d)
            except ValueError:
                pass
    return None


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    main_js = os.path.join(root, "main.js")
    cards = parse_image_card_catalog(main_js)

    locs = [c for c in cards if c.attribute == "場所札"]
    results = []
    for c in locs:
        path = file_url_to_path(c.image_url)
        power = extract_power_for_image(path)
        results.append((c.id, c.name, power, path))

    print("id\tname\tpower\tpath")
    for cid, name, power, path in results:
        print(f"{cid}\t{name}\t{power if power is not None else ''}\t{path}")


if __name__ == "__main__":
    main()

