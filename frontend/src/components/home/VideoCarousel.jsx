import { ChevronLeft, ChevronRight } from "lucide-react";

const VideoCarousel = ({ videos, currentSlide, setCurrentSlide }) => {
  const nextSlide = () => setCurrentSlide((p) => (p + 1) % videos.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + videos.length) % videos.length);

  return (
    <div className="relative max-w-7xl mx-auto mt-20">
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] rounded-3xl overflow-hidden backdrop-blur-xl bg-black/20 border border-purple-500/20 shadow-2xl shadow-purple-900/50">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-xl border border-purple-500/30 p-4 rounded-full">
        <ChevronLeft />
      </button>

      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-xl border border-purple-500/30 p-4 rounded-full">
        <ChevronRight />
      </button>
    </div>
  );
};

export default VideoCarousel;
