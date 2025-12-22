import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/bgAnimation.mp4";
const FALLBACK_IMG = "/bgAnimation-fallback.jpg";

const AnimatedBackground = () => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Preload image for instant display
    const img = new Image();
    img.src = FALLBACK_IMG;

    // Critical autoplay settings
    video.muted = true;
    video.playsInline = true;
    video.defaultMuted = true;
    video.setAttribute("preload", "auto");
    video.setAttribute("x-webkit-airplay", "deny");

    // Force immediate load
    video.load();

    // Handle loaded data event (fires earlier than canplay)
    const handleLoadedData = () => {
      setVideoReady(true);
    };

    // Handle playing state for smooth transition
    const handlePlaying = () => {
      setIsPlaying(true);
    };

    // Aggressive play attempt
    const attemptPlay = async () => {
      try {
        // Small delay to ensure video is truly ready
        await new Promise(resolve => setTimeout(resolve, 50));
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      } catch (err) {
        // Retry on failure
        setTimeout(attemptPlay, 100);
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("playing", handlePlaying);
    
    // Start play attempt
    attemptPlay();

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      
      {/* 🔹 Fallback Image (instant paint with blur-up effect) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${FALLBACK_IMG})`,
          opacity: isPlaying ? 0 : 1,
          willChange: "opacity",
        }}
      />

      {/* 🔹 Background Video (hardware accelerated) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          opacity: isPlaying ? 1 : 0,
          willChange: "opacity",
          transform: "translateZ(0)", // Force GPU acceleration
        }}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        // @ts-ignore
        fetchpriority="high"
        disablePictureInPicture
        disableRemotePlayback
        onLoadedData={() => setVideoReady(true)}
        onPlaying={() => setIsPlaying(true)}
      />

      {/* 🔹 Overlay with smooth transition */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-500"
        style={{ willChange: "opacity" }}
      />
    </div>
  );
};

export default AnimatedBackground;