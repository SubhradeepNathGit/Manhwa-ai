import { Zap, Video, Image } from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- Container Stagger ---------------- */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/* ---------------- Smooth Flip Variant ---------------- */
const cardVariants = {
  hidden: (direction) => ({
    opacity: 0,
    rotateY: direction * 45, // ⬅️ reduced from 90 → smooth
    scale: 0.96,
  }),
  show: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 22,
      mass: 0.9,
    },
  },
};

const FeaturesSection = ({ featuresRef }) => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Convert manga to video in minutes with AI-powered processing",
    },
    {
      icon: Video,
      title: "HD Quality",
      desc: "Generate stunning 1080p anime-style videos from your manga",
    },
    {
      icon: Image,
      title: "Smart Enhancement",
      desc: "AI enhances colors, movements, and transitions automatically",
    },
    {
      icon: Video,
      title: "Auto Animation",
      desc: "Intelligent frame interpolation for ultra-smooth animations",
    },
  ];

  return (
    <section
      ref={featuresRef}
      className="mt-10 relative z-10 py-20 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* ---------- Header ---------- */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6
            bg-gradient-to-r from-purple-800 via-purple-500 to-indigo-800
            bg-clip-text text-transparent"
          >
            Powerful AI Features
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">
            State-of-the-art technology that brings your manga to life with
            unmatched quality and performance.
          </p>
        </div>

        {/* ---------- Cards ---------- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
          [perspective:1200px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const direction = index % 2 === 0 ? 1 : -1;

            return (
              <motion.div
                key={index}
                custom={direction}
                variants={cardVariants}
                className="group relative backdrop-blur-xl bg-purple-950/20
                p-8 rounded-3xl border border-purple-500/20
                hover:bg-purple-900/30 hover:border-yellow-500/50
                transition-colors duration-500
                overflow-hidden
                [transform-style:preserve-3d]"
              >
                {/* Glow */}
                <div
                  className="absolute inset-0
                  bg-gradient-to-br from-yellow-500/0 to-purple-600/0
                  group-hover:from-yellow-500/5
                  group-hover:to-purple-600/10
                  transition-all duration-500"
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon (NO translate / rotate now) */}
                  <div className="mb-6 text-yellow-400">
                    <Icon className="w-14 h-14 sm:w-16 sm:h-16" />
                  </div>

                  <h3
                    className="text-xl sm:text-2xl font-bold mb-3
                    text-purple-200 group-hover:text-yellow-400
                    transition-colors duration-300"
                  >
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
