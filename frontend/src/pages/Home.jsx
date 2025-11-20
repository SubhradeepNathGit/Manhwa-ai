/* OPTIMIZED Home.jsx with Real-Time Panel Streaming */

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Play,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Settings,
  Sparkles,
  Lock,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ===================================================================
// MAIN COMPONENT
// ===================================================================
const Home = () => {
  const [file, setFile] = useState(null);
  const [mangaName, setMangaName] = useState("");
  const [mode, setMode] = useState("images");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);

  // Panel extraction states
  const [panelImages, setPanelImages] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState("");

  // ⚡ NEW: Store EventSource for cleanup
  const eventSourceRef = useRef(null);

  const [settings, setSettings] = useState({
    frameDuration: 3,
    resolution: "1080p",
  });

  const fileInputRef = useRef(null);

  // ===================================================================
  // POLLING FOR VIDEO STATUS
  // ===================================================================
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/video_status/${jobId}`);

        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "completed") {
          setVideoUrl(data.video_url);
          setIsGenerating(false);
          setProgress(100);
          clearInterval(interval);
        }

        if (data.status === "error") {
          setError(data.message || "Video generation failed");
          setIsGenerating(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  // ===================================================================
  // CLEANUP EVENTSOURCE ON UNMOUNT
  // ===================================================================
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // ===================================================================
  // VALIDATIONS
  // ===================================================================
  const validateFile = (fileToValidate) => {
    if (!fileToValidate) return false;
    if (!fileToValidate.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return false;
    }
    if (fileToValidate.size > 50 * 1024 * 1024) {
      setError("PDF must be < 50MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setPreviewUrl(null);
      setVideoUrl(null);
      setShowPreview(false);
      setMangaName(selectedFile.name.replace(".pdf", ""));
      setPanelImages([]);
      setProgress(0);
      setJobId(null);
      setError(null);
      setIsExtracting(false);
      setExtractionProgress("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setMangaName("");
    setPreviewUrl(null);
    setVideoUrl(null);
    setError(null);
    setProgress(0);
    setJobId(null);
    setPanelImages([]);
    setIsExtracting(false);
    setExtractionProgress("");
    
    // Close any active streaming
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===================================================================
  // ⚡ NEW: STREAMING PANEL EXTRACTION
  // ===================================================================
  const startPanelStreaming = (streamJobId) => {
    // Close any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${API_BASE_URL}/api/v1/stream_panels/${streamJobId}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "panel") {
          // ⚡ Add panel immediately as it's uploaded!
          setPanelImages((prev) => [...prev, data.url]);
          setExtractionProgress(data.progress);
        } else if (data.type === "complete") {
          console.log(`✅ All ${data.total} panels extracted`);
          setIsExtracting(false);
          setExtractionProgress(`${data.total}/${data.total}`);
          eventSource.close();
          eventSourceRef.current = null;
        } else if (data.type === "error") {
          setError(data.message || "Panel extraction failed");
          setIsExtracting(false);
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error("Stream parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      setError("Stream connection failed");
      setIsExtracting(false);
      eventSource.close();
      eventSourceRef.current = null;
    };
  };

  // ===================================================================
  // MAIN GENERATE FUNCTION (OPTIMIZED)
  // ===================================================================
  const handleCreateVideo = async () => {
    if (!file) {
      setError("Please upload a PDF first");
      return;
    }

    setIsGenerating(true);
    setIsExtracting(true);
    setProgress(10);
    setError(null);
    setPanelImages([]);
    setExtractionProgress("");

    try {
      // ------------------ STEP 1: Start Audio Story Generation ------------------
      const formData = new FormData();
      formData.append("manga_pdf", file);
      formData.append("manga_name", mangaName);
      formData.append("manga_genre", "Action");

      const audioRes = await fetch(`${API_BASE_URL}/api/v1/generate_audio_story`, {
        method: "POST",
        body: formData,
      });

      if (!audioRes.ok) {
        let errBody = {};
        try {
          errBody = await audioRes.json();
        } catch {
          errBody = { detail: "Audio generation failed" };
        }
        throw new Error(errBody.detail || errBody.message || "Audio generation failed");
      }

      const audioData = await audioRes.json();

      // ⚡ OPTION 1: Use streaming if available (NEW)
      if (audioData.stream_available && audioData.job_id) {
        console.log("✅ Using real-time streaming for panels");
        startPanelStreaming(audioData.job_id);
        setProgress(20);
        
        // Wait for extraction to complete before continuing
        // (Frontend will show panels in real-time via EventSource)
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!isExtracting || panelImages.length > 0) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 500);
        });
      } 
      // ⚡ OPTION 2: Fallback to immediate display (OLD - backward compatible)
      else {
        console.log("✅ Using immediate panel display (fallback)");
        const imgs = audioData.image_urls || audioData.panel_images || [];
        setPanelImages(Array.isArray(imgs) ? imgs : []);
        setIsExtracting(false);
      }

      setProgress(40);

      // ------------------ STEP 2: Generate Video ------------------
      const videoRes = await fetch(`${API_BASE_URL}/api/v1/generate_video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(audioData),
      });

      if (!videoRes.ok) {
        let errBody = {};
        try {
          errBody = await videoRes.json();
        } catch {
          errBody = { detail: "Video generation failed" };
        }
        throw new Error(errBody.detail || errBody.message || "Video generation failed");
      }

      const videoData = await videoRes.json();

      // Show preview if available
      if (videoData.preview_url) {
        setPreviewUrl(videoData.preview_url);
        setShowPreview(true);
      }

      setJobId(videoData.job_id || null);
      setProgress(70);

    } catch (err) {
      setError(err.message || String(err));
      setIsGenerating(false);
      setIsExtracting(false);
      setProgress(0);
    }
  };

  // ===================================================================
  // HELPERS
  // ===================================================================
  const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  const VideoSkeleton = () => (
    <div className="w-full aspect-video bg-gray-800/50 rounded-xl overflow-hidden relative animate-pulse">
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/40 to-transparent animate-shimmer"
        style={{ backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    </div>
  );

  // ===================================================================
  // UI
  // ===================================================================
  return (
    <main className="relative min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-hidden">
      {/* BACKGROUND */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* TITLE */}
      <div className="relative max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          マンファ.ai
        </h1>
        <p className="text-gray-300 text-lg mt-2">
          Transform your manga into stunning videos with AI
        </p>
      </div>

      {/* ========================== UPLOAD + PANELS + SETTINGS ========================== */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* UPLOAD BOX */}
        <div className="lg:col-span-2">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
              isDragging
                ? "border-pink-500 bg-pink-500/10"
                : file
                ? "border-green-500 bg-green-500/10"
                : "border-gray-600 bg-gray-900/40"
            } hover:border-purple-500 cursor-pointer`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {!file ? (
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-16 h-16 text-purple-400 mb-4" />
                <p className="text-xl font-semibold">Drop your manga PDF here</p>
                <p className="text-gray-400 text-sm mt-2">or click to browse</p>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-gray-400 text-sm">{formatSize(file.size)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* ⚡ EXTRACTION PROGRESS BAR (NEW) */}
          {isExtracting && (
            <div className="mt-4 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-300">
                  Extracting panels...
                </span>
                <span className="text-xs text-purple-400">{extractionProgress}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {/* ⚡ PANEL GRID (Real-Time Updates!) */}
          {panelImages && panelImages.length > 0 && (
            <div className="mt-6 bg-gray-900/40 p-4 rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Extracted Panels {isExtracting && "(Live)"}
                </h3>
                <span className="text-sm text-gray-400">{panelImages.length} panels</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {panelImages.map((url, idx) => (
                  <div key={idx} className="relative group animate-fadeIn">
                    <img
                      src={url}
                      alt={`panel-${idx}`}
                      className="w-full h-36 object-cover rounded-lg border border-gray-800 transition-transform group-hover:scale-105"
                    />
                    {/* ⚡ Show "NEW" badge for recently added */}
                    {idx === panelImages.length - 1 && isExtracting && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-xs font-bold rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                ))}

                {/* Show loading placeholder for next panel */}
                {isExtracting && (
                  <div className="w-full h-36 bg-gray-800/50 rounded-lg border border-dashed border-gray-700 animate-pulse flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* SETTINGS */}
        <div className="bg-gray-900/40 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Settings</h3>
          </div>

          <label className="text-sm text-gray-300">Generation Mode</label>
          <div className="mt-2 space-y-2">
            {[
              { value: "images", label: "Original Images", disabled: false },
              { value: "ai", label: "AI Enhanced", disabled: true },
              { value: "both", label: "Hybrid", disabled: true },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`block p-3 rounded-xl border ${
                  opt.disabled
                    ? "opacity-60 cursor-not-allowed"
                    : mode === opt.value
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-700 bg-gray-800/40 hover:bg-gray-700/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mode"
                    value={opt.value}
                    checked={mode === opt.value}
                    onChange={(e) => !opt.disabled && setMode(e.target.value)}
                    disabled={opt.disabled}
                  />
                  <span className="flex items-center gap-2">
                    {opt.label}
                    {opt.disabled && <Lock className="w-4 h-4 text-gray-500" />}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ========================== GENERATE BUTTON ========================== */}
      <div className="text-center mb-10">
        <button
          onClick={handleCreateVideo}
          disabled={isGenerating || !file}
          className={`px-10 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 mx-auto ${
            isGenerating || !file
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:scale-105"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              Generate Video
            </>
          )}
        </button>
      </div>

      {/* ========================== PREVIEW (5s) ========================== */}
      {showPreview && previewUrl && (
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-gray-900/40 p-6 border border-purple-500/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold">Preview (5s)</h3>
            </div>

            <video autoPlay muted className="w-full rounded-xl shadow-2xl">
              <source src={previewUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      )}

      {/* ========================== LOADING SKELETON ========================== */}
      {isGenerating && (
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-gray-900/40 p-6 border border-purple-500/30 rounded-2xl">
            <div className="flex justify-between mb-3">
              <span className="text-gray-300">Processing...</span>
              <span className="text-purple-400 font-bold">{progress}%</span>
            </div>

            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-6">
              <VideoSkeleton />
              <p className="text-center text-gray-400 text-sm mt-3">
                Please wait... this may take a few minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================== FINAL VIDEO ========================== */}
      {videoUrl && !isGenerating && (
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-gray-900/40 p-6 border border-purple-500/30 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Video Ready!
              </h3>

              <a
                href={videoUrl}
                download={`${mangaName}.mp4`}
                className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                <Download className="inline w-5 h-5 mr-2" />
                Download
              </a>
            </div>

            <video controls className="w-full rounded-xl shadow-2xl">
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;