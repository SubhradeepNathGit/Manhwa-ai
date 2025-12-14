import { Users, Check } from "lucide-react";

const AboutSection = ({ aboutRef }) => {
  return (
    <section ref={aboutRef} className="relative z-10 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-black/30 border border-purple-500/20 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-block mb-6 px-4 py-2 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-full w-fit">
                <span className="text-yellow-400 text-sm font-semibold">
                  About Us
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                Revolutionizing Manga Animation
              </h2>

              <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                Manhwa AI is transforming how manga and webtoon creators share their stories.
                Our advanced artificial intelligence converts static panels into dynamic,
                fully-animated videos perfect for YouTube and streaming platforms.
              </p>

              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Built by creators, for creators, we make professional-quality animation
                accessible to everyone, regardless of technical expertise or budget.
              </p>

              <div className="space-y-4">
                {[
                  "No animation skills required",
                  "Export ready for YouTube",
                  "Professional quality results",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 text-purple-300 group cursor-pointer"
                  >
                    <div className="p-2 bg-yellow-500/10 rounded-full group-hover:bg-yellow-500/20 transition-colors">
                      <Check className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-lg">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-full min-h-[400px] md:min-h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-yellow-500/30"></div>
              <img
                src="https://placehold.co/800x600/000000/8b5cf6?text=AI+Technology"
                alt="AI Technology"
                className="w-full h-full object-cover opacity-80"
              />

              <div className="absolute bottom-8 left-8 backdrop-blur-xl bg-black/50 p-6 rounded-2xl border border-purple-500/30 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <Users className="w-10 h-10 mb-3 text-yellow-400" />
                <div className="text-3xl font-bold text-purple-200">25K+</div>
                <div className="text-gray-400">Happy Creators</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
