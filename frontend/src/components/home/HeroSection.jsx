import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = ({ heroRef: propHeroRef }) => {
  const localHeroRef = useRef(null);
  const heroRef = propHeroRef || localHeroRef;
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animations instantly on mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleGetStarted = () => {
   
    navigate("/upload");
    console.log("Navigate to /upload");
  };

  return (
    <section
      ref={heroRef}
      className="relative z-10 pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center">
          {/* Badge - Instant fade-up */}
          <div
            className="mb-3 transition-all duration-700 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(32px)",
              transitionDelay: "0ms",
              willChange: "opacity, transform",
            }}
          >
            <span className="text-yellow-400 text-sm font-semibold">
              AI-Powered Animation
            </span>
          </div>

          {/* Main Title - Smooth scale + fade */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 bg-gradient-to-r from-[#a855f7] via-[#7c3aed] to-[#4f46e5] bg-clip-text text-transparent transition-all duration-1000 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "scale(1) translateY(0)" : "scale(0.96) translateY(20px)",
              transitionDelay: "120ms",
              willChange: "opacity, transform",
            }}
          >
            マンファ AI
          </h1>

          {/* Subtitle - Staggered fade-up */}
          <p
            className="mt-12 text-lg sm:text-xl md:text-2xl mb-6 text-yellow-500/50 font-semibold transition-all duration-700 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(32px)",
              transitionDelay: "240ms",
              willChange: "opacity, transform",
            }}
          >
            Transform Manga into Narrated Youtube-Ready Videos in just one click!
          </p>

          {/* Description - Staggered fade-up */}
          <p
            className="text-base sm:text-lg md:text-xl text-gray-400 max-w-6xl mx-auto mb-10 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(32px)",
              transitionDelay: "360ms",
              willChange: "opacity, transform",
            }}
          >
            Experience the future of storytelling — turn your favorite manga
            PDF files into Anime videos with AI.
          </p>

          {/* CTA Button - Final staggered animation */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(32px)",
              transitionDelay: "480ms",
              willChange: "opacity, transform",
            }}
          >
            <button
              onClick={handleGetStarted}
              className="relative px-10 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold bg-white/10 backdrop-blur-xl border border-white/30 text-white overflow-hidden group transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
              style={{
                willChange: "transform",
              }}
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-purple-600/40 to-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ willChange: "opacity" }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight 
                  className="transition-transform duration-200 group-hover:translate-x-1" 
                  style={{ willChange: "transform" }}
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;