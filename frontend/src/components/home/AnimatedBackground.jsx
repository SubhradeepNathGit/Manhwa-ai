import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/bgAnimation.mp4";

const AnimatedBackground = () => {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(
    typeof window !== "undefined" && localStorage.getItem("bgVideoLoaded")
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force load immediately
    video.load();

    const handleCanPlay = () => {
      localStorage.setItem("bgVideoLoaded", "true");
      setReady(true);
      video.play().catch(() => {});
    };

    video.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
};

export default AnimatedBackground;
