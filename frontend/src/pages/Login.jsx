import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";

/* ---------------- Password Strength ---------------- */
const passwordScore = (pwd) => {
  let s = 0;
  if (pwd.length >= 6) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s; // 0–4
};

const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Elite"];

const Login = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- State ---------------- */
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const score = passwordScore(password);
  const from = location.state?.from || "/";

  /* ---------------- GSAP Intro (Once) ---------------- */
  const cardRef = useRef(null);
  const glowTop = useRef(null);
  const glowBottom = useRef(null);

  useEffect(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(
        glowTop.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 1.2 }
      )
      .fromTo(
        glowBottom.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 1.2 },
        "-=1"
      )
      .fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      );
  }, []);

  /* ---------------- Auth Handler (UNCHANGED) ---------------- */
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) throw error;

        if (data.session) {
          navigate(from, { replace: true });
        } else {
          alert("Account created. Please check your email.");
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Background Energy */}
      <div
        ref={glowTop}
        className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-violet-600/20 rounded-full blur-[150px]"
      />
      <div
        ref={glowBottom}
        className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-violet-500/10 rounded-full blur-[170px]"
      />

      {/* Card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_90px_rgba(139,92,246,0.25)] p-8">

          {/* Header */}
          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-center text-sm text-gray-400 mt-2">
            Manhwa → AI Video Platform
          </p>

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={signInWithGoogle}
            className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold"
          >
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl bg-black/40 border border-white/10 py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-300"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Strength Meter */}
            {isSignUp && password && (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 4) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-violet-500"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Strength: {strengthLabel[score]}
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 text-white font-bold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSignUp ? "Create Account" : "Login"}
            </motion.button>
          </form>

          {/* Switch */}
          <p className="text-center mt-6 text-sm text-gray-400">
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-violet-400 font-semibold hover:underline"
            >
              {isSignUp ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
