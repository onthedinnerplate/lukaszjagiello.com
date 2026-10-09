#!/usr/bin/env python3
"""Build new article records, shape geometry, palettes, and the removed-sentence list.

Reads the owner's markdown sources and the shape log. Does not invent facts.
"""
import json, math, os, re, colorsys
from collections import Counter
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFTS = "/home/ubuntu/.cursor/projects/workspace/uploads/drafts-batch2_dcc2.md"
ORIGINALS = "/home/ubuntu/.cursor/projects/workspace/uploads/articles_60fc.md"
LOG = "/home/ubuntu/.cursor/projects/workspace/uploads/journal-all-articles-log_69db.json"
IMG = os.path.join(ROOT, "public/images/gallery/lightbox")

DATES = {
    1: "2025-12-15", 2: "2025-12-15", 3: "2025-12-16", 4: "2025-12-16",
    5: "2025-12-16", 6: "2025-12-16", 7: "2025-12-16", 8: "2025-05-20",
    9: "2025-05-20", 10: "2025-05-20", 11: "2025-05-20", 12: "2025-05-20",
    13: "2025-05-21", 14: "2025-05-21", 15: "2025-05-21", 16: "2025-05-21",
    17: "2025-05-24", 18: "2025-05-24", 19: "2025-05-24", 20: "2025-08-21",
    21: "2025-08-21", 22: "2025-08-21", 23: "2025-10-30", 24: "2025-12-18",
    25: "2025-12-15", 26: "2023-05-19", 27: "2023-10-13", 28: "2023-10-28",
    29: "2024-03-20", 30: "2024-03-20", 31: "2024-08-18", 32: "2024-08-18",
    33: "2024-08-18", 34: "2024-08-19", 35: "2024-08-19", 36: "2024-08-19",
    37: "2024-08-20", 38: "2024-08-20", 39: "2024-08-22", 40: "2024-08-23",
    41: "2024-08-23", 42: "2025-02-04", 43: "2025-02-04", 44: "2025-03-07",
    45: "2025-03-07", 46: "2025-03-07",
}

ADD_RE = re.compile(r"\[ADD:[^\]]*\]")
BILL = "Its bill is large and heavy, curved downward, with a raised ridge along the top."

# Hand-authored geometry for photos the shape log skipped.
EXTRA_SHAPES = {
    "12": {
        "num": "12",
        "title": "Two and a Half Seconds at the Edge of the City",
        "shape": "trapezoid",
        "reason": "long-exposure water and the bridge span recede toward the gate",
        "pieces": 4,
        "piece_shapes": ["trapezoid"],
        "blocks": ["trapezoid", "trapezoid"],
        "subject": "bridge and foreground rock",
        "sig": [[0, 10, 30, 31], [1, 0, 16, 14], [14, 0, 29, 12], [18, 12, 30, 24]],
        "choice": "The shape log skipped #12 because an article already existed. Trapezoid fits the span and the water pulling back toward the bridge.",
    },
    "21": {
        "num": "21",
        "title": "Iguana in the Palms",
        "shape": "hexagon",
        "reason": "companion frame to the reed iguana; scaly pattern, same vertical treatment",
        "pieces": 4,
        "piece_shapes": ["hexagon"],
        "blocks": ["hexagon"],
        "subject": "iguana in palm fronds",
        "sig": [[2, 4, 24, 28], [18, 0, 29, 10], [0, 18, 8, 30], [20, 20, 30, 31]],
        "choice": "The shape log skipped #21 because it shares an article with #20. Hexagon matches the reptile-pattern option used for that pair.",
    },
}


