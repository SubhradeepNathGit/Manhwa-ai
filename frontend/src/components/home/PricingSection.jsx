import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

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
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ---------------- COMPONENT ---------------- */
const PricingSection = ({ pricingRef }) => {
  const pricingPlans = [
    {
      name: "Free",
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
      price: "₹1,499",
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
      price: "₹3,999",
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
      className="relative z-10 px-4 pt-32 pb-24 overflow-visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* ---------------- HEADER ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20 relative overflow-visible"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.15] pb-3 bg-gradient-to-r from-purple-800 via-purple-300 to-indigo-800 bg-clip-text text-transparent">
            Upgrade Your Plan
          </h2>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Start free. Upgrade anytime as your manga animations scale.
          </p>
        </motion.div>

        {/* ---------------- PRICING GRID ---------------- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`relative flex flex-col h-full rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 ${
                plan.popular
                  ? "bg-gradient-to-br from-purple-600/30 to-yellow-500/20 border-2 border-yellow-400/40 shadow-2xl shadow-yellow-500/20"
                  : "bg-black/40 border border-purple-500/20 hover:border-purple-400/40"
              }`}
            >
              {/* POPULAR BADGE */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* PLAN HEADER */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-purple-200 mb-3">
                  {plan.name}
                </h3>

                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 mb-1 text-sm">
                    /month
                  </span>
                </div>
              </div>

              {/* FEATURES */}
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="p-1 rounded-full bg-yellow-500/10">
                      <Check className="w-4 h-4 text-yellow-400" />
                    </span>
                    <span className="text-gray-300 text-sm sm:text-base">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-4 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  plan.popular
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:shadow-xl hover:shadow-yellow-500/40"
                    : "bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/50 hover:border-yellow-400/50"
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
