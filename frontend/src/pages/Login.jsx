import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, Shield, Lock } from "lucide-react";
import Swal from "sweetalert2";

const Login = () => {
  const { sendOtp, verifyOtp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  
  const from = location.state?.from || "/";
  const otpInputs = useRef([]);

  /* ---------------- Send OTP ---------------- */
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending OTP to:", email);
      const { data, error } = await sendOtp(email);
      
      if (error) {
        console.error("OTP Send Error:", error);
        throw error;
      }

      console.log("OTP Response:", data);
      setStep("otp");
      
      Swal.fire({
        icon: 'success',
        title: 'Code Sent!',
        text: 'Please check your email (and spam folder) for the 6-digit code.',
        background: 'transparent',
        color: '#fff',
        timer: 4000,
        showConfirmButton: false,
        iconColor: '#a78bfa'
      });
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Verify OTP ---------------- */
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Verifying OTP:", otp);
      const { data, error } = await verifyOtp(email, otp);
      
      if (error) {
        console.error("OTP Verify Error:", error);
        throw error;
      }

      console.log("Verification Response:", data);

      if (data.session) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Login successful. Redirecting...',
          background: '#1a1a1a',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
          iconColor: '#a78bfa'
        });

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Google Sign In ---------------- */
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Initiating Google Sign In...");
      
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        console.error("Google Sign In Error:", error);
        throw error;
      }

      console.log("Google Sign In Response:", data);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to sign in with Google");
      setLoading(false);
    }
  };

  /* ---------------- OTP Input Handlers ---------------- */
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(0, 1);
    
    const newOtp = otp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join(''));
    
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pastedData);
    
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputs.current[nextIndex]?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (step === 'email') {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`
        }}></div>
        
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {step === "email" ? "Sign up for free " : "Verify Login"}
            </h1>
            <p className="text-lg text-purple-200">
              {step === "email" 
                ? "Manhwa AI" 
                : `Enter the code sent to ${email}`}
            </p>
          </div>

          {/* EMAIL STEP */}
          {step === "email" ? (
            <div className="space-y-5">
              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-transparent border border-gray-400/60 text-white font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-xs text-purple-200 font-medium">OR EMAIL</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-200 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your email"
                    className="w-full rounded-xl bg-transparent backdrop-blur-sm border border-white/20 py-3.5 pl-12 pr-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/20 backdrop-blur-sm p-3 rounded-lg border border-red-400/30 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
                )}
              </button>

              <p className="text-xs text-center text-purple-200/70 mt-6">
                By continuing, you agree to our{" "}
                <a href="#" className="underline hover:text-white transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          ) : (
            /* OTP STEP */
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-purple-200 block text-center">
                  Enter 6-Digit Code
                </label>
                
                {/* OTP Input Grid */}
                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onKeyPress={handleKeyPress}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/20 backdrop-blur-sm p-3 rounded-lg border border-red-400/30 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </button>

              <button 
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
                className="w-full text-sm text-purple-200 hover:text-white flex items-center justify-center gap-2 py-2 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setOtp("");
                    handleSendOtp();
                  }}
                  disabled={loading}
                  className="text-sm text-purple-300 hover:text-white underline transition-colors disabled:opacity-50"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-6 text-sm text-purple-200/60 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          Secure authentication
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;