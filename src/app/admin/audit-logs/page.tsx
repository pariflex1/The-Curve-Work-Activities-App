import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield, Clock } from "lucide-react";
import AuditLogViewer from "./AuditLogViewer";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch audit logs with profile actors
  const { data: logs } = await supabase
    .from("audit_logs")
    .select(`
      *,
      profiles (
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <Link
            href="/admin"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-purple-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                System Audit Trail &amp; Logs
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Append-only security log tracking contractor reassignments, payment deletions, and lifecycle events
            </p>
          </div>
        </div>

        {/* Audit Log Viewer */}
        <AuditLogViewer logs={logs || []} />
      </div>
    </main>
  );
}
