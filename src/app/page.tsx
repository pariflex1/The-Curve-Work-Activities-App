import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  // Smoke test: call SELECT NOW() via the get_server_time RPC
  const { data: serverTime, error: timeError } = await supabase.rpc(
    "get_server_time"
  );

  const connectionStatus = !timeError ? "✅ Connected" : "❌ Failed";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Real Estate Work &amp; Payment System
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Phase 0 — Connectivity Smoke Test
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">
                  Supabase Connection
                </span>
                <span className="text-lg">{connectionStatus}</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">
                  SELECT NOW() Result
                </span>
                <span className="text-emerald-400 text-sm font-mono">
                  {timeError ? timeError.message : String(serverTime)}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">
                  Project URL
                </span>
                <span className="text-cyan-400 text-xs font-mono truncate ml-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              Next.js App Router • TypeScript • Tailwind CSS • Supabase
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
