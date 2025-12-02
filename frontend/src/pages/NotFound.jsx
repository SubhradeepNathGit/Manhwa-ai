import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Auto redirect after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const transition = { duration: 0.6, ease: "easeOut" };

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          className="text-[90px] sm:text-[140px] md:text-[170px] font-extrabold text-purple-600 leading-none"
        >
          404
        </motion.h1>

        {/* Message Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="mt-4 mb-10 px-2"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Page Not Found
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-3">
            The page you are looking for doesn’t exist or may have been moved.
          </p>

          <p className="text-sm text-white/50">
            Redirecting to the home page in{" "}
            <span className="text-purple-600 font-semibold">{countdown}</span>{" "}
            seconds...
          </p>
        </motion.div>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Go Home */}
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full 
            bg-purple-600 text-white font-medium text-lg shadow-lg shadow-purple-600/40 
            hover:bg-purple-700  active:translate-y-[1px] transition-all"
            style={{ minWidth: "160px" }}
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>

          {/* Go Back */}
          <button
            onClick={() => navigate(-1)}
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
