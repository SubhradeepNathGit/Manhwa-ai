import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session ? 'Found' : 'Not found');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state changed:', event, session ? 'Session exists' : 'No session');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------- OTP ---------- */
  const sendOtp = async (email) => {
    return supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    });
  };

  const verifyOtp = async (email, token) => {
    return supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });
  };

  /* ---------- GOOGLE OAUTH ---------- */
  const signInWithGoogle = async (redirectUrl) => {
    // ✅ Use provided redirectUrl or fallback to dynamic construction
    const callbackUrl = redirectUrl || `${window.location.origin}/auth/callback`;
    
    console.log('🔍 Starting Google Sign In');
    console.log('🔍 Current origin:', window.location.origin);
    console.log('🔍 Redirect URL:', callbackUrl);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error('❌ OAuth error:', error);
        throw error;
      }

      console.log('✅ OAuth initiated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Sign in with Google failed:', error);
      return { data: null, error };
    }
  };

  const logout = async () => {
    console.log('🔍 Logging out');
    return supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};