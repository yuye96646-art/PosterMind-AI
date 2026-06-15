import io
import math
import random

from PIL import Image, ImageDraw, ImageFilter

logger = __import__("logging").getLogger(__name__)

# ---------------------------------------------------------------------------
# Professional colour palettes — curated for posters
# ---------------------------------------------------------------------------
PALETTES = [
    # Tech / Cyber
    {"name": "cyberpunk", "colors": ["#0a0a1a", "#1a0a3a", "#0d1b3e", "#003366", "#00ffff"],
     "accent": "#ff00ff"},
    {"name": "deep-tech", "colors": ["#0a0e27", "#101840", "#1a237e", "#283593", "#5c6bc0"],
     "accent": "#00e5ff"},
    # Warm / Social
    {"name": "sunset", "colors": ["#1a0a0a", "#3d1a1a", "#6b2a2a", "#ff6b6b", "#ffa500"],
     "accent": "#ffdd57"},
    {"name": "coral", "colors": ["#1a0505", "#3a1015", "#6b2025", "#ff6b6b", "#ff8e8e"],
     "accent": "#ffffff"},
    # Minimal
    {"name": "slate", "colors": ["#f5f5f5", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#616161"],
     "accent": "#1a1a1a"},
    {"name": "cream", "colors": ["#faf8f5", "#f0ebe3", "#e8d5c4", "#d4a574", "#8b6914"],
     "accent": "#2d2d2d"},
    # Bold
    {"name": "midnight", "colors": ["#000000", "#0a0a1a", "#111133", "#1a1a55", "#2a2a88"],
     "accent": "#4488ff"},
    {"name": "forest", "colors": ["#0a1a0a", "#0d2818", "#1a4d2e", "#2d6a4f", "#40916c"],
     "accent": "#95d5b2"},
    {"name": "royal", "colors": ["#0d0628", "#1a0a4e", "#2d1b69", "#4a2d8f", "#7c3aed"],
     "accent": "#c4b5fd"},
    {"name": "ocean", "colors": ["#02121a", "#052838", "#0a3d55", "#0e5275", "#006994"],
     "accent": "#48cae4"},
]


def generate_background(prompt: str, width: int, height: int) -> bytes:
    """Generate a beautiful poster background. No API needed."""
    pl = prompt.lower()
    rng = random.Random(abs(hash(prompt)) % 100000)

    # Pick palette based on prompt keywords
    palette = PALETTES[3]  # default: coral
    if any(w in pl for w in ["cyber", "neon", "tech", "科技", "赛博", "tech"]):
        palette = PALETTES[0]
    elif any(w in pl for w in ["deep", "blue", "navy", "深蓝"]):
        palette = PALETTES[1]
    elif any(w in pl for w in ["warm", "sunset", "orange", "暖", "橙", "晚霞"]):
        palette = PALETTES[2]
    elif any(w in pl for w in ["minimal", "clean", "white", "极简", "干净", "白"]):
        palette = PALETTES[4]
    elif any(w in pl for w in ["cream", "vintage", "retro", "复古"]):
        palette = PALETTES[5]
    elif any(w in pl for w in ["dark", "night", "midnight", "黑", "暗", "夜"]):
        palette = PALETTES[6]
    elif any(w in pl for w in ["nature", "green", "forest", "绿", "自然", "森林"]):
        palette = PALETTES[7]
    elif any(w in pl for w in ["purple", "royal", "violet", "紫"]):
        palette = PALETTES[8]
    elif any(w in pl for w in ["ocean", "sea", "water", "海", "蓝"]):
        palette = PALETTES[9]

    colors = palette["colors"]
    accent = palette["accent"]

    # Create base image
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # ---- 1. Multi-stop gradient background ----
    bands = 60
    bh = height // bands + 1
    for i in range(bands):
        t = i / bands
        y0 = i * bh
        y1 = min(y0 + bh, height)
        r, g, b = _lerp_colors(colors, t)
        draw.rectangle([0, y0, width, y1], fill=(r, g, b, 255))

    # ---- 2. Large soft light blobs (ambient glow) ----
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for _ in range(rng.randint(2, 4)):
        cx = rng.randint(0, width)
        cy = rng.randint(0, height)
        rr = rng.randint(width // 5, width // 2)
        ac = _hex(accent)
        gd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(*ac, rng.randint(10, 25)))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, glow)

    # ---- 3. Geometric accent shapes ----
    shapes = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shapes)

    for _ in range(rng.randint(6, 12)):
        stype = rng.choice(["circle", "rect", "line", "circle"])
        x = rng.randint(-width // 5, width)
        y = rng.randint(-height // 5, height)
        s = rng.randint(width // 10, width // 3)
        opacity = rng.randint(8, 30)
        use_accent = rng.random() > 0.6
        color = _hex(accent if use_accent else rng.choice(colors))
        fill = (*color, opacity)

        if stype == "circle":
            sd.ellipse([x, y, x + s, y + s], fill=fill)
        elif stype == "rect":
            sd.rectangle([x, y, x + s, y + s // 2], fill=fill)
        elif stype == "line":
            sd.line([(x, y), (x + s, y + s // 3)], fill=fill, width=rng.randint(2, 8))

    shapes = shapes.filter(ImageFilter.GaussianBlur(25))
    img = Image.alpha_composite(img, shapes)

    # ---- 4. Subtle grid pattern ----
    grid = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd2 = ImageDraw.Draw(grid)
    gs = rng.randint(60, 120)
    ga = rng.randint(4, 10)
    for gx in range(0, width, gs):
        gd2.line([(gx, 0), (gx, height)], fill=(255, 255, 255, ga))
    for gy in range(0, height, gs):
        gd2.line([(0, gy), (width, gy)], fill=(255, 255, 255, ga))
    img = Image.alpha_composite(img, grid)

    # ---- 5. Diagonal accent stripe ----
    stripe = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sd2 = ImageDraw.Draw(stripe)
    ac = _hex(accent)
    angle = rng.choice([-30, -20, -10, 15, 25, 35])
    cx = width // 2
    cy = height // 2
    length = max(width, height) * 2
    dx = int(length * math.cos(math.radians(angle)))
    dy = int(length * math.sin(math.radians(angle)))
    sw = rng.randint(2, 6)
    sd2.line([(cx - dx, cy - dy), (cx + dx, cy + dy)], fill=(*ac, rng.randint(15, 40)), width=sw)
    stripe = stripe.filter(ImageFilter.GaussianBlur(3))
    img = Image.alpha_composite(img, stripe)

    # ---- 6. Soft vignette ----
    vignette = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vignette)
    rings = 15
    for i in range(rings):
        t = i / rings
        rr = int(math.sqrt(cx * cx + cy * cy) * t)
        a = int(min(80, 80 * t * t * t))
        vd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(0, 0, 0, a), width=rr // rings + 2)
    img = Image.alpha_composite(img, vignette)

    # ---- 7. Subtle grain/noise texture ----
    for _ in range(int(width * height * 0.003)):
        nx = rng.randint(0, width - 1)
        ny = rng.randint(0, height - 1)
        pixel = img.getpixel((nx, ny))
        nv = rng.randint(-8, 8)
        img.putpixel((nx, ny), (
            max(0, min(255, pixel[0] + nv)),
            max(0, min(255, pixel[1] + nv)),
            max(0, min(255, pixel[2] + nv)),
            pixel[3],
        ))

    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _lerp_colors(colors: list[str], t: float) -> tuple[int, int, int]:
    n = len(colors) - 1
    idx = int(t * n)
    frac = t * n - idx
    c1 = _hex(colors[min(idx, n)])
    c2 = _hex(colors[min(idx + 1, n)])
    return (
        int(c1[0] + (c2[0] - c1[0]) * frac),
        int(c1[1] + (c2[1] - c1[1]) * frac),
        int(c1[2] + (c2[2] - c1[2]) * frac),
    )


def _hex(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    if len(h) == 3:
        h = h[0] * 2 + h[1] * 2 + h[2] * 2
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
