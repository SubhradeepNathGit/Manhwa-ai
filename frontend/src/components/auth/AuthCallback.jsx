import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase auto-detects session because detectSessionInUrl = true
        const { data } = await supabase.auth.getSession();

        if (!data?.session) {
          setStatus('error');
          setMessage('Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');

        setTimeout(() => {
          const saved = sessionStorage.getItem("auth_redirect");

          if (saved) {
            const { pathname, search, state } = JSON.parse(saved);
            sessionStorage.removeItem("auth_redirect");

            navigate(`${pathname}${search || ""}`, {
              replace: true,
              state,
            });
          } else {
            navigate("/upload", { replace: true });
          }
        }, 1500);
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-10 max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-4">
            {status === 'loading' && (
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-10 h-10 text-green-400" />
            )}
            {status === 'error' && (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            <p className="text-purple-200">{message}</p>
          </div>

          {status === 'loading' && (
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
