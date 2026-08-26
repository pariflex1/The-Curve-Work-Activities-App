"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { assignContractorToActivity } from "./contractor-actions";

interface Contractor {
  id: string;
  company_name: string;
  profiles?: any;
}

interface ContractorSelectProps {
  unitActivityId: string;
  currentContractorId: string | null;
  contractors: Contractor[];
  projectId: string;
  unitId: string;
}

export default function ContractorSelect({
  unitActivityId,
  currentContractorId,
  contractors,
  projectId,
  unitId,
}: ContractorSelectProps) {
  const [selectedId, setSelectedId] = useState(currentContractorId || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newId = e.target.value;
    setSelectedId(newId);
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await assignContractorToActivity(
      unitActivityId,
      newId ? newId : null,
      projectId,
      unitId
    );

    if (res?.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedId}
        onChange={handleChange}
        disabled={loading}
        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 min-w-[180px] min-h-[36px]"
      >
        <option value="">-- Unassigned --</option>
        {contractors.map((c) => {
          const name = Array.isArray(c.profiles) ? c.profiles[0]?.full_name : c.profiles?.full_name;
          return (
            <option key={c.id} value={c.id}>
              {c.company_name} {name ? `(${name})` : ""}
            </option>
          );
        })}
      </select>

      {loading && <span className="text-xs text-blue-600 font-semibold animate-pulse">Saving...</span>}
      {saved && (
        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Assigned</span>
        </span>
      )}
      {error && <span className="text-xs text-red-600 truncate max-w-[120px]">{error}</span>}
    </div>
  );
}
