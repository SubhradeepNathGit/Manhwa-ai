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

  // Define transition for minimal animation
  const transition = { duration: 0.5, ease: "easeOut" };

  return (
    // Use black background for minimal, professional look
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        {/* 404 Title - Large and bold, using primary color */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          className="text-[100px] sm:text-[150px] font-extrabold text-purple-600 mb-4"
        >
          404
        </motion.h1>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-md text-white/70 max-w-lg mx-auto mb-4">
            We couldn't find the page you were looking for. It might have been moved or deleted.
          </p>
          <p className="text-sm text-white/50">
            Redirecting to the home page in{" "}
            <span className="text-purple-600 font-semibold">{countdown}</span>{" "}
            seconds...
          </p>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary Action: Go Home (using purple-600) */}
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium text-lg shadow-lg shadow-purple-600/40 transition-all duration-200 hover:bg-purple-700 hover:shadow-purple-600/60 active:translate-y-px"
            style={{ minWidth: '160px' }}
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          {/* Secondary Action: Go Back (minimal style) */}
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black text-white border border-purple-600 font-medium text-lg transition-all duration-200 hover:bg-purple-600/20 active:translate-y-px"
            style={{ minWidth: '160px' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;