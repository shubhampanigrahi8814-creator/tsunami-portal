// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 bg-[#0e0e0e] text-white">
      <h1 className="text-3xl font-semibold">Tsunami Haunted Circus Portal</h1>
      <p className="text-slate-400 text-sm text-center max-w-sm">
        Welcome to the official Contingent Registration portal. Choose an option to continue.
      </p>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium"
        >
          Login
        </button>

        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
