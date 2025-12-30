"""
Groq (Llama 3.2 Vision) Script Generation
"""

import os
import json
import base64
import traceback
import logging
from typing import Dict, Any, List

from groq import Groq

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("groq_utils")

# Initialize Groq
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def _extract_json_from_text(raw: str):
    if not raw: return None
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1:
        return raw[start:end + 1]
    return None

def fallback_script(name: str, ocr: str) -> Dict[str, Any]:
    return {
        "full_narration": f"Yeh {name} ki kahani hai...",
        "scenes": [{"narration_segment": "Kahani shuru hoti hai...", "image_page_index": 0}]
    }

def generate_cinematic_script(
    manga_name: str,
    manga_genre: str,
    ocr_data: str,
    image_bytes_list: List[bytes],
    max_scenes: int = 200
) -> Dict[str, Any]:

    # ⚡ Get strict count of panels
    total_panels = len(image_bytes_list)
    logger.info(f"→ Sending {total_panels} images to Groq. Demanding {total_panels} scenes.")

    content_list = []
    
    # ⚡ MANGA-BHAI PERSONA (Strict 1-to-1 Mapping)
    prompt = f"""
    ROLE: You are 'Manga-Bhai', a high-energy Indian YouTuber who narrates manhwa frame-by-frame.
    
    INPUT CONTEXT:
    - I have provided **{total_panels} individual panels**.
    - You MUST generate exactly **{total_panels} distinct narration segments**.
    
    STRICT INSTRUCTIONS:
    1. **One Scene Per Image:** You cannot combine images. Scene 1 must match Panel 0, Scene 2 must match Panel 1, etc.
    2. **Continuity:** Ensure Scene 2 naturally follows Scene 1. (e.g., "Aur agle hi pal..." -> "Tabhi usne dekha...").
    3. **Hinglish Narration:** Use energetic Hindi + English words (Action, Attack, Shock).
    4. **No Summaries:** Do not summarize the whole page in the first scene. Describe ONLY what is in that specific panel.
    5. **Dialogue:** If a character speaks in Panel X, narrate it in Scene X.

    OUTPUT FORMAT (JSON Only):
    {{
      "full_narration": "Short teaser of the chapter...",
      "scenes": [
        {{ "image_page_index": 0, "narration_segment": "Panel 1 description..." }},
        {{ "image_page_index": 1, "narration_segment": "Continuity from Panel 1..." }},
        ... (Must have exactly {total_panels} items)
      ]
    }}

    Manga: {manga_name}
    Genre: {manga_genre}
    """
    
    content_list.append({"type": "text", "text": prompt})

    # Add images with explicit labels
    for i, img_bytes in enumerate(image_bytes_list):
        b64 = base64.b64encode(img_bytes).decode('utf-8')
        content_list.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })
        content_list.append({"type": "text", "text": f"[Panel {i}]"})

    try:
        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct", 
            messages=[{"role": "user", "content": content_list}],
            temperature=0.6, # Lower temperature for better adherence to "Count" instructions
            max_tokens=2500,
            response_format={"type": "json_object"} 
        )

        raw = completion.choices[0].message.content
        print(f"\n--- [DEBUG] MANGA-BHAI SCRIPT ({total_panels} Panels) ---\n{raw[:300]}...\n-------------------------------\n")

        json_str = _extract_json_from_text(raw)
        if not json_str: return fallback_script(manga_name, ocr_data)

        data = json.loads(json_str)
        
        # ⚡ Validation: Did we get enough scenes?
        scenes = data.get("scenes", [])
        if len(scenes) < total_panels:
            logger.warning(f"⚠ AI generated {len(scenes)} scenes, expected {total_panels}. Taking evasive action.")
        
        return data

    except Exception as e:
        logger.error(f"❌ Groq Script Gen Failed: {e}")
        traceback.print_exc()
        return fallback_script(manga_name, ocr_data)