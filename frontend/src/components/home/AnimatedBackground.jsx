const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    {/* Video Background */}
    <video
      className="absolute inset-0 w-full h-full object-cover"
      src="/bgAnimation.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />

    {/* Optional dark overlay for readability */}
    <div className="absolute inset-0 bg-black/50"></div>


  
  </div>
);

export default AnimatedBackground;
