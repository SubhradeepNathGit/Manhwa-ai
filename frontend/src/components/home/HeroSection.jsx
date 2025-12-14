import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = ({ heroRef: propHeroRef }) => {
  const localHeroRef = useRef(null);
  const heroRef = propHeroRef || localHeroRef;
  const navigate = useNavigate();

  /* ---------------- GSAP LOAD + SCROLL ANIMATIONS ---------------- */
  useEffect(() => {
    let ctx;

    const loadGSAP = async () => {
      const gsapModule = await import(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
      );
      const scrollTriggerModule = await import(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
      );

      const gsap = gsapModule.default || gsapModule;
      const ScrollTrigger =
        scrollTriggerModule.default || scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
          opacity: 0.35,
          scale: 0.96,
          y: -40,
        });

        gsap.to(".badge", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
          y: 80,
          opacity: 0,
        });

        gsap.to(".hero-title", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
          y: 120,
        });

        gsap.to(".hero-subtitle", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
          y: 90,
          opacity: 0,
        });

        gsap.to(".hero-description", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
          y: 70,
          opacity: 0,
        });

        gsap.to(".hero-button", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
          y: 50,
          opacity: 0,
        });
      });
    };

    loadGSAP();
    return () => ctx && ctx.revert();
  }, []);

  /* ---------------- FRAMER VARIANTS ---------------- */
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const titleVariant = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative z-10 pt-32 pb-24 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial="hidden" animate="visible" className="text-center">
          <motion.div variants={fadeUp} className="badge mb-3">
            <span className="text-yellow-400 text-sm font-semibold">
              AI-Powered Animation
            </span>
          </motion.div>

          <motion.h1
            variants={titleVariant}
            className="
              hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl
              font-bold mb-6 bg-gradient-to-r
              from-purple-500 via-purple-700 to-indigo-800
              bg-clip-text text-transparent
            "
          >
            マンファ AI
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="
              hero-subtitle text-xl sm:text-2xl md:text-3xl
              mb-6 text-gray-500/50 font-semibold
            "
          >
            Transform Manga into Mesmerizing Anime
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="
              hero-description text-lg text-gray-400
              max-w-4xl mx-auto mb-12 leading-relaxed
            "
          >
            Experience the future of storytelling — turn your favorite manga
            PDF files into fully-animated YouTube videos with AI.
          </motion.p>

          <motion.div variants={fadeUp} className="hero-button">
            <motion.button
              onClick={() => navigate("/upload")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="
                relative px-12 py-5 rounded-full text-lg font-semibold
                bg-white/10 backdrop-blur-xl
                border border-white/30
                text-white overflow-hidden group
              "
            >
              <span
                className="
                  absolute inset-0 bg-gradient-to-r
                  from-purple-500/40 via-purple-600/40 to-indigo-500/40
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                "
              />
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
