import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const HeroSection = ({ heroRef: propHeroRef }) => {
  const localHeroRef = useRef(null);
  const heroRef = propHeroRef || localHeroRef;

  useEffect(() => {
    // Dynamically load GSAP and ScrollTrigger
    const loadGSAP = async () => {
      const gsapModule = await import('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
      const scrollTriggerModule = await import('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
      
      const gsap = gsapModule.default || gsapModule;
      const ScrollTrigger = scrollTriggerModule.default || scrollTriggerModule.ScrollTrigger;
      
      gsap.registerPlugin(ScrollTrigger);

      // GSAP ScrollTrigger animations
      const ctx = gsap.context(() => {
        // Fade and scale hero section on scroll
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          opacity: 0.3,
          scale: 0.95,
          y: -50,
        });

        // Parallax effect for badge
        gsap.to(".badge", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2,
          },
          y: 100,
          opacity: 0,
        });

        // Parallax effect for title
        gsap.to(".hero-title", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
          y: 150,
        });

        // Parallax effect for subtitle
        gsap.to(".hero-subtitle", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
          y: 120,
        });

        // Parallax effect for description
        gsap.to(".hero-description", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: 80,
        });

        // Button stays longer
        gsap.to(".hero-button", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
          y: 60,
          opacity: 0,
        });
      });

      return () => ctx.revert();
    };

    loadGSAP();
  }, []);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const fadeInUpVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section ref={heroRef} className="relative z-10 pt-30 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUpVariants} className="badge">
            <span className="text-yellow-400 text-sm font-semibold inline-block">
              AI-Powered Animation
            </span>
          </motion.div>

          <motion.h1
            variants={titleVariants}
            className="hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-purple-800 to-indigo-800 bg-clip-text text-transparent leading-tight"
          >
            マンファ AI
          </motion.h1>

          <motion.p
            variants={fadeInUpVariants}
            className="hero-subtitle text-xl sm:text-2xl md:text-3xl mb-5 -mt-2 text-gray-500 font-semibold"
          >
            Transform Manga into Mesmerizing Anime
          </motion.p>

          <motion.p
            variants={fadeInUpVariants}
            className="hero-description text-lg text-gray-400 max-w-4xl mt-5 mx-auto mb-12 leading-relaxed"
          >
            Experience the future of storytelling-Turn your favorite manga PDF/DOCX files into fully-animated YouTube videos with AI
          </motion.p>

          <motion.div
            variants={fadeInUpVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center hero-button"
          >
            <motion.a
              href="/upload"
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 via-purple-700 to-indigo-500 border border-purple-400 rounded-full text-lg font-semibold overflow-hidden transition-all duration-300 cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="relative z-10 flex items-center">
                Start Creating{" "}
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight />
                </motion.span>
              </span>
            </motion.a>
            
          </motion.div>
          
        </motion.div>
        
      </div>
    </section>
  );
};

export default HeroSection;