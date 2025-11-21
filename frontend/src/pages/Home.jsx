// frontend/src/pages/Home.jsx (WITH BROWSER VIDEO GENERATION)
/**
 * ⚡ OPTIMIZED: Video generation happens in BROWSER using FFmpeg.wasm
 * Backend only provides: images + audio + scene data
 * Result: 10x faster, 100% free, unlimited scalability!
 */

import React, { useState, useRef } from "react";
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
  Video,
} from "lucide-react";

// API
import { generateAudioStory } from '../api/api';

// Video generation utility
import { 
  generateVideoFromScenes, 
  downloadVideo,
  loadFFmpeg 
} from '../utils/videoMaker';

const Home = () => {
  const [file, setFile] = useState(null);
  const [mangaName, setMangaName] = useState("");
  const [mode, setMode] = useState("images");
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  // Story data from backend
  const [storyData, setStoryData] = useState(null);
  const [panelImages, setPanelImages] = useState([]);

  // Video generation states
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoLogs, setVideoLogs] = useState([]);

  const fileInputRef = useRef(null);

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
      setVideoUrl(null);
      setVideoBlob(null);
      setMangaName(selectedFile.name.replace(".pdf", ""));
      setPanelImages([]);
      setStoryData(null);
      setProgress(0);
      setError(null);
      setVideoLogs([]);
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
    setVideoUrl(null);
    setVideoBlob(null);
    setError(null);
    setProgress(0);
    setPanelImages([]);
    setStoryData(null);
    setVideoLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===================================================================
  // STEP 1: Generate Audio Story (Backend)
  // ===================================================================
  const handleGenerateStory = async () => {
    if (!file) {
      setError("Please upload a PDF first");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(null);
    setPanelImages([]);
    setStoryData(null);

    try {
      const formData = new FormData();
      formData.append("manga_pdf", file);
      formData.append("manga_name", mangaName);
      formData.append("manga_genre", "Action");

      setProgress(30);

      const data = await generateAudioStory(formData);

      setStoryData(data);
      setPanelImages(data.image_urls);
      setProgress(100);
      setIsProcessing(false);

      console.log("✅ Story generated:", data);
      alert(`✅ Story ready! ${data.total_panels} panels, ${data.total_duration}s duration. Click "Generate Video" to create the final video in your browser!`);

    } catch (err) {
      setError(err.message || String(err));
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // ===================================================================
  // STEP 2: Generate Video (Browser - FFmpeg.wasm)
  // ===================================================================
  const handleGenerateVideo = async () => {
    if (!storyData) {
      setError("Please generate story first");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setVideoLogs([]);
    setError(null);

    try {
      // Preload FFmpeg first
      setVideoLogs(prev => [...prev, "Loading video processor..."]);
      await loadFFmpeg((p) => setVideoProgress(Math.min(p, 10)));

      setVideoLogs(prev => [...prev, "✅ Video processor loaded"]);

      // Generate video
      const result = await generateVideoFromScenes({
        imageUrls: storyData.image_urls,
        audioUrl: storyData.audio_url,
        scenes: storyData.final_video_segments,
        onProgress: (p) => setVideoProgress(10 + Math.floor(p * 0.9)),
        onLog: (msg) => setVideoLogs(prev => [...prev, msg]),
      });

      setVideoUrl(result.videoUrl);
      setVideoBlob(result.blob);
      setVideoProgress(100);
      setIsGeneratingVideo(false);

      console.log("✅ Video generated:", result);

    } catch (err) {
      console.error("Video generation error:", err);
      setError(err.message || "Video generation failed");
      setIsGeneratingVideo(false);
      setVideoProgress(0);
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

  const handleDownload = () => {
    if (videoBlob) {
      downloadVideo(videoBlob, `${mangaName}.mp4`);
    }
  };

  // ===================================================================
  // UI
  // ===================================================================
  return (
    <main className="relative min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-hidden">
      {/* BACKGROUND */}
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
        <p className="text-sm text-purple-400 mt-1">
          ⚡ Now with ultra-fast browser-based video generation!
        </p>
      </div>

      {/* ========================== UPLOAD + SETTINGS ========================== */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10 max-w-6xl mx-auto">
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
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* PANEL GRID */}
          {panelImages.length > 0 && (
            <div className="mt-6 bg-gray-900/40 p-4 rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Extracted Panels
                </h3>
                <span className="text-sm text-gray-400">{panelImages.length} panels</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {panelImages.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`panel-${idx}`}
                    className="w-full h-36 object-cover rounded-lg border border-gray-800 hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
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

      {/* ========================== ACTION BUTTONS ========================== */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center mb-10">
        {/* Step 1: Generate Story */}
        <button
          onClick={handleGenerateStory}
          disabled={isProcessing || !file}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 ${
            isProcessing || !file
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:scale-105"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing... {progress}%
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Step 1: Generate Story
            </>
          )}
        </button>

        {/* Step 2: Generate Video (Browser) */}
        <button
          onClick={handleGenerateVideo}
          disabled={!storyData || isGeneratingVideo}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 ${
            !storyData || isGeneratingVideo
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105"
          }`}
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating... {videoProgress}%
            </>
          ) : (
            <>
              <Video className="w-6 h-6" />
              Step 2: Generate Video
            </>
          )}
        </button>
      </div>

      {/* ========================== PROCESSING STATUS ========================== */}
      {isProcessing && (
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-gray-900/40 p-6 border border-purple-500/30 rounded-2xl">
            <div className="flex justify-between mb-3">
              <span className="text-gray-300">Backend Processing...</span>
              <span className="text-purple-400 font-bold">{progress}%</span>
            </div>

            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-center text-gray-400 text-sm mt-4">
              Extracting panels, running OCR, generating script & audio...
            </p>
          </div>
        </div>
      )}

      {/* ========================== VIDEO GENERATION STATUS ========================== */}
      {isGeneratingVideo && (
        <div className="max-w-3xl mx-auto mb-10">
          <div className="bg-gray-900/40 p-6 border border-green-500/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold">Generating Video in Browser</h3>
            </div>

            <div className="flex justify-between mb-3">
              <span className="text-gray-300">Progress...</span>
              <span className="text-green-400 font-bold">{videoProgress}%</span>
            </div>

            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${videoProgress}%` }}
              />
            </div>

            {/* Live Logs */}
            <div className="bg-black/40 rounded-lg p-4 max-h-40 overflow-y-auto">
              {videoLogs.map((log, idx) => (
                <div key={idx} className="text-xs text-green-400 font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-sm mt-4">
              ⚡ Video is being created in your browser using FFmpeg.wasm - No backend processing!
            </p>
          </div>
        </div>
      )}

      {/* ========================== FINAL VIDEO ========================== */}
      {videoUrl && !isGeneratingVideo && (
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-gray-900/40 p-6 border border-green-500/30 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Video Ready!
              </h3>

              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-black font-semibold transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>

            <video controls className="w-full rounded-xl shadow-2xl mb-4">
              <source src={videoUrl} type="video/mp4" />
            </video>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>✨ Generated in browser</span>
              <span>•</span>
              <span>⚡ Zero backend cost</span>
              <span>•</span>
              <span>🚀 Ultra fast</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;