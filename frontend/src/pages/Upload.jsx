import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Trash,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Settings,
  Lock,
  Video,
  Film,
  Zap,
  Cpu,
  Maximize,
  Minimize,
} from "lucide-react";

import MySwal from "../utils/swal"


// API
import { generateAudioStory } from '../api/api';

// Video generation utility
import {
  generateVideoFromScenes,
  downloadVideo,
  loadFFmpeg
} from '../utils/videoMaker';

const UploadPage = () => {
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [maxVideoProgress, setMaxVideoProgress] = useState(0);

  const fileInputRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Add shimmer animation keyframes
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    setProgress(0);
    setError(null);
    setPanelImages([]);
    setStoryData(null);
    setVideoUrl(null);
    setVideoBlob(null);

    let progressInterval = null;

    try {
      const formData = new FormData();
      formData.append("manga_pdf", file);
      formData.append("manga_name", mangaName);
      formData.append("manga_genre", "Action");

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 500);

      // Real API call
      const data = await generateAudioStory(formData);

      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);

      setStoryData(data);
      setPanelImages(data.image_urls || []);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);

      console.log("Story generated:", data);
     MySwal.fire({
  icon: "success",
  title: "Story ready!",
  html: `Generated <strong>${data.total_panels}</strong> panels<br/>Duration: <strong>${data.total_duration}s</strong><br/><small>Click <strong>Generate Video</strong> to create the final video in your browser.</small>`
});

    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      console.error("Story generation error:", err);
      // FIX: Ensure error is set correctly, though the rendering fix handles it better.
      setError(err.message || String(err)); 
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // ===================================================================
  // STEP 2: Generate Video (Browser - FFmpeg.wasm)
  // ===================================================================
  const handleGenerateVideo = async () => {
    // Check for both storyData AND extracted panels (as requested previously)
    if (!storyData || panelImages.length === 0) {
      setError("Please generate story/extract panels first");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setMaxVideoProgress(0);
    setVideoLogs([]);
    setError(null);

    try {
      setVideoLogs(prev => [...prev, "Initializing video processor..."]);
      await loadFFmpeg((p) => {
        const safeProgress = Math.min(Math.floor(p), 10);
        setVideoProgress(prev => Math.max(prev, safeProgress));
        setMaxVideoProgress(prev => Math.max(prev, safeProgress));
      });

      setVideoLogs(prev => [...prev, "Video processor loaded successfully"]);
      setVideoLogs(prev => [...prev, "Starting optimized video generation..."]);

      const result = await generateVideoFromScenes({
        imageUrls: storyData.image_urls,
        audioUrl: storyData.audio_url,
        scenes: storyData.final_video_segments,
        onProgress: (p) => {
          const actualProgress = 10 + Math.floor(p * 0.90);
          const safeProgress = Math.min(actualProgress, 100);
          setVideoProgress(prev => Math.max(prev, safeProgress));
          setMaxVideoProgress(prev => Math.max(prev, safeProgress));
        },
        onLog: (msg) => setVideoLogs(prev => [...prev, msg]),
      });

      setVideoUrl(result.videoUrl);
      setVideoBlob(result.blob);
      setVideoProgress(100);
      setMaxVideoProgress(100);

      setTimeout(() => {
        setIsGeneratingVideo(false);
      }, 500);

      console.log("Video generated:", result);

    } catch (err) {
      console.error("Video generation error:", err);
      setError(err.message || "Video generation failed");
      setIsGeneratingVideo(false);
      setVideoProgress(0);
      setMaxVideoProgress(0);
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

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ===================================================================
  // UI
  // ===================================================================
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* TITLE */}
      <div className="relative max-w-6xl mx-auto text-center -mt-5 mb-8 sm:mb-12 lg:mb-16">
        <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <img
            src="/manhwa-logo.png"
            alt="Manhwa Logo"
            className="w-10 h-10 sm:w-10 sm:h-10 lg:w-16 lg:h-16 object-contain"
          />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600">
            マンファ AI
          </h1>
        </div>
        <p className="text-gray-300 text-base sm:text-xs lg:text-xl font-light tracking-wide px-4">
          Turn Your Manga into fully-animated YouTube videos with AI
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 text-xs sm:text-xs text-yellow-400 px-4">
          <Zap className="w-3 h-3 sm:w-3 sm:h-3" />
          <span>Ultra-fast PDF to dynamic Youtube-ready videos</span>
        </div>
      </div>

      {/* ========================== UPLOAD + SETTINGS ========================== */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12 max-w-6xl mx-auto relative">
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
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 backdrop-blur-sm ${isDragging
                ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                : file
                  ? "border-purple-500 bg-purple-500/5"
                  : "border-gray-700 bg-gray-900/30"
              } hover:border-purple-400 cursor-pointer group`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {!file ? (
              <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                </div>
                <p className="text-xl sm:text-2xl font-semibold mb-2 text-center">Drop your manga PDF here</p>
                <p className="text-gray-400 text-sm text-center">or click to browse</p>
                <p className="text-gray-500 text-xs mt-3 sm:mt-4 text-center">Maximum file size: 50MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base sm:text-lg truncate">{file.name}</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">{formatSize(file.size)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2 sm:p-3 hover:bg-purple-500/10 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-purple-500/20"
                >
                  <Trash className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </button>
              </div>
            )}
          </div>

          {/* PANEL GRID */}
          {panelImages.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-gray-900/30 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2">
                  <Film className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Extracted Panels</span>
                </h3>
                <span className="px-2 sm:px-3 py-1 bg-purple-500/10 rounded-full text-xs sm:text-sm text-purple-300 border border-purple-500/20 whitespace-nowrap flex-shrink-0">
                  {panelImages.length} panel{panelImages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {panelImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`panel-${idx}`}
                      
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg sm:rounded-xl border border-purple-500/20 group-hover:scale-105 transition-all shadow-lg"
                      onError={(e) => {
                        console.warn("Failed to load image:", url);
                        e.target.style.opacity = 0.5; // Visual feedback
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg sm:rounded-xl flex items-end justify-center pb-2">
                      <span className="text-xs text-white font-medium">Panel {idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================== PROCESSING STATUS - MOVED HERE ========================== */}
          {isProcessing && (
            <div className="mt-4 sm:mt-6">
              <div className="bg-gray-900/40 backdrop-blur-md p-6 sm:p-8 border border-purple-500/30 rounded-xl sm:rounded-2xl shadow-2xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Cpu className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-semibold">Processing Manga PDF</h3>
                </div>

                <div className="flex justify-between mb-3 text-sm sm:text-base">
                  <span className="text-gray-300 font-medium">Backend Processing</span>
                  <span className="text-purple-400 font-bold text-base sm:text-lg">{progress}%</span>
                </div>

                <div className="h-2 sm:h-3 bg-gray-800/50 rounded-full overflow-hidden mb-4 sm:mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="text-center">Extracting panels, running OCR, generating script and audio...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 sm:p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl flex gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm sm:text-base">{String(error)}</p> {/* FIX: Use String(error) to correctly display object errors */}
            </div>
          )}
        </div>

        {/* SETTINGS */}
        <div className="bg-gray-900/30 backdrop-blur-sm border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h3 className="text-lg sm:text-xl font-semibold">Settings</h3>
          </div>

          <label className="text-xs sm:text-sm text-gray-400 font-medium mb-3 block">Generation Mode</label>
          <div className="space-y-2 sm:space-y-3">
            {[
              { value: "images", label: "Original Images", icon: FileText, disabled: false },
              { value: "ai", label: "AI Enhanced", icon: Cpu, disabled: true },
              { value: "both", label: "Hybrid Mode", icon: Zap, disabled: true },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`block p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${opt.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : mode === opt.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-purple-500/50"
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
                    className="w-4 h-4 text-purple-500"
                  />
                  <opt.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span className="flex-1 text-sm sm:text-base">{opt.label}</span>
                  {opt.disabled && <Lock className="w-4 h-4 text-gray-500" />}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-purple-700">Note :</strong> AI Enhanced and Hybrid modes are coming soon. Currently using original manga panels for video generation.
            </p>
          </div>
        </div>
      </div>

      {/* ========================== ACTION BUTTONS ========================== */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-10 lg:mb-12 relative px-4">
        {/* Step 1: Generate Story */}
        <button
          onClick={handleGenerateStory}
          disabled={isProcessing || !file}
          className={`w-full sm:w-auto px-6 sm:px-8 lg:px-7 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-xl border shadow-[0_8px_25px_rgba(255,255,255,0.15)] 
  ${isProcessing || !file
              ? "opacity-50 cursor-not-allowed bg-white/10 border-white/20"
              : storyData
                ? "bg-gradient-to-r from-purple-600 to-transparent hover:from-purple-500 hover:to-purple-700 border-purple-400 hover:scale-105 active:scale-95"
                : "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95"
            }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              Processing {progress}%
            </>
          ) : storyData ? (
            <>
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
              Generate Frames Again
            </>
          ) : (
            <>
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
              Generate Story
            </>
          )}
        </button>

        {/* Step 2: Generate Video (Browser) */}
        <button
          onClick={handleGenerateVideo}
          // Button is enabled only if storyData exists AND panels have been extracted (panelImages.length > 0)
          disabled={!storyData || isGeneratingVideo || panelImages.length === 0}
          className={`w-full sm:w-auto px-6 sm:px-8 lg:px-7 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-xl border shadow-[0_8px_25px_rgba(255,255,255,0.15)] 
  ${(!storyData || isGeneratingVideo || panelImages.length === 0)
              ? "opacity-50 cursor-not-allowed bg-white/10 border-white/20"
              : storyData
                ? "bg-gradient-to-r from-purple-600 to-transparent hover:from-purple-500 hover:to-purple-700 border-purple-400 hover:scale-105 active:scale-95"
                : "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95"
            }`}
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              Generating {videoProgress}%
            </>
          ) : videoUrl ? (
            <>
              <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              Generate Video Again
            </>
          ) : (
            <>
              <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              Generate Video
            </>
          )}
        </button>
      </div>

      {/* ========================== VIDEO GENERATION STATUS ========================== */}
      {isGeneratingVideo && (
        <div className="max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 relative px-4">
          <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-900/20 backdrop-blur-xl p-6 sm:p-8 border border-purple-500/30 rounded-xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Video className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-bold">Generating Video</h3>
            </div>

            <div className="flex justify-between mb-3 text-sm sm:text-base">
              <span className="text-gray-300 font-medium">Browser Processing</span>
              <span className="text-purple-400 font-bold text-base sm:text-lg">{videoProgress}%</span>
            </div>

            <div className="relative h-3 sm:h-4 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden mb-4 sm:mb-6 border border-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-400/10 to-purple-500/10"></div>
              <div
                className="relative h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transition-all duration-300 ease-out"
                style={{ width: `${videoProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"></div>
              </div>
              <div
                className="absolute top-0 left-0 h-full bg-purple-400/30 blur-md transition-all duration-300 ease-out"
                style={{ width: `${videoProgress}%` }}
              ></div>
            </div>

            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 max-h-40 sm:max-h-48 overflow-y-auto border border-purple-500/10 mb-4">
              {videoLogs.map((log, idx) => (
                <div key={idx} className="text-xs sm:text-sm text-yellow-400 font-mono mb-2 flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-center">Video is being created in your browser using FFmpeg.wasm</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================== FINAL VIDEO ========================== */}
      {videoUrl && !isGeneratingVideo && (
        <div className="max-w-5xl mx-auto mb-20 relative px-4">
          <div
            ref={videoContainerRef}
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30"
          >
            <div className="p-5 sm:p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 via-purple-800/20 to-purple-900/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-transparent flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Video Ready</h3>
                    <p className="text-sm text-gray-400">
                      Your manga video has been generated successfully
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="p-3 rounded-lg bg-black/80 backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-purple-500/50 shadow-lg hover:scale-110"
                    title="Download Video"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-3 rounded-lg bg-black/80 backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-purple-500/50 shadow-lg hover:scale-110"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative bg-black overflow-hidden group">
              <div className="relative w-full h-0" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 overflow-hidden">
                  <video
                    className="absolute top-0 left-0 w-full h-full object-cover blur-3xl scale-110 opacity-40"
                    src={videoUrl}
                    muted
                  />
                </div>
                <video
                  controls
                  className="absolute top-0 left-0 w-full h-full object-cover z-10"
                  controlsList="nodownload"
                  style={{ objectFit: 'cover' }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="bg-gradient-to-r from-transparent via-black/40 to-transparent border-t border-purple-500/20 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent">
                  <Film className="w-4 h-4 text-yellow-400" />
                  <span>Browser Generated</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Zero Server Cost</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Cpu className="w-4 h-4 text-yellow-400" />
                  <span>FFmpeg.wasm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UploadPage;