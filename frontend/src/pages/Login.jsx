import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Swal from "sweetalert2"; // Ensure you have this installed

const Login = () => {
  const { sendOtp, verifyOtp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from || "/";
  
  // GSAP Refs
  const cardRef = useRef(null);
  const glowTop = useRef(null);
  const glowBottom = useRef(null);

  /* ---------------- GSAP Intro ---------------- */
  useEffect(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(glowTop.current, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.2 })
      .fromTo(glowBottom.current, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.2 }, "-=1")
      .fromTo(cardRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6");
  }, []);

  /* ---------------- Step 1: Send Code ---------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await sendOtp(email);
      if (error) throw error;

      setStep("otp");
      Swal.fire({
        icon: 'success',
        title: 'Code Sent!',
        text: 'Please check your email for the 8-digit code.',
        background: '#1a1a1a',
        color: '#fff',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Step 2: Verify Code ---------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await verifyOtp(email, otp);
      if (error) throw error;

      if (data.session) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center bg-black">
      {/* Background Energy */}
      <div ref={glowTop} className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-violet-600/20 rounded-full blur-[150px]" />
      <div ref={glowBottom} className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-violet-500/10 rounded-full blur-[170px]" />

      {/* Card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_90px_rgba(139,92,246,0.25)] p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              {step === "email" ? "Welcome Back" : "Verify Login"}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {step === "email" 
                ? "Manhwa → AI Video Platform" 
                : `Enter the code sent to ${email}`}
            </p>
          </div>

          {/* FORM: EMAIL STEP */}
          {step === "email" ? (
            <div className="space-y-4">
              {/* Google Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={signInWithGoogle}
                className="w-full py-3 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-400">OR EMAIL</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl bg-black/40 border border-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>

                {error && <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded text-center">{error}</div>}

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 text-white font-bold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Send Code
                </motion.button>
              </form>
            </div>
          ) : (
            /* FORM: OTP STEP */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="12345678"
                  className="w-full rounded-xl bg-black/40 border border-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-500 text-lg tracking-widest font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                />
              </div>

              {error && <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded text-center">{error}</div>}

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 text-white font-bold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Verify & Login
              </motion.button>

              <button 
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Email
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;