import io
import logging
import math
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "fonts")


def _find_cjk_font() -> str:
    """Find a usable Chinese font on the system."""
    candidates = []

    if sys.platform == "win32":
        windir = os.environ.get("WINDIR", "C:/Windows")
        candidates = [
            os.path.join(windir, "Fonts/msyh.ttc"),   # 微软雅黑
            os.path.join(windir, "Fonts/msyhbd.ttc"), # 微软雅黑 Bold
            os.path.join(windir, "Fonts/simhei.ttf"), # 黑体
            os.path.join(windir, "Fonts/simsun.ttc"), # 宋体
            os.path.join(windir, "Fonts/mingliub.ttc"),
        ]
    else:
        candidates = [
            "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
        ]

    # Also check bundled fonts
    bundled = [
        os.path.join(FONTS_DIR, "NotoSansSC-Regular.ttf"),
        os.path.join(FONTS_DIR, "NotoSansSC-Bold.ttf"),
    ]
    candidates = bundled + candidates

    for path in candidates:
        if os.path.exists(path):
            return path

    return ""


_CJK_FONT_PATH = _find_cjk_font()
logger.info(f"Using CJK font: {_CJK_FONT_PATH or 'none found, using default'}")


def _get_font(size: int, font_family: str = "Inter") -> ImageFont.FreeTypeFont:
    if _CJK_FONT_PATH:
        try:
            return ImageFont.truetype(_CJK_FONT_PATH, size)
        except (IOError, OSError):
            pass

    try:
        return ImageFont.load_default()
    except Exception:
        return ImageFont.load_default()


def _parse_color(color_str: str) -> tuple[int, int, int, int]:
    """Parse color string like '#ffffff', 'rgba(255,255,255,0.8)', '#ff0000' to RGBA tuple."""
    rgba_match = re.match(r"rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)", color_str)
    if rgba_match:
        r, g, b = int(rgba_match.group(1)), int(rgba_match.group(2)), int(rgba_match.group(3))
        a = int(float(rgba_match.group(4)) * 255) if rgba_match.group(4) else 255
        return (r, g, b, a)

    hex_match = re.match(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", color_str)
    if hex_match:
        h = hex_match.group(1)
        if len(h) == 3:
            h = h[0]*2 + h[1]*2 + h[2]*2
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

    return (255, 255, 255, 255)


def _wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Wrap text to fit within max_width pixels."""
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split(" ")
        current_line = ""
        for word in words:
            test_line = f"{current_line} {word}".strip()
            bbox = font.getbbox(test_line)
            if bbox[2] - bbox[0] <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                # Handle single long word by character
                char_line = ""
                for ch in word:
                    test = char_line + ch
                    bbox = font.getbbox(test)
                    if bbox[2] - bbox[0] <= max_width:
                        char_line = test
                    else:
                        lines.append(char_line)
                        char_line = ch
                current_line = char_line
        if current_line:
            lines.append(current_line)
    return lines


def _draw_element(draw: ImageDraw.ImageDraw, element: dict, img_width: int, img_height: int):
    """Draw a locked decorative element onto the image."""
    elem_type = element.get("type", "")
    x = element.get("x", 0)
    y = element.get("y", 0)
    color = _parse_color(element.get("color", "#ffffff"))

    if elem_type == "circle":
        r = element.get("radius", 40)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

    elif elem_type == "square":
        w = element.get("width", 60)
        h = element.get("height", 60)
        rotation = element.get("rotation", 0)
        if rotation:
            # Draw rotated rectangle
            corners = [
                (x - w/2, y - h/2),
                (x + w/2, y - h/2),
                (x + w/2, y + h/2),
                (x - w/2, y + h/2),
            ]
            rad = math.radians(rotation)
            rotated = []
            for cx, cy in corners:
                rx = x + (cx - x) * math.cos(rad) - (cy - y) * math.sin(rad)
                ry = y + (cx - x) * math.sin(rad) + (cy - y) * math.cos(rad)
                rotated.append((rx, ry))
            draw.polygon(rotated, fill=color)
        else:
            draw.rectangle([x, y, x + w, y + h], fill=color)

    elif elem_type == "line":
        w = element.get("width", 200)
        h = element.get("height", 2)
        draw.rectangle([x, y, x + w, y + h], fill=color)

    elif elem_type == "gradient":
        gw = element.get("width", img_width)
        gh = element.get("height", 200)
        colors = element.get("colors", ["rgba(255,255,255,0)", "rgba(255,255,255,0.3)"])
        start_color = _parse_color(colors[0]) if colors else (255, 255, 255, 0)
        end_color = _parse_color(colors[1]) if len(colors) > 1 else (255, 255, 255, 76)

        for gy in range(int(gh)):
            ratio = gy / gh if gh > 0 else 0
            gc = tuple(
                int(start_color[i] + (end_color[i] - start_color[i]) * ratio)
                for i in range(4)
            )
            draw.line([(x, y + gy), (x + gw, y + gy)], fill=gc)

    elif elem_type == "icon":
        iw = element.get("width", 24)
        ih = element.get("height", 24)
        icon_type = element.get("icon_type", "heart")
        # Simple icon shapes
        if icon_type == "heart":
            cx, cy = x + iw/2, y + ih/2
            draw.ellipse([cx - iw/2, cy - ih/3, cx, cy + ih/6], fill=color)
            draw.ellipse([cx, cy - ih/3, cx + iw/2, cy + ih/6], fill=color)
            draw.polygon([(cx - iw/2, cy), (cx + iw/2, cy), (cx, cy + ih/2)], fill=color)


def render_poster(
    background_bytes: bytes,
    layout_json: list[dict],
    locked_elements: list[dict],
    texts: dict[str, str],
    font_family: str = "Inter",
    primary_color: str = "#ffffff",
    secondary_color: str = "#ffffff",
) -> bytes:
    """
    Step 5 of the workflow: Render text and decorative elements onto the background image.
    """
    img = Image.open(io.BytesIO(background_bytes)).convert("RGBA")
    img_width, img_height = img.size

    # Create overlay for text and elements
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Draw locked decorative elements
    for element in locked_elements:
        _draw_element(draw, element, img_width, img_height)

    # Draw text elements from layout
    for element in layout_json:
        elem_type = element.get("element", "")
        if elem_type not in texts or not texts[elem_type]:
            continue

        text = texts[elem_type]
        x = element.get("x", 60)
        y = element.get("y", 80)
        max_w = element.get("width", img_width - 2 * x)
        font_size = element.get("font_size", 48)
        color = element.get("color", primary_color)
        align = element.get("align", "left")

        font = _get_font(font_size, font_family)
        rgba_color = _parse_color(color)

        lines = _wrap_text(text, font, max_w)
        line_spacing = element.get("line_spacing", int(font_size * 0.3))
        current_y = y

        for line in lines:
            bbox = font.getbbox(line)
            line_width = bbox[2] - bbox[0]
            line_height = bbox[3] - bbox[1]

            if align == "center":
                lx = x + (max_w - line_width) / 2
            elif align == "right":
                lx = x + max_w - line_width
            else:
                lx = x

            draw.text((lx, current_y), line, fill=rgba_color, font=font)
            current_y += line_height + line_spacing

    # Composite overlay onto background
    img = Image.alpha_composite(img, overlay)

    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG")
    return buf.getvalue()
