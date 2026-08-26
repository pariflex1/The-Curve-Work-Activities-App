"use client";

import { useState } from "react";
import { Shield, Filter, Search, Calendar, User, Clock, FileText } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  meta_json: any;
  created_at: string;
  profiles?: {
    full_name: string;
    role: string;
  } | null;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export default function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");

  const actions = Array.from(new Set(logs.map((l) => l.action)));
  const entities = Array.from(new Set(logs.map((l) => l.entity_type)));

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === "all" || log.action === selectedAction;
    const matchesEntity = selectedEntity === "all" || log.entity_type === selectedEntity;
    const matchesSearch =
      !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.meta_json || {}).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAction && matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actor, action, notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Actions ({actions.length})</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Filter */}
        <div>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Entities ({entities.length})</option>
            {entities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Immutable Audit Trail</span>
          </h2>
          <span className="text-xs text-slate-400">
            Showing {filteredLogs.length} of {logs.length} logged events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const formattedDate = new Date(log.created_at).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  });

                  const actionColor =
                    log.action.includes("DELETE")
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : log.action.includes("CREATE") || log.action.includes("ASSIGN")
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";

                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 font-sans text-white">
                        {log.profiles?.full_name ? (
                          <span>
                            {log.profiles.full_name}
                            <span className="text-xs text-slate-500 ml-1">
                              ({log.profiles.role})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">System / Anon</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-sans">
                        {log.entity_type}
                      </td>
                      <td className="px-6 py-4 max-w-md truncate text-slate-400">
                        {log.meta_json ? JSON.stringify(log.meta_json) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans">
                    No audit records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
