import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const from = location.state?.from || "/";
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        const { data, error } = await signUpWithEmail(email, password);
        if (error) throw error;

        // CHECK: If confirmation is OFF, Supabase gives a session immediately.
        if (data.session) {
            navigate(from, { replace: true });
        } else {
            // Confirmation is ON, tell them to check email
            alert("Account createed!");
        }

      } else {
        // --- LOGIN LOGIC ---
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        navigate(from, { replace: true }); // Redirect to landing after login
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message); // Show error (e.g., "Password should be at least 6 characters")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/50 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Google Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-700 flex-1" />
          <span className="text-gray-500 text-sm">OR</span>
          <div className="h-px bg-gray-700 flex-1" />
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Basic validation
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
                setIsSignUp(!isSignUp);
                setError(""); // Clear errors when switching
            }}
            className="text-purple-400 hover:underline font-semibold"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;