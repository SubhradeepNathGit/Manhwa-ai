import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "Present" : "Missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("❌ Session error:", error);
      }
      if (session) {
        console.log("✅ Active session found:", session.user.email);
      } else {
        console.log("ℹ️ No active session");
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", _event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Send OTP to email
   */
  const sendOtp = async (email) => {
    try {
      console.log("📧 Sending OTP to:", email);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("❌ OTP Error:", error);
        
        // Provide user-friendly error messages
        if (error.message.includes("rate limit")) {
          throw new Error("Too many attempts. Please wait an hour and try again.");
        } else if (error.message.includes("Email not allowed")) {
          throw new Error("This email is not authorized. Please contact support.");
        } else if (error.message.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.");
        } else {
          throw new Error(error.message);
        }
      }

      console.log("✅ OTP sent successfully:", data);
      return { data, error: null };
    } catch (error) {
      console.error("❌ Send OTP failed:", error);
      return { data: null, error };
    }
  };

  /**
   * Verify OTP code
   */
  const verifyOtp = async (email, token) => {
    try {
      console.log("🔐 Verifying OTP for:", email);
      console.log("Token:", token);

      // Validate token
      if (!token || token.length !== 6) {
        throw new Error("OTP must be 6 digits");
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: "email",
      });

      if (error) {
        console.error("❌ Verification Error:", error);
        
        // Provide user-friendly error messages
        if (error.message.includes("expired")) {
          throw new Error("Code expired. Please request a new one.");
        } else if (error.message.includes("Invalid")) {
          throw new Error("Invalid code. Please check and try again.");
        } else {
          throw new Error(error.message);
        }
      }

      console.log("✅ Verification successful:", data);
      return { data, error: null };
    } catch (error) {
      console.error("❌ Verify OTP failed:", error);
      return { data: null, error };
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      console.log("🔵 Initiating Google Sign In...");
      
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_redirect', window.location.pathname);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("❌ Google Sign In Error:", error);
        throw new Error(error.message);
      }

      console.log("✅ Google OAuth initiated:", data);
      // Browser will redirect automatically
      return { data, error: null };
    } catch (error) {
      console.error("❌ Google Sign In failed:", error);
      return { data: null, error };
    }
  };

  /**
   * Sign out current user
   */
  const logout = async () => {
    try {
      console.log("👋 Signing out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Sign out error:", error);
        throw error;
      }
      
      console.log("✅ Signed out successfully");
      return { error: null };
    } catch (error) {
      console.error("❌ Logout failed:", error);
      return { error };
    }
  };

  const value = {
    user,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    logout,
    loading,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};