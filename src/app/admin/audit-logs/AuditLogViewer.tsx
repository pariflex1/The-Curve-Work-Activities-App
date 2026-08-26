"use client";

import { useState } from "react";
import { ShieldCheck, Filter, Search } from "lucide-react";

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
    <div className="space-y-4 sm:space-y-6">
      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actor, action, notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-xs sm:text-sm"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
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
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>Immutable Audit Trail</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredLogs.length} of {logs.length} logged events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity Type</th>
                <th className="px-5 py-3.5">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const formattedDate = new Date(log.created_at).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  });

                  const actionColor =
                    log.action.includes("DELETE")
                      ? "bg-red-50 text-red-700 border-red-200"
                      : log.action.includes("CREATE") || log.action.includes("ASSIGN")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-slate-900 font-medium">
                        {log.profiles?.full_name ? (
                          <span>
                            {log.profiles.full_name}
                            <span className="text-xs text-slate-400 ml-1">
                              ({log.profiles.role})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">System / Anon</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-sans font-medium">
                        {log.entity_type}
                      </td>
                      <td className="px-5 py-3.5 max-w-md truncate text-slate-500">
                        {log.meta_json ? JSON.stringify(log.meta_json) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-sans">
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
