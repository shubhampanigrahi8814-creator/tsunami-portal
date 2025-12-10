'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  name: string;
  role: 'CL' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  college_id: string | null;
  contingent_code: string | null;
};

type Event = {
  id: string;
  name: string;
  description: string | null;
  min_team_size: number;
  max_team_size: number;
  college_limit: number | null;
  is_active: boolean;
};

type Registration = {
  id: string;
  event_id: string;
  cl_id: string;
  college_id: string | null;
  team_members: string | null;
};

export default function CLEventsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<number>(0);
  const [teamMembers, setTeamMembers] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Debug: prove this file is loaded
  console.log('Rendering /cl/events page');

  // Load user, profile, events, and existing registrations
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        setError('Unable to load profile.');
        setLoading(false);
        return;
      }

      if (profileData.role !== 'CL') {
        router.replace('/admin');
        return;
      }

      setProfile(profileData as Profile);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (eventsError || !eventsData) {
        setError('Unable to load events.');
        setLoading(false);
        return;
      }

      setEvents(eventsData as Event[]);

      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('cl_id', user.id);

      if (regError || !regData) {
        setRegistrations([]);
      } else {
        setRegistrations(regData as Registration[]);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  // Map for college-level counts per event
  const registrationsByEventAndCollege = useMemo(() => {
    const map = new Map<string, number>();
    registrations.forEach((r) => {
      const key = `${r.event_id}::${r.college_id || 'null'}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [registrations]);

  const handleOpenRegister = (event: Event) => {
    setActiveEventId(event.id);
    setTeamSize(event.min_team_size);
    setTeamMembers('');
  };

  const handleSubmitRegistration = async () => {
    if (!profile || !activeEventId) return;

    const event = events.find((e) => e.id === activeEventId);
    if (!event) return;

    if (profile.status !== 'APPROVED') {
      setError('You must be APPROVED to register for events.');
      return;
    }

    if (!profile.college_id) {
      setError('Your profile is missing college_id. Contact OC.');
      return;
    }

    if (teamSize < event.min_team_size || teamSize > event.max_team_size) {
      setError(
        `Team size must be between ${event.min_team_size} and ${event.max_team_size}.`,
      );
      return;
    }

    const alreadyRegistered = registrations.some(
      (r) => r.event_id === event.id && r.cl_id === profile.id,
    );
    if (alreadyRegistered) {
      setError('You have already registered for this event.');
      return;
    }

    if (event.college_limit && event.college_limit > 0) {
      const key = `${event.id}::${profile.college_id}`;
      const currentCount = registrationsByEventAndCollege.get(key) || 0;
      if (currentCount >= event.college_limit) {
        setError(
          'Your college has reached the registration limit for this event.',
        );
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('registrations')
      .insert({
        event_id: event.id,
        cl_id: profile.id,
        college_id: profile.college_id,
        team_members: teamMembers.trim() || null,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError('Failed to register. Please try again or contact OC.');
      return;
    }

    setRegistrations((prev) => [...prev, data as Registration]);
    setActiveEventId(null);
    setTeamMembers('');
  };

  if (loading) {
    return <div className="text-sm text-slate-300">Loading events…</div>;
  }

  if (error && !profile) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const isBlocked = profile.status !== 'APPROVED';

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-slate-400">
          Register your contingent for Tsunami Haunted Circus events.
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="text-slate-300">
          Logged in as{' '}
          <span className="font-medium">{profile.name}</span> · Status:{' '}
          <span
            className={`font-medium ${
              profile.status === 'APPROVED'
                ? 'text-emerald-300'
                : profile.status === 'PENDING'
                ? 'text-amber-300'
                : 'text-rose-300'
            }`}
          >
            {profile.status}
          </span>
        </div>
        <button
          onClick={() => router.push('/cl/dashboard')}
          className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </div>

      {isBlocked && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
          Your contingent is not approved yet. You can view events, but you
          cannot register until OC approves you.
        </div>
      )}

      <section className="space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No active events right now.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const alreadyRegistered = registrations.some(
                (r) => r.event_id === event.id && r.cl_id === profile.id,
              );

              const collegeKey = `${event.id}::${profile.college_id}`;
              const collegeRegCount =
                registrationsByEventAndCollege.get(collegeKey) || 0;
              const collegeLimitReached =
                event.college_limit &&
                event.college_limit > 0 &&
                collegeRegCount >= event.college_limit;

              return (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-sm font-semibold text-slate-100">
                        {event.name}
                      </h2>
                      {event.description && (
                        <p className="text-xs text-slate-400">
                          {event.description}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Team size: {event.min_team_size} – {event.max_team_size}{' '}
                        {event.college_limit
                          ? `· College limit: ${event.college_limit}`
                          : ''}
                      </p>
                      {event.college_limit && (
                        <p className="text-[11px] text-slate-500">
                          Your college registrations: {collegeRegCount}/
                          {event.college_limit}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {alreadyRegistered ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                          Registered
                        </span>
                      ) : collegeLimitReached ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/40">
                          College limit reached
                        </span>
                      ) : (
                        <button
                          disabled={isBlocked}
                          onClick={() => handleOpenRegister(event)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-400"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>

                  {activeEventId === event.id &&
                    !alreadyRegistered &&
                    !collegeLimitReached && (
                      <div className="mt-3 border-t border-slate-800 pt-3 space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1 text-xs">
                            <label className="block text-slate-300">
                              Team size
                            </label>
                            <input
                              type="number"
                              min={event.min_team_size}
                              max={event.max_team_size}
                              value={teamSize}
                              onChange={(e) =>
                                setTeamSize(Number(e.target.value))
                              }
                              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100"
                            />
                            <p className="text-[11px] text-slate-500">
                              Must be between {event.min_team_size} and{' '}
                              {event.max_team_size}.
                            </p>
                          </div>
                          <div className="space-y-1 text-xs">
                            <label className="block text-slate-300">
                              Team members (optional)
                            </label>
                            <textarea
                              rows={3}
                              value={teamMembers}
                              onChange={(e) =>
                                setTeamMembers(e.target.value)
                              }
                              placeholder="Names, roll numbers, etc."
                              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveEventId(null)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submitting || isBlocked}
                            onClick={handleSubmitRegistration}
                            className="px-4 py-1.5 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400"
                          >
                            {submitting ? 'Submitting…' : 'Confirm Registration'}
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
