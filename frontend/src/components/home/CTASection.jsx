import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative z-10 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-black/40 border border-purple-500/30 rounded-3xl p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-yellow-500/10"></div>

          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Ready to Bring Your Manga to Life?
            </h2>

            <p className="text-gray-300 mb-10 text-xl leading-relaxed max-w-3xl mx-auto">
              Join thousands of creators already using Manhwa AI to create stunning animated content
            </p>

            <a
              href="/upload"
              className="group inline-flex items-center px-12 py-5 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-110"
            >
              Start Creating Now
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
