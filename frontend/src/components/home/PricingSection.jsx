import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ---------------- ANIMATION VARIANTS ---------------- */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ---------------- COMPONENT ---------------- */
const PricingSection = ({ pricingRef }) => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Free",
      originalPrice: "₹0",
      price: "₹0",
      features: [
        "5 videos per month",
        "SD quality output",
        "Basic animations",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      originalPrice: "₹1,499",
      price: "₹0",
      features: [
        "Unlimited videos",
        "HD quality output",
        "Advanced AI animation",
        "Priority support",
        "Custom visual styles",
      ],
      popular: true,
    },
    {
      name: "Studio",
      originalPrice: "₹3,999",
      price: "₹0",
      features: [
        "Everything in Pro",
        "4K ultra-HD output",
        "API access",
        "Team collaboration",
        "Custom branding",
      ],
      popular: false,
    },
  ];

  return (
    <section
      ref={pricingRef}
      className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 overflow-visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* ---------------- HEADER ---------------- */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="
            text-center
            text-3xl sm:text-4xl md:text-5xl lg:text-6xl
            font-bold mb-6 leading-[1.2]
            bg-gradient-to-r from-[#a855f7] via-[#7c3aed] to-[#4f46e5]
            bg-clip-text text-transparent
          "
        >
          Pricing
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          className="text-center text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          We’re currently in{" "}
          <span className="text-yellow-400 font-semibold">Beta</span>.  
          All plans are temporarily free while we test and improve the platform.
        </motion.p>

        {/* ---------------- PRICING GRID ---------------- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`relative flex flex-col h-full rounded-3xl p-6 sm:p-8
                backdrop-blur-2xl bg-white/5 border transition-all duration-500
                ${
                  plan.popular
                    ? "border-yellow-400/40 shadow-2xl shadow-yellow-500/20"
                    : "border-white/10 hover:border-purple-400/40"
                }
              `}
            >
              {/* BETA BADGE */}
              {plan.popular && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white/80 text-[10px] sm:text-xs font-bold shadow-lg">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    BETA ACCESS
                  </div>
                </div>
              )}

              {/* PLAN HEADER */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-3">
                  {plan.name}
                </h3>

                <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                  <span className="text-sm sm:text-lg text-gray-500 line-through">
                    {plan.originalPrice}
                  </span>

                  <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {plan.price}
                  </span>

                  <span className="text-gray-400 text-xs sm:text-sm mb-1">
                    /month
                  </span>
                </div>
              </div>

              {/* FEATURES */}
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="p-1 rounded-full bg-purple-500/10">
                      <Check className="w-4 h-4 text-purple-400" />
                    </span>
                    <span className="text-gray-300 text-sm sm:text-base">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/upload")}
                className="
                  w-full py-3.5 sm:py-4 rounded-full font-semibold
                  bg-white/10 backdrop-blur-xl border border-white/20
                  text-white transition-colors duration-300
                  hover:bg-white/20 hover:border-purple-400/50
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                "
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
