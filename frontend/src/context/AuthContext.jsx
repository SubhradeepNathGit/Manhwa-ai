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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- CHANGED: OTP Functions ---

  // 1. Send the Code
  const sendOtp = (email) => {
    return supabase.auth.signInWithOtp({ email });
  };

  // 2. Verify the Code
  const verifyOtp = (email, token) => {
    return supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
  };

  const signInWithGoogle = async () => {
    const redirectTo = window.location.origin; 
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, signInWithGoogle, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);