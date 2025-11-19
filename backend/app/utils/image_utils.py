# backend/app/utils/image_utils.py

from PIL import Image
from moviepy.editor import ImageClip, CompositeVideoClip, ColorClip
import moviepy.video.fx.all as vfx
import shutil
import os
from typing import Dict, List

TARGET_W, TARGET_H = 1080, 1920


def _assert_ffmpeg_exists():
    """Ensures ffmpeg exists; MoviePy will otherwise crash silently."""
    if not shutil.which("ffmpeg"):
        raise EnvironmentError(
            "❌ ffmpeg is not installed or not in PATH. Install it to enable video rendering."
        )


def generate_cinematic_clip(
    image_path: str,
    coords_1000: List[int],
    clip_duration: float,
    animation_type: str = "static_zoom",
) -> CompositeVideoClip:
    """
    Generates a cinematic clip with safe zoom/pan animations.
    - Tall images -> pan_down (scroll)
    - Wide / short images -> static_zoom (gentle zoom)
    """

    _assert_ffmpeg_exists()

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"❌ Image not found: {image_path}")

    if clip_duration <= 0:
        clip_duration = 0.1

    if not coords_1000 or len(coords_1000) != 4:
        coords_1000 = [0, 0, 1000, 1000]  # fallback

    # Load image clip
    base_clip = ImageClip(image_path, duration=clip_duration)
    w_orig, h_orig = base_clip.size

    # Convert normalized coords → pixel coords (safe clamp)
    x1 = max(0, int((coords_1000[0] / 1000) * w_orig))
    y1 = max(0, int((coords_1000[1] / 1000) * h_orig))
    x2 = min(w_orig, int((coords_1000[2] / 1000) * w_orig))
    y2 = min(h_orig, int((coords_1000[3] / 1000) * h_orig))

    if x1 >= x2 or y1 >= y2:
        x1, y1, x2, y2 = 0, 0, w_orig, h_orig

    try:
        panel_clip = base_clip.fx(
            vfx.crop,
            x1=x1,
            y1=y1,
            x2=x2,
            y2=y2,
        )
    except Exception:
        panel_clip = base_clip

    panel_w, panel_h = panel_clip.size
    if panel_w < 10 or panel_h < 10:
        panel_clip = base_clip
        panel_w, panel_h = panel_clip.size

    # Resize panel so it fits at least one dimension of target while preserving aspect
    # We prefer to fill the TARGET_H (vertical) for tall images; otherwise fill TARGET_W
    if panel_h / panel_w > (TARGET_H / TARGET_W):
        # relatively tall => scale to height
        panel_clip = panel_clip.fx(vfx.resize, height=TARGET_H)
    else:
        # relatively wide/short => scale to width
        panel_clip = panel_clip.fx(vfx.resize, width=TARGET_W)

    panel_w, panel_h = panel_clip.size  # updated

    # Decide final animation if caller passed 'auto' or nothing
    anim = animation_type or "static_zoom"
    if anim == "auto":
        anim = "pan_down" if (panel_h > panel_w * 1.25) else "static_zoom"

    # ANIMATION: pan_down (scroll top -> bottom)
    if anim == "pan_down":
        # If panel is taller than target, scroll vertically from top to bottom.
        if panel_h > TARGET_H:
            start_y = 0
            end_y = TARGET_H - panel_h  # negative value
            def pos_func(t):
                # linear interpolation from start_y -> end_y
                frac = min(1.0, max(0.0, t / clip_duration))
                y = int(start_y + (end_y - start_y) * frac)
                # center horizontally
                return ("center", y)
            panel_clip = panel_clip.set_position(pos_func)
        else:
            # If not taller, simply center with slight gentle zoom
            zoom_func = lambda t: 1.03 - 0.03 * (t / clip_duration)
            panel_clip = panel_clip.fx(vfx.resize, zoom_func).set_position("center")

    # ANIMATION: focus_character (gentle zoom-out)
    elif anim == "focus_character":
        zoom_func = lambda t: 1.15 - 0.15 * (t / clip_duration)
        panel_clip = panel_clip.fx(vfx.resize, zoom_func).set_position("center")

    # DEFAULT: static_zoom (gentle inward zoom)
    else:
        zoom_func = lambda t: 1.05 - 0.05 * (t / clip_duration)
        panel_clip = panel_clip.fx(vfx.resize, zoom_func).set_position("center")

    # Background black frame sized to target
    background = ColorClip(
        size=(TARGET_W, TARGET_H),
        color=(0, 0, 0),
        duration=clip_duration,
    )

    # Center the panel_clip on the background; if panel is larger than target, position function already handles it
    final_clip = CompositeVideoClip([background, panel_clip.set_position("center")])

    try:
        base_clip.close()
    except:
        pass

    return final_clip


def validate_scene_data(scene: Dict, scene_index: int) -> bool:
    required_fields = ["image_page_index", "crop_coordinates", "duration", "animation_type"]

    for field in required_fields:
        if field not in scene:
            return False

    coords = scene["crop_coordinates"]
    if len(coords) != 4:
        return False

    return True
