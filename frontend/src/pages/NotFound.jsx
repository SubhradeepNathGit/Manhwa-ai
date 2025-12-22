import React, { useEffect, useState } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Countdown logic
  useEffect(() => {
    if (countdown === 0) {
      navigate("/", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Title */}
        <h1 className="text-[90px] sm:text-[140px] md:text-[170px] font-extrabold text-purple-600 leading-none">
          404
        </h1>

        {/* Message */}
        <div className="mt-4 mb-10 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Page Not Found
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-3">
            The page you are looking for doesn't exist or may have been moved.
          </p>

          <p className="text-sm text-white/50">
            Redirecting to the home page in{" "}
            <span className="text-purple-600 font-semibold">{countdown}</span>{" "}
            seconds...
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full 
            bg-purple-600 text-white font-medium text-lg shadow-lg shadow-purple-600/40 
            hover:bg-purple-700 active:translate-y-[1px] transition-all"
            style={{ minWidth: "160px" }}
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>

          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full 
            border border-purple-600 bg-black text-white font-medium text-lg 
            hover:bg-purple-600/20 active:translate-y-[1px] transition-all"
            style={{ minWidth: "160px" }}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
