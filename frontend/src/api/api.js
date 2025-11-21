// ---------------------------------------------------------
// API CONFIG
// ---------------------------------------------------------

const API_URL = import.meta.env.VITE_API_BASE_URL;

async function parseJSONResponse(response) {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    throw new Error(`Backend returned non-JSON (${response.status}):\n${text}`);
  }
}

async function fetchWithRetry(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) return fetchWithRetry(url, options, retries - 1);
    throw err;
  }
}



// // Normalize backend response (image_urls / panel_images)
// function normalizeStoryData(data) {
//   const imageList = data.image_urls || data.panel_images || [];
//   return {
//     ...data,
//     image_urls: Array.isArray(imageList) ? imageList : [],
//   };
// }

// ---------------------------------------------------------
// 1. Generate Audio Story  (POST /api/v1/generate_audio_story)
// ---------------------------------------------------------

export const generateAudioStory = async (formData) => {
  const response = await fetchWithRetry(
    `${API_URL}/api/v1/generate_audio_story`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) throw await parseJSONResponse(response);

  const data = await parseJSONResponse(response);
  return {
    manga_name: data.manga_name,
    image_urls: data.image_urls || [],
    audio_url: data.audio_url,
    final_video_segments: data.final_video_segments || [],
    full_narration: data.full_narration || "",
    processing_time: data.processing_time || 0,
    total_duration: data.total_duration || 0,
    total_panels: data.total_panels || 0,
  };
};


