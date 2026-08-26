import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Clock } from "lucide-react";
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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 shrink-0 min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  System Audit Trail &amp; Logs
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Append-only security log tracking contractor reassignments, payment deletions, and lifecycle events
              </p>
            </div>
          </div>
        </div>




        {/* Audit Log Viewer */}
        <AuditLogViewer logs={logs || []} />
      </div>
    </main>
  );
}
