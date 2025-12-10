'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  name: string;
  phone: string | null;
  role: 'CL' | 'ADMIN' | 'ACL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  college_id: string | null;
  contingent_code: string | null;
};

export default function CLDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // 1) Get user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/login');
        return;
      }

      // 2) Fetch profile
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !data) {
        setError(
          'Profile not found. Please sign up first or contact the OC team.'
        );
        setLoading(false);
        return;
      }

      // 3) If admin, redirect to admin panel
      if (data.role === 'ADMIN') {
        router.replace('/admin');
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    };

    load();
  }, [router]);

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log('DEBUG user result:', user, userError);

    if (userError || !user) {
      router.replace('/login');
      return;
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('DEBUG profile result:', data, profileError);

    if (profileError) {
      setError(`Supabase error: ${profileError.message}`);
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Profile row missing. Contact OC.');
      setLoading(false);
      return;
    }

    if (data.role === 'ADMIN') {
      router.replace('/admin');
      return;
    }

    setProfile(data as Profile);
    setLoading(false);
  };

  load();
}, [router]);


  // ---------- UI STATES ----------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-300">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-sm">
        <p className="text-red-400 text-center px-4">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const statusColor =
    profile.status === 'APPROVED'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
      : profile.status === 'PENDING'
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
      : 'bg-rose-500/10 text-rose-300 border-rose-500/40';

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">CL Dashboard</h1>
        <p className="text-sm text-slate-400">
          Tsunami Haunted Circus · Contingent Management
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {/* Profile card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Contingent Account
            </h2>
            <span
              className={`px-2 py-1 text-[11px] font-medium rounded-full border ${statusColor}`}
            >
              {profile.status}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-slate-400">Name: </span>
              <span className="font-medium text-slate-100">
                {profile.name}
              </span>
            </p>
            <p>
              <span className="text-slate-400">Role: </span>
              <span className="text-slate-100">{profile.role}</span>
            </p>
            <p>
              <span className="text-slate-400">CC Code: </span>
              <span className="font-mono text-slate-100">
                {profile.contingent_code || 'Not assigned yet'}
              </span>
            </p>
            <p>
              <span className="text-slate-400">Phone: </span>
              <span className="text-slate-100">
                {profile.phone || 'Not updated'}
              </span>
            </p>
          </div>
        </div>

        {/* Status + actions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="space-y-1 text-sm">
            <h2 className="text-sm font-semibold text-slate-200">
              Status & Next Steps
            </h2>
            {profile.status === 'APPROVED' ? (
              <p className="text-emerald-300">
                You are approved. You can now register your contingent for
                events using your assigned CC Code.
              </p>
            ) : profile.status === 'PENDING' ? (
              <p className="text-amber-300">
                Your account is pending approval. Once OC approves and assigns
                a CC Code, you will be able to register for events.
              </p>
            ) : (
              <p className="text-rose-300">
                Your account has been rejected. Please contact the OC for
                clarification.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <button
              onClick={() => router.push('/cl/events')}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium"
            >
              Go to Events
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace('/login');
              }}
              className="px-4 py-2 text-sm rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
