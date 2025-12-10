'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Role = 'CL' | 'ADMIN' | 'ACL';

type Profile = {
  id: string;
  name: string;
  phone: string | null;
  role: Role;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  college_id: string | null;
  contingent_code: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [cls, setCls] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // 1. Get current auth user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/login');
        return;
      }

      // 2. Load profile for this user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        setError('Unable to load admin profile.');
        setLoading(false);
        return;
      }

      if (profileData.role !== 'ADMIN') {
        setError('You are not authorized to access this page.');
        setLoading(false);
        return;
      }

      setAdminProfile(profileData as Profile);

      // 3. Load all non-admin profiles (CL + ACL)
      const { data: clData, error: clError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'ADMIN')
        .order('status', { ascending: true })
        .order('name', { ascending: true });

      if (clError || !clData) {
        setError('Unable to load CL/ACL list.');
        setLoading(false);
        return;
      }

      setCls(clData as Profile[]);
      setLoading(false);
    };

    load();
  }, [router]);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingStatusId(id);
    setError(null);

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    setUpdatingStatusId(null);

    if (updateError || !data) {
      setError('Failed to update status. Please try again.');
      return;
    }

    setCls((prev) =>
      prev.map((p) => (p.id === id ? { ...(p as Profile), status } : p)),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-300">
        Loading admin panel…
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-400">
        {error || 'Unable to load admin.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="text-sm text-slate-400">
            Logged in as {adminProfile.name} · ADMIN
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/cl/dashboard')}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
          >
            Go to CL view
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold mb-3">
          Contingent Leaders & ACLs
        </h2>

        {cls.length === 0 ? (
          <p className="text-sm text-slate-400">No signups yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-2 pr-2">Name</th>
                  <th className="text-left py-2 pr-2">Role</th>
                  <th className="text-left py-2 pr-2">CC Code</th>
                  <th className="text-left py-2 pr-2">Phone</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-right py-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cls.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-900 last:border-none"
                  >
                    <td className="py-2 pr-2">{p.name}</td>
                    <td className="py-2 pr-2 text-slate-300">{p.role}</td>
                    <td className="py-2 pr-2 font-mono text-slate-200">
                      {p.contingent_code || '-'}
                    </td>
                    <td className="py-2 pr-2 text-slate-300">
                      {p.phone || '-'}
                    </td>
                    <td className="py-2 pr-2">
                      <span
                        className={`px-2 py-1 rounded-full border text-[10px] ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                            : p.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 pl-2">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={
                            updatingStatusId === p.id || p.status === 'APPROVED'
                          }
                          onClick={() => updateStatus(p.id, 'APPROVED')}
                          className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-[11px]"
                        >
                          {updatingStatusId === p.id &&
                          p.status !== 'APPROVED'
                            ? 'Updating…'
                            : 'Approve'}
                        </button>
                        <button
                          disabled={
                            updatingStatusId === p.id || p.status === 'REJECTED'
                          }
                          onClick={() => updateStatus(p.id, 'REJECTED')}
                          className="px-2 py-1 rounded-md bg-rose-500 hover:bg-rose-400 disabled:bg-slate-700 text-[11px]"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
