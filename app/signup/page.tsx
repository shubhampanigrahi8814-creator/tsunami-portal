'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name'));
    const email = String(formData.get('email'));
    const phone = String(formData.get('phone'));
    const password = String(formData.get('password'));

    // 1) Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Signup failed');
      setLoading(false);
      return;
    }

    const user = data.user;

    // 2) Insert profile row (CL, pending, no college_id, no CC code yet)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      name,
      phone,
      role: 'CL',           // CL by default; ACL can be handled later if needed
      status: 'PENDING',    // OC will approve and assign CC code
      college_id: null,
      contingent_code: null,
    });

    if (profileError) {
      console.error(profileError);
      setError('Signup succeeded but profile could not be created. Contact OC.');
      setLoading(false);
      return;
    }

    // 3) Redirect to login
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-[#1a0505] p-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center">
          Tsunami Portal Signup
        </h1>

        {error && (
          <p className="rounded bg-red-600/70 px-3 py-2 text-sm">{error}</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          className="w-full rounded bg-black/40 px-3 py-2 text-sm outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full rounded bg-black/40 px-3 py-2 text-sm outline-none"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone (optional)"
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
          disabled={loading}
          className="w-full rounded bg-[#8b0000] px-3 py-2 text-sm font-semibold hover:bg-red-800 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="text-center text-xs text-gray-300">
          Already registered? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
