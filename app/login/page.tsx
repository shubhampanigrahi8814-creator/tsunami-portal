'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // --------------------------
  // EMAIL + PASSWORD LOGIN
  // --------------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    // 1) Log in via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setError(error?.message || 'Login failed');
      setLoading(false);
      return;
    }

    const user = data.user;

    // 2) Try to fetch profile (to see if this is an ADMIN)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    setLoading(false);

    if (profileData?.role === 'ADMIN') {
      // Explicit admin → go to admin panel
      router.push('/admin');
    } else {
      // No profile OR CL / ACL → go to CL dashboard
      // CL dashboard already auto-creates the profile if missing
      router.push('/cl/dashboard');
    }
  };

  // --------------------------
  // GOOGLE LOGIN
  // --------------------------
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setGoogleLoading(true);

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/cl/dashboard`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        console.error('Google sign-in error:', error.message);
        setError('Google sign-in failed. Try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-[#1a0505] p-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center">
          Tsunami Portal Login
        </h1>

        {error && (
          <p className="rounded bg-red-600/70 px-3 py-2 text-sm">{error}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full rounded bg-black/40 px-3 py-2 text-sm outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full rounded bg-black/40 px-3 py-2 text-sm outline-none"
        />

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full rounded bg-[#8b0000] px-3 py-2 text-sm font-semibold hover:bg-red-800 disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-700" />
          <span>or</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        {/* GOOGLE SIGN-IN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 rounded bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-100 disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 11.8v3.6h5.1c-.2 1.2-.9 2.3-2 3.1l3.3 2.6C20.6 19.3 22 16.4 22 13c0-.7-.1-1.4-.2-2H12z"
            />
            <path
              fill="#34A853"
              d="M5.3 14.3l-.8.6-2.6 2C3.1 20.2 7.2 22.5 12 22.5c3.1 0 5.7-1 7.6-2.8l-3.3-2.6c-1 .7-2.3 1.1-4.3 1.1-3.3 0-6.1-2.2-7.1-5.2z"
            />
            <path
              fill="#4285F4"
              d="M2 6.6L5.3 9c1-3 3.8-5.2 7.1-5.2 1.8 0 3.4.6 4.7 1.8L20 2.7C18 1 15.4 0 12.4 0 7.6 0 3.5 2.3 2 6.6z"
            />
            <path
              fill="#FBBC05"
              d="M12 22.5c-4.8 0-8.9-2.3-10.7-5.7L5.3 14c.9 3 3.8 5.2 7.1 5.2 1.9 0 3.3-.5 4.3-1.1l3.3 2.6C17.7 21.5 15.1 22.5 12 22.5z"
            />
          </svg>

          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <p className="text-center text-xs text-gray-300">
          New Contingent Lead? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
