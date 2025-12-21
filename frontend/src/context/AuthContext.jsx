import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Send OTP to email
   * @param {string} email - User's email address
   * @returns {Promise} Supabase response
   */
  const sendOtp = async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Auto-create user if doesn't exist
          emailRedirectTo: window.location.origin, // Where to redirect after email link click
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return { data: null, error };
    }
  };

  /**
   * Verify OTP code
   * @param {string} email - User's email address
   * @param {string} token - 6-digit OTP code
   * @returns {Promise} Supabase response
   */
  const verifyOtp = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email", // or "magiclink" depending on your setup
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { data: null, error };
    }
  };

  /**
   * Sign in with Google OAuth
   * @returns {Promise} Supabase response
   */
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // Redirect after Google auth
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { data: null, error };
    }
  };

  /**
   * Sign out current user
   * @returns {Promise} Supabase response
   */
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error);
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
    supabase, // Export supabase client for direct access if needed
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