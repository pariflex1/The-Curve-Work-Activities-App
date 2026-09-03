"use client";

import { useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { switchActiveOrganization } from "@/app/auth/org-actions";
import { useRouter } from "next/navigation";

interface OrgItem {
  id: string;
  name: string;
  code: string | null;
  role: string;
}

interface OrganizationSwitcherProps {
  organizations: OrgItem[];
  activeOrgId: string | null;
}

export default function OrganizationSwitcher({
  organizations,
  activeOrgId,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!organizations || organizations.length <= 1) {
    const current = organizations.find((o) => o.id === activeOrgId) || organizations[0];
    if (!current) return null;
    return (
      <div className="px-3 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-800">
        <Building2 className="w-4 h-4 text-[#FF7903]" />
        <span className="truncate">{current.name}</span>
      </div>
    );
  }

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  async function handleSwitch(orgId: string) {
    if (orgId === activeOrgId) {
      setIsOpen(false);
      return;
    }
    setLoading(true);
    const res = await switchActiveOrganization(orgId);
    setLoading(false);
    setIsOpen(false);
    if (!res.error) {
      router.refresh();
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-[#FF7903] shrink-0" />
          <span className="truncate">{currentOrg?.name || "Select Organization"}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Switch Organization ({organizations.length})
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
            {organizations.map((org) => {
              const isActive = org.id === activeOrgId;
              return (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
                    isActive
                      ? "bg-[#FFE5CC] text-[#933D00] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate">{org.name}</p>
                    <span className="text-[10px] text-slate-500 uppercase">Role: {org.role}</span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#FF7903] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
