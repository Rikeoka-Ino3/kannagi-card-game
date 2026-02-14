import os
from pathlib import Path

from PIL import Image

from extract_power import file_url_to_path, parse_image_card_catalog, find_red_bbox, crop_bottom_left


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    main_js = root / "main.js"
    out_dir = root / "assets" / "power_crops"
    out_dir.mkdir(parents=True, exist_ok=True)

    cards = parse_image_card_catalog(str(main_js))
    locs = [c for c in cards if c.attribute == "場所札"]

    made = 0
    for c in locs:
        path = file_url_to_path(c.image_url)
        if not os.path.exists(path):
            continue
        try:
            img = Image.open(path)
        except Exception:
            continue

        bbox = find_red_bbox(img)
        if bbox:
            crop = img.crop(bbox)
        else:
            # fallback to a generous bottom-left crop
            crop = crop_bottom_left(img, 3)

        # upscale for easy visual inspection
        crop = crop.convert("RGB")
        w, h = crop.size
        crop = crop.resize((w * 5, h * 5), resample=Image.NEAREST)

        out_path = out_dir / f"{c.id}.png"
        crop.save(out_path)
        made += 1

    print(f"made {made} crops in {out_dir}")


if __name__ == "__main__":
    main()

