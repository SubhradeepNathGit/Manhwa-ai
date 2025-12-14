import { Zap, Video, Image, Sparkles } from "lucide-react";

const FeaturesSection = ({ featuresRef }) => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      desc: "Convert manga to video in minutes with AI-powered processing",
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "HD Quality",
      desc: "Generate stunning 1080p anime-style videos from your manga",
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Smart Enhancement",
      desc: "AI enhances colors, movements, and transitions automatically",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Auto Animation",
      desc: "Intelligent frame interpolation for smooth animations",
    },
  ];

  return (
    <section ref={featuresRef} className="relative z-10 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Powerful AI Features
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            State-of-the-art technology that brings your manga to life with unprecedented quality
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative backdrop-blur-xl bg-purple-950/20 p-8 rounded-3xl border border-purple-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105 hover:bg-purple-900/30 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-purple-600/0 group-hover:from-yellow-500/5 group-hover:to-purple-600/10 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="text-yellow-400 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-purple-200 group-hover:text-yellow-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
