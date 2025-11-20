// ---------------------------------------------------------
// API CONFIG
// ---------------------------------------------------------

const API_URL = import.meta.env.VITE_API_BASE_URL; // example: https://manhwa-backend-xxx.a.run.app

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



// Normalize backend response (image_urls / panel_images)
function normalizeStoryData(data) {
  const imageList = data.image_urls || data.panel_images || [];
  return {
    ...data,
    image_urls: Array.isArray(imageList) ? imageList : [],
  };
}

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
  return normalizeStoryData(data);
};

// ---------------------------------------------------------
// 2. Generate Video  (POST /api/v1/generate_video)
// ---------------------------------------------------------

export const generateVideo = async (storyData) => {
  const response = await fetchWithRetry(`${API_URL}/api/v1/generate_video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storyData),
  });

  if (!response.ok) throw await parseJSONResponse(response);

  return await parseJSONResponse(response);
};

// ---------------------------------------------------------
// 3. Poll Video Status  (GET /api/v1/video_status/{jobId})
// ---------------------------------------------------------

export const getVideoStatus = async (jobId) => {
  if (!jobId) throw new Error("Job ID missing");

  const response = await fetchWithRetry(
    `${API_URL}/api/v1/video_status/${jobId}`,
    { method: "GET" }
  );

  if (!response.ok) throw await parseJSONResponse(response);

  return await parseJSONResponse(response);
};

// Add new streaming function
export const streamPanelExtraction = (jobId, onPanel, onComplete, onError) => {
  const eventSource = new EventSource(
    `${API_URL}/api/v1/stream_panels/${jobId}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'panel') {
        onPanel(data);  // Called for each panel
      } else if (data.type === 'complete') {
        onComplete(data);
        eventSource.close();
      } else if (data.type === 'error') {
        onError(data.message);
        eventSource.close();
      }
    } catch (err) {
      console.error('Stream parse error:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('EventSource error:', err);
    onError('Stream connection failed');
    eventSource.close();
  };

  // Return function to close stream manually
  return () => eventSource.close();
};