def hex_of(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rel_lum(rgb):
    r, g, b = rgb
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast_white(rgb):
    L = rel_lum(rgb)
    return (1.05) / (L + 0.05)


def darken_for_text(rgb):
    r, g, b = rgb
    guard = 0
    while contrast_white((r, g, b)) < 4.5 and (r, g, b) != (0, 0, 0) and guard < 40:
        r, g, b = int(r * 0.88), int(g * 0.88), int(b * 0.88)
        guard += 1
    return (r, g, b)


def kmeans(path, k=5):
    im = Image.open(path).convert("RGB")
    im.thumbnail((72, 72))
    px = list(im.getdata())
    step = max(1, len(px) // 900)
    pts = [px[i] for i in range(0, len(px), step)]
    # seed across sorted luminance so the five swatches spread
    pts_sorted = sorted(pts, key=rel_lum)
    cents = [pts_sorted[int((i + 0.5) * len(pts_sorted) / k)] for i in range(k)]
    for _ in range(10):
        buckets = [[] for _ in range(k)]
        for p in pts:
            j = min(range(k), key=lambda i: sum((a - b) ** 2 for a, b in zip(p, cents[i])))
            buckets[j].append(p)
        new = []
        for i, b in enumerate(buckets):
            if not b:
                new.append(cents[i])
                continue
            new.append(tuple(sum(c[ch] for c in b) // len(b) for ch in range(3)))
        cents = new
    # unique-ish, darkest to lightest
    cents = sorted(cents, key=rel_lum)
    out, seen = [], set()
    for c in cents:
        h = hex_of(c)
        if h in seen:
            continue
        seen.add(h)
        out.append(c)
    while len(out) < 5:
        out.append(out[-1] if out else (40, 40, 40))
    return out[:5]


def overlay_color(cols):
    def score(c):
        r, g, b = [v / 255 for v in c]
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        if l < 0.12 or l > 0.82:
            return -1
        return s * (1 - abs(l - 0.45))
    best = max(cols, key=score)
    if score(best) < 0:
        best = cols[len(cols) // 2]
    return best


def clip_for(kind):
    if kind == "circle":
        return "circle(50% at 50% 50%)"
    if kind == "triangle":
        return "polygon(50% 3%, 3% 97%, 97% 97%)"
    if kind == "trapezoid":
        return "polygon(16% 3%, 84% 3%, 97% 97%, 3% 97%)"
    if kind == "rectangle":
        return "polygon(1.5% 1.5%, 98.5% 1.5%, 98.5% 98.5%, 1.5% 98.5%)"
    nrot = {
        "pentagon": (5, -math.pi / 2),
        "hexagon": (6, 0.0),
        "octagon": (8, math.pi / 8),
        "square": (4, math.pi / 4),
    }
    n, rot = nrot[kind]
    raw = [(math.cos(rot + 2 * math.pi * i / n), math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]
    xs, ys = [p[0] for p in raw], [p[1] for p in raw]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    inset = 0.035
    pts = []
    for x, y in raw:
        nx = (x - minx) / (maxx - minx)
        ny = (y - miny) / (maxy - miny)
        nx = inset + (1 - 2 * inset) * nx
        ny = inset + (1 - 2 * inset) * ny
        pts.append(f"{nx * 100:.2f}% {ny * 100:.2f}%")
    return "polygon(" + ", ".join(pts) + ")"


def bg_for(x1, y1, x2, y2, W, H):
    w = max((x2 - x1) / W, 0.02)
    h = max((y2 - y1) / H, 0.02)
    pos_x = 0 if w >= 0.999 else ((x1 / W) / (1 - w)) * 100
    pos_y = 0 if h >= 0.999 else ((y1 / H) / (1 - h)) * 100
    size_x = 100 if w >= 0.999 else 100 / w
    size_y = 100 if h >= 0.999 else 100 / h
    return f"{size_x:.3f}% {size_y:.3f}%", f"{pos_x:.3f}% {pos_y:.3f}%"


def build_shape(entry, palette):
    sig = entry["sig"]
    kind = entry["shape"]
    W = max(b[2] for b in sig)
    H = max(b[3] for b in sig)
    clip = clip_for(kind)
    boxes = []
    for b in sig:
        x1, y1, x2, y2 = b
        if kind in ("circle", "square"):
            side = min(x2 - x1, y2 - y1)
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            x1, x2 = cx - side / 2, cx + side / 2
            y1, y2 = cy - side / 2, cy + side / 2
        # 0.35 grid gutter so neighbours don't weld together
        pad = 0.28
        x1, y1, x2, y2 = x1 + pad, y1 + pad, x2 - pad, y2 - pad
        if x2 - x1 < 1.2 or y2 - y1 < 1.2:
            x1, y1, x2, y2 = b[0], b[1], b[2], b[3]
        boxes.append((x1, y1, x2, y2))
    areas = [(x2 - x1) * (y2 - y1) for x1, y1, x2, y2 in boxes]
    hero = max(range(len(boxes)), key=lambda i: areas[i])
    others = [i for i in range(len(boxes)) if i != hero]
    overlay = min(others, key=lambda i: areas[i]) if others else None
    companion = max([i for i in others if i != overlay], key=lambda i: areas[i]) if entry["num"] == "20" and others else None
    pieces = []
    for i, (x1, y1, x2, y2) in enumerate(boxes):
        size, pos = bg_for(x1, y1, x2, y2, W, H)
        pieces.append({
            "left": f"{x1 / W * 100:.3f}%",
            "top": f"{y1 / H * 100:.3f}%",
            "width": f"{(x2 - x1) / W * 100:.3f}%",
            "height": f"{(y2 - y1) / H * 100:.3f}%",
            "clip": clip,
            "bgSize": size,
            "bgPos": pos,
            "overlay": i == overlay,
            "companion": i == companion,
        })
    # colour blocks peek out behind the hero
    hx1, hy1, hx2, hy2 = boxes[hero]
    shifts = [(-0.08 * W, -0.06 * H), (0.07 * W, 0.055 * H)]
    blocks = []
    for i, name in enumerate(entry.get("blocks") or []):
        dx, dy = shifts[i % 2]
        x1, y1 = max(0, hx1 + dx), max(0, hy1 + dy)
        x2, y2 = min(W, hx2 + dx), min(H, hy2 + dy)
        if x2 - x1 < 1 or y2 - y1 < 1:
            continue
        blocks.append({
            "left": f"{x1 / W * 100:.3f}%",
            "top": f"{y1 / H * 100:.3f}%",
            "width": f"{(x2 - x1) / W * 100:.3f}%",
            "height": f"{(y2 - y1) / H * 100:.3f}%",
            "clip": clip_for(name if name in (
                "circle", "pentagon", "hexagon", "octagon", "triangle", "square", "rectangle", "trapezoid"
            ) else kind),
            "color": hex_of(palette[0] if i == 0 else palette[min(2, len(palette) - 1)]),
        })
    accent = darken_for_text(palette[0])
    # prefer a saturated dark colour for the title word when the darkest swatch is grey
    for c in palette:
        if contrast_white(c) >= 4.5 and colorsys.rgb_to_hls(*(v / 255 for v in c))[2] > 0.15:
            accent = c
            break
    accent = darken_for_text(accent)
    over = overlay_color(palette)
    return {
        "num": entry["num"],
        "shape": kind,
        "reason": entry.get("reason", ""),
        "choice": entry.get("choice", ""),
        "gridW": W,
        "gridH": H,
        "pieces": pieces,
        "blocks": blocks,
        "palette": [hex_of(c) for c in palette],
        "overlay": hex_of(over),
        "accent": hex_of(accent),
        "accentContrast": round(contrast_white(accent), 2),
    }


def sections_of(md, only_title=None):
    chunks = re.split(r"\n---\n", md)
    out = []
    for ch in chunks:
        if "### From the bag" not in ch or not re.search(r"(?m)^# ", ch):
            continue
        title = re.search(r"(?m)^# (.+)$", ch).group(1).strip()
        if only_title and title != only_title:
            continue
        out.append(ch)
    return out


def field(ch, label):
    m = re.search(r"\*\*" + re.escape(label) + r":\*\*\s*(.+)", ch)
    return m.group(1).strip() if m else ""


def slug_from(url):
    m = re.search(r"/photo/([a-z0-9-]+)", url)
    return m.group(1) if m else ""


def src_from(url):
    m = re.search(r"(/images/gallery/lightbox/lukasz-jagiello-\d+-full\.webp)", url)
    return m.group(1) if m else ""


def clean_paragraph(para, removed, label):
    para = para.strip()
    if not para:
        return None
    # Pull placeholders out before any sentence split. Periods inside
    # "e.g." would otherwise break the bracket in half.
    for add in ADD_RE.findall(para):
        removed.append(f"{label}: {add}")
    para = ADD_RE.sub("", para)
    para = re.sub(r"[ \t]{2,}", " ", para)
    para = re.sub(r"\s+([.!?])", r"\1", para)
    para = para.strip()
    if len(re.sub(r"[^A-Za-z]", "", para)) < 12:
        return None
    return para


def rewrite_lighthouse(paragraphs, removed):
    """#04 was shot in daylight. Drop dusk/evening wording. Do not add other facts."""
    out = []
    for p in paragraphs:
        if p.startswith("The colour of the sky is the part"):
            removed.append("#04 Negril Lighthouse at Dusk: " + p)
            out.append(
                "This frame was made in daylight. The bright settings, 1/8000s at ISO 3200, match that light. "
                "The lavender and pink in the clouds are the colour of the sky in the picture."
            )
            continue
        if p.startswith("Either way, this is the frame"):
            removed.append("#04 Negril Lighthouse at Dusk: " + p)
            out.append(
                "This is the frame I'd hang where the room is quiet. It's less of a postcard than the first one, and more of a portrait."
            )
            continue
        out.append(p)
    blob = "\n".join(out)
    for word in ("dusk", "evening", "sunset"):
        if re.search(rf"\b{word}\b", blob, re.I):
            raise SystemExit(f"#04 still contains {word!r}: {blob}")
    return out


def rewrite_phainopepla(paragraphs, removed):
    out = []
    for p in paragraphs:
        if BILL in p:
            removed.append("#43 Phainopepla: " + BILL)
            p = p.replace(BILL, "").replace("  ", " ").strip()
            p = re.sub(r"\s+\.", ".", p)
            p = re.sub(r"\s{2,}", " ", p).strip()
        if "the bird is small too" in p:
            p = p.replace("the bird is small too", "the phainopepla is small too", 1)
        if p:
            out.append(p)
    blob = "\n".join(out)
    for banned in ("hornbill", "casque", "might be", "another species", "verify the ID"):
        if banned.lower() in blob.lower():
            raise SystemExit(f"#43 still contains {banned!r}")
    if "phainopepla" not in blob.lower():
        raise SystemExit("#43 body never names the phainopepla")
    return out


def parse_section(ch, removed):
    title_m = re.search(r"(?m)^# (.+)$", ch)
    title = title_m.group(1).strip()
    photo_line = field(ch, "Photo #")
    nums = [int(n) for n in re.findall(r"\d+", photo_line)] if photo_line else []
    if not nums and "Golden Gate Long Exposure" in ch[:400]:
        nums = [12]
    pages = re.findall(r"https://lukaszjagiello\.com/photo/([a-z0-9-]+)", ch)
    srcs = re.findall(r"/images/gallery/lightbox/lukasz-jagiello-\d+-full\.webp", ch)
    if not pages or not srcs or not nums:
        raise SystemExit(f"missing identity for {title}: nums={nums} pages={pages} srcs={srcs}")
    dek_m = re.search(r"(?m)^\*([^*]+)\*\s*$", ch)
    if not dek_m:
        raise SystemExit(f"no dek for {title}")
    dek = dek_m.group(1).strip()
    body = ch.split("### From the bag", 1)[1]
    lines = [ln.rstrip() for ln in body.strip().splitlines()]
    settings = ""
    note_parts = []
    for ln in lines:
        m = re.match(r"\*\*(.+)\*\*$", ln.strip())
        if m and not settings:
            settings = m.group(1).strip()
            continue
        if ln.strip():
            note_parts.append(ln.strip())
    if not settings:
        raise SystemExit(f"no settings for {title}")
    note = " ".join(note_parts)
    # body paragraphs: between dek and From the bag, skipping metadata
    head = ch.split("### From the bag", 1)[0]
    after_dek = head.split(dek_m.group(0), 1)[1]
    paragraphs = []
    for block in re.split(r"\n\s*\n", after_dek):
        block = block.strip()
        if not block or block.startswith("- ") or block.startswith("#") or block.startswith(">"):
            continue
        if block.startswith("**") or "SPECIES ID CHECK" in block or block.startswith("Status:"):
            continue
        paragraphs.append(block)
    label = f"#{nums[0]:02d} {title}"
    note = clean_paragraph(note, removed, label) or ""
    cleaned = []
    for p in paragraphs:
        c = clean_paragraph(p, removed, label)
        if c:
            cleaned.append(c)
    if nums[0] == 4:
        title = "The Lighthouse in Full Daylight"
        cleaned = rewrite_lighthouse(cleaned, removed)
    if nums[0] == 43:
        cleaned = rewrite_phainopepla(cleaned, removed)
        removed.append(
            "#43 Phainopepla: SPECIES ID CHECK header — the draft said the bird looked more like a hornbill than a phainopepla and asked to verify the ID before publishing. Removed. The bird is named as a phainopepla."
        )
    if nums[0] == 17:
        blob = "\n".join(cleaned)
        if re.search(r"\b(California|Crescent|Redwood Highway|Highway 101|Avenue of the Giants)\b", blob):
            raise SystemExit("#17 body names a location")
    rec = {
        "photoSlug": pages[0],
        "photoNumber": nums[0],
        "publishedAt": f"2026-10-09T{12 + (nums[0] // 60):02d}:{(nums[0] % 60):02d}:00.000Z",
        "expectSrc": srcs[0] if srcs[0].startswith("/") else "/" + srcs[0],
        "title": title,
        "dek": dek,
        "paragraphs": cleaned,
        "settings": settings,
        "note": note,
        "date": "2026-10-09",
    }
    if len(pages) > 1:
        rec["companionSlug"] = pages[1]
        rec["companionNumber"] = nums[1]
    return rec


def patch_metadata():
    path = os.path.join(ROOT, "lib/photoMetadata.js")
    text = open(path).read()
    if "date_taken" in text:
        return
    def repl(m):
        key = m.group(1)
        n = int(key)
        return m.group(0)[:-1] + f'\n    "date_taken": "{DATES[n]}",'
    # insert after each `"N": {`
    text2 = re.sub(r'"(\d+)": \{', lambda m: m.group(0) + f'\n    "date_taken": "{DATES[int(m.group(1))]}",', text)
    if text2.count("date_taken") != 46:
        raise SystemExit(f"date_taken count {text2.count('date_taken')}")
    open(path, "w").write(text2)


def main():
    removed = []
    articles = []
    for ch in sections_of(open(DRAFTS).read()):
        articles.append(parse_section(ch, removed))
    for ch in sections_of(open(ORIGINALS).read(), only_title="Two and a Half Seconds at the Edge of the City"):
        articles.append(parse_section(ch, removed))
    articles.sort(key=lambda a: a["photoNumber"])
    nums = [a["photoNumber"] for a in articles]
    if len(articles) != 41:
        raise SystemExit(f"expected 41 new articles, got {len(articles)} nums={nums}")
    # already-live photos must not be duplicated
    for live in (3, 23, 39, 41):
        if live in nums:
            raise SystemExit(f"live photo {live} was re-parsed")
    if 20 not in nums or 21 in nums or 12 not in nums or 4 not in nums or 17 not in nums or 43 not in nums:
        raise SystemExit(f"missing expected articles in {nums}")

    log = json.load(open(LOG))
    by_num = {str(int(e["num"])): e for e in log}
    by_num.update(EXTRA_SHAPES)
    shapes = {}
    for n in range(1, 47):
        key = str(n)
        entry = by_num[key]
        path = os.path.join(IMG, f"lukasz-jagiello-{n:02d}-full.webp")
        pal = kmeans(path)
        shapes[key] = build_shape(entry, pal)
        if shapes[key]["accentContrast"] < 4.5:
            raise SystemExit(f"accent contrast {key} {shapes[key]['accentContrast']}")

    payload = json.dumps(articles, ensure_ascii=False, indent=2)
    open(os.path.join(ROOT, "lib/newArticles.js"), "w").write(
        "// Generated by scripts/build-journal-publish.py. Do not edit by hand.\nexport default "
        + payload
        + ";\n"
    )
    json.dump(shapes, open(os.path.join(ROOT, "lib/journalShapes.json"), "w"), ensure_ascii=False, indent=2)
    json.dump(removed, open("/tmp/removed-sentences.json", "w"), ensure_ascii=False, indent=2)
    patch_metadata()
    print(f"articles {len(articles)} shapes {len(shapes)} removed {len(removed)}")
    print("titles:")
    for a in articles:
        print(f"  {a['photoNumber']:02d} {a['title']} -> {a['photoSlug']}")


if __name__ == "__main__":
    main()
