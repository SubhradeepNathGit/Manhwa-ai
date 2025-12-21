import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Auth Callback Component
 * Handles OAuth redirects from Google, GitHub, etc.
 * Place this at route: /auth/callback
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Check for errors in URL
        if (error) {
          console.error('Auth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to establish session');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('Auth successful:', data);
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to home or intended destination
          setTimeout(() => {
            const from = sessionStorage.getItem('auth_redirect') || '/';
            sessionStorage.removeItem('auth_redirect');
            navigate(from, { replace: true });
          }, 1500);
        } else {
          // No tokens found, likely an invalid callback
          setStatus('error');
          setMessage('Invalid authentication response');
          setTimeout(() => navigate('/login'), 3000);
        }
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
          {/* Icon */}
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

          {/* Message */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            <p className="text-purple-200">{message}</p>
          </div>

          {/* Progress bar */}
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