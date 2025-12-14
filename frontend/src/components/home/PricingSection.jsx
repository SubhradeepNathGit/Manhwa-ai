import { Check, Star } from "lucide-react";

const PricingSection = ({ pricingRef }) => {
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      features: ["5 videos/month", "SD Quality", "Basic animations", "Community support"],
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      features: [
        "Unlimited videos",
        "HD Quality",
        "Advanced AI",
        "Priority support",
        "Custom styles",
      ],
      popular: true,
    },
    {
      name: "Studio",
      price: "$49",
      features: [
        "Everything in Pro",
        "4K Quality",
        "API Access",
        "Team collaboration",
        "Custom branding",
      ],
      popular: false,
    },
  ];

  return (
    <section ref={pricingRef} className="relative z-10 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-gray-400 text-xl">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative group rounded-3xl p-8 transition-all duration-500 hover:scale-105 cursor-pointer ${
                plan.popular
                  ? "backdrop-blur-xl bg-gradient-to-br from-purple-600/30 to-yellow-500/20 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20"
                  : "backdrop-blur-xl bg-black/30 border border-purple-500/20 hover:border-purple-500/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
                    <Star className="w-4 h-4 mr-2 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-4 text-purple-200">
                  {plan.name}
                </h3>
                <div className="flex items-baseline">
                  <span className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-500/10 rounded-full mt-0.5">
                      <Check className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105"
                    : "bg-purple-600/30 border border-purple-500/50 text-purple-200 hover:bg-purple-600/50 hover:border-yellow-500/50"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
