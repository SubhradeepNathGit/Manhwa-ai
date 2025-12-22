import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = ({ heroRef: propHeroRef }) => {
  const localHeroRef = useRef(null);
  const heroRef = propHeroRef || localHeroRef;
  const navigate = useNavigate();

  /* ---------------- FRAMER MOTION VARIANTS ---------------- */
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const titleVariant = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative z-10 pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={fadeUp} className="mb-3">
            <span className="text-yellow-400 text-sm font-semibold">
              AI-Powered Animation
            </span>
          </motion.div>

          <motion.h1
            variants={titleVariant}
            className="
  text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
  font-bold mb-6 bg-gradient-to-r
  from-[#a855f7] via-[#7c3aed] to-[#4f46e5]
  bg-clip-text text-transparent
"

          >
            マンファ AI
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className=" mt-12
              text-lg sm:text-xl md:text-2xl
              mb-6 text-yellow-500/50 font-semibold
            "
          >
            Transform Manga into Animated Youtube-Ready Videos in just one click!
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="
              text-base sm:text-lg md:text-xl text-gray-400
              max-w-6xl mx-auto mb-10 leading-relaxed
            "
          >
            Experience the future of storytelling — turn your favorite manga
            PDF files into Anime videos with AI.
          </motion.p>

          <motion.div variants={fadeUp}>
            <motion.button
              onClick={() => navigate("/upload")}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="
                relative px-10 sm:px-12 py-4 sm:py-5
                rounded-full text-base sm:text-lg font-semibold
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
