import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Tsunami Fest — Student Portal",
  description: "Register, manage contingents, and stay updated for Tsunami Fest.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-md bg-emerald-600 w-12 h-12 flex items-center justify-center text-white font-bold">T</div>
          <div>
            <h1 className="text-lg font-semibold">Tsunami Fest</h1>
            <p className="text-sm text-zinc-500">Student Portal</p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/auth" className="px-4 py-2 rounded-md border border-zinc-200 text-sm hover:bg-zinc-50">
            Sign in
          </Link>
          <Link href="/admin" className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:opacity-95">
            Admin
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Create. Register. Celebrate.</h2>
          <p className="mt-4 text-zinc-600 max-w-xl">Tsunami Fest portal helps college leaders and volunteers register teams, manage contingents, and track approvals — all in one place. Clean, secure, role-based access for CL, ACL, and Admins.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-600 text-white font-medium">
              Get started
            </Link>

            <Link href="/about" className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-zinc-200 text-sm">
              How it works
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md text-sm text-zinc-700">
            <div className="p-4 bg-zinc-50 rounded-md shadow-sm">
              <h4 className="font-semibold">Role-based access</h4>
              <p className="mt-1 text-xs text-zinc-500">CL, ACL, and Admin permissions with secure RLS policies.</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-md shadow-sm">
              <h4 className="font-semibold">Contingent management</h4>
              <p className="mt-1 text-xs text-zinc-500">Assign codes, track approvals, and export lists.</p>
            </div>
          </div>
        </div>

        <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/hero-placeholder.jpg"
            alt="Tsunami Fest banner"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-semibold">Quick actions</h3>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/cl/register" className="p-4 rounded-md border border-zinc-100 hover:shadow">
              <h5 className="font-medium">Register contingent</h5>
              <p className="text-xs text-zinc-500 mt-1">Start a new contingent registration (CL).</p>
            </Link>

            <Link href="/cl/dashboard" className="p-4 rounded-md border border-zinc-100 hover:shadow">
              <h5 className="font-medium">My dashboard</h5>
              <p className="text-xs text-zinc-500 mt-1">View approval status and next steps.</p>
            </Link>

            <Link href="/contact" className="p-4 rounded-md border border-zinc-100 hover:shadow">
              <h5 className="font-medium">Contact team</h5>
              <p className="text-xs text-zinc-500 mt-1">Questions or support for the portal.</p>
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-12 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} Tsunami Fest. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
