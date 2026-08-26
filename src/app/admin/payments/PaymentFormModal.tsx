"use client";

import { useState, useEffect } from "react";
import { Plus, X, Coins, Trash2 } from "lucide-react";
import { createPayment, updatePayment, deletePayment } from "./payment-actions";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export interface ContractorOption {
  id: string;
  company_name: string;
  full_name?: string | null;
}

export interface RawActivityItem {
  id: string;
  unit_id: string;
  unit_number: string;
  block_name: string;
  activity_name: string;
  contractor_id: string | null;
  contractor_name: string;
  contractor_company: string;
  contractor_person: string;
  estimated_cost: number;
  progress_percentage: number;
}

interface PaymentFormModalProps {
  projectId: string;
  unitActivityId?: string | null;
  contractors?: ContractorOption[];
  payment?: {
    id: string;
    amount: number;
    payment_type: string | null;
    paid_to: string | null;
    payment_date: string;
    notes: string | null;
  };
  triggerLabel?: string;
  isEdit?: boolean;
}

export default function PaymentFormModal({
  projectId,
  unitActivityId = null,
  contractors = [],
  payment,
  triggerLabel = "Record Payment",
  isEdit = false,
}: PaymentFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomRecipient, setUseCustomRecipient] = useState(false);

  const [contractorList, setContractorList] = useState<ContractorOption[]>(contractors);
  const [rawActivities, setRawActivities] = useState<RawActivityItem[]>([]);
  
  // 3 Linked Dropdown States
  const [selectedContractorName, setSelectedContractorName] = useState<string>(payment?.paid_to || "");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedUnitActivityId, setSelectedUnitActivityId] = useState<string>(unitActivityId || "");
  const [amountValue, setAmountValue] = useState<string>(payment?.amount ? String(payment.amount) : "");
  
  const [fetchingData, setFetchingData] = useState(false);

  // Helper to format contractor display string
  function formatContractorLabel(company: string, person?: string | null) {
    if (!person || person === company) return company;
    return `${company} — ${person}`;
  }

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadData() {
      setFetchingData(true);
      try {
        const supabase = createBrowserClient();

        // 1. Fetch project contractors
        const { data: pc } = await supabase
          .from("project_contractors")
          .select("id, company_name, profile_id, profiles(full_name)")
          .eq("project_id", projectId);

        let validContractors: ContractorOption[] = [];
        if (pc && pc.length > 0) {
          validContractors = pc
            .filter((c: any) => c.company_name || c.profiles?.full_name)
            .map((c: any) => ({
              id: c.id,
              company_name: c.company_name || "Contractor",
              full_name: c.profiles?.full_name || null,
            }));
        } else if (contractors && contractors.length > 0) {
          validContractors = contractors;
        } else {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, company_name")
            .eq("role", "contractor");

          if (profs && profs.length > 0) {
            validContractors = profs.map((p: any) => ({
              id: p.id,
              company_name: p.company_name || p.full_name,
              full_name: p.full_name,
            }));
          }
        }

        if (isMounted) {
          setContractorList(validContractors);
        }

        // 2. Fetch blocks & units for this project
        const { data: blocks } = await supabase
          .from("blocks")
          .select("id, name, units(id, unit_number)")
          .eq("project_id", projectId);

        const unitMap: Record<string, { unitNumber: string; blockName: string }> = {};
        const unitIds: string[] = [];
        const allUnitsList: { unit_id: string; label: string }[] = [];

        (blocks || []).forEach((b: any) => {
          (b.units || []).forEach((u: any) => {
            unitIds.push(u.id);
            const label = `${b.name} — Unit ${u.unit_number}`;
            unitMap[u.id] = { unitNumber: u.unit_number, blockName: b.name };
            allUnitsList.push({ unit_id: u.id, label });
          });
        });

        let loadedActivities: RawActivityItem[] = [];

        if (unitIds.length > 0) {
          const { data: ua } = await supabase
            .from("unit_activities")
            .select(`
              id,
              unit_id,
              contractor_id,
              estimated_cost,
              progress_percentage,
              activity_master ( name ),
              project_contractors (
                id,
                company_name,
                profiles ( full_name )
              )
            `)
            .in("unit_id", unitIds);

          if (!isMounted) return;

          if (ua && ua.length > 0) {
            loadedActivities = ua.map((item: any) => {
              const info = unitMap[item.unit_id] || { unitNumber: "Unit", blockName: "Block" };
              const activityName = item.activity_master?.name || "Activity";
              const cCompany = item.project_contractors?.company_name || "";
              const cPerson = item.project_contractors?.profiles?.full_name || "";
              const cId = item.contractor_id || item.project_contractors?.id || null;
              const cName = cCompany ? formatContractorLabel(cCompany, cPerson) : "";

              return {
                id: item.id,
                unit_id: item.unit_id,
                unit_number: info.unitNumber,
                block_name: info.blockName,
                activity_name: activityName,
                contractor_id: cId,
                contractor_name: cName,
                contractor_company: cCompany,
                contractor_person: cPerson,
                estimated_cost: Number(item.estimated_cost) || 0,
                progress_percentage: Number(item.progress_percentage) || 0,
              };
            });

            setRawActivities(loadedActivities);
          }
        }

        // 3. Initialize default selections for 3 cascading dropdowns
        if (validContractors.length > 0) {
          const defaultContractor = validContractors[0];
          const defaultContractorLabel = formatContractorLabel(defaultContractor.company_name, defaultContractor.full_name);
          const initialContractor = payment?.paid_to || defaultContractorLabel;
          setSelectedContractorName(initialContractor);

          const matchingActs = loadedActivities.filter(
            (a) =>
              a.contractor_name === initialContractor ||
              a.contractor_company === defaultContractor.company_name ||
              (defaultContractor.company_name && a.contractor_name.includes(defaultContractor.company_name)) ||
              a.contractor_id === defaultContractor.id
          );

          const candidateUnits = matchingActs.length > 0 ? matchingActs : loadedActivities;
          const firstUnitId = candidateUnits[0]?.unit_id || allUnitsList[0]?.unit_id || "";
          setSelectedUnitId(firstUnitId);

          const firstAct = candidateUnits.find((a) => a.unit_id === firstUnitId) ||
            loadedActivities.find((a) => a.unit_id === firstUnitId) ||
            loadedActivities[0];

          if (firstAct) {
            setSelectedUnitActivityId(firstAct.id);
            if (!payment?.amount) {
              const suggested = firstAct.estimated_cost * (firstAct.progress_percentage / 100);
              setAmountValue(suggested > 0 ? String(suggested) : "");
            }
          }
        } else if (loadedActivities.length > 0) {
          const firstAct = loadedActivities[0];
          setSelectedContractorName(firstAct.contractor_name || "");
          setSelectedUnitId(firstAct.unit_id);
          setSelectedUnitActivityId(firstAct.id);
        }
      } catch (err) {
        console.error("Error loading payment connection data:", err);
      } finally {
        if (isMounted) {
          setFetchingData(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId, unitActivityId, contractors]);

  // Derived: Available Units for Selected Contractor
  const allUnits = Array.from(
    new Map(rawActivities.map((a) => [a.unit_id, { unit_id: a.unit_id, label: `${a.block_name} — Unit ${a.unit_number}` }])).values()
  );

  const contractorUnits = Array.from(
    new Map(
      rawActivities
        .filter((a) => {
          if (!selectedContractorName) return false;
          return (
            a.contractor_name === selectedContractorName ||
            (a.contractor_company && selectedContractorName.includes(a.contractor_company))
          );
        })
        .map((a) => [a.unit_id, { unit_id: a.unit_id, label: `${a.block_name} — Unit ${a.unit_number}` }])
    ).values()
  );

  const displayUnits = contractorUnits.length > 0 ? contractorUnits : allUnits;

  // Derived: Available Activities for Selected Contractor AND Selected Unit
  const contractorUnitActivities = rawActivities.filter((a) => {
    const matchesUnit = selectedUnitId ? a.unit_id === selectedUnitId : true;
    const matchesContractor = selectedContractorName
      ? a.contractor_name === selectedContractorName ||
        (a.contractor_company && selectedContractorName.includes(a.contractor_company))
      : false;
    return matchesUnit && matchesContractor;
  });

  const unitFallbackActivities = rawActivities.filter((a) => (selectedUnitId ? a.unit_id === selectedUnitId : true));
  const displayActivities = contractorUnitActivities.length > 0 ? contractorUnitActivities : unitFallbackActivities.length > 0 ? unitFallbackActivities : rawActivities;

  const selectedActivity = rawActivities.find((a) => a.id === selectedUnitActivityId);

  // Cascading Handlers
  function handleContractorChange(newContractor: string) {
    setSelectedContractorName(newContractor);

    // 1. Find units for this new contractor
    const unitsForContractor = Array.from(
      new Map(
        rawActivities
          .filter((a) => a.contractor_name === newContractor || (a.contractor_company && newContractor.includes(a.contractor_company)))
          .map((a) => [a.unit_id, a.unit_id])
      ).values()
    );

    const nextUnitId = unitsForContractor.includes(selectedUnitId)
      ? selectedUnitId
      : unitsForContractor[0] || displayUnits[0]?.unit_id || allUnits[0]?.unit_id || "";

    setSelectedUnitId(nextUnitId);

    // 2. Find activities for this contractor and unit
    const acts = rawActivities.filter(
      (a) =>
        (a.unit_id === nextUnitId) &&
        (a.contractor_name === newContractor || (a.contractor_company && newContractor.includes(a.contractor_company)))
    );

    const nextAct = acts[0] || rawActivities.find((a) => a.unit_id === nextUnitId) || rawActivities[0];
    if (nextAct) {
      setSelectedUnitActivityId(nextAct.id);
      if (!payment?.amount) {
        const suggested = nextAct.estimated_cost * (nextAct.progress_percentage / 100);
        setAmountValue(suggested > 0 ? String(suggested) : "");
      }
    }
  }

  function handleUnitChange(newUnitId: string) {
    setSelectedUnitId(newUnitId);

    const acts = rawActivities.filter(
      (a) =>
        a.unit_id === newUnitId &&
        (selectedContractorName
          ? a.contractor_name === selectedContractorName || (a.contractor_company && selectedContractorName.includes(a.contractor_company))
          : true)
    );

    const nextAct = acts[0] || rawActivities.find((a) => a.unit_id === newUnitId) || rawActivities[0];
    if (nextAct) {
      setSelectedUnitActivityId(nextAct.id);
      if (!payment?.amount) {
        const suggested = nextAct.estimated_cost * (nextAct.progress_percentage / 100);
        setAmountValue(suggested > 0 ? String(suggested) : "");
      }
    }
  }

  function handleActivityChange(newActivityId: string) {
    setSelectedUnitActivityId(newActivityId);
    const act = rawActivities.find((a) => a.id === newActivityId);
    if (act) {
      if (act.contractor_name && act.contractor_name !== "Unassigned" && !selectedContractorName) {
        setSelectedContractorName(act.contractor_name);
      }
      if (!payment?.amount) {
        const suggested = act.estimated_cost * (act.progress_percentage / 100);
        setAmountValue(suggested > 0 ? String(suggested) : "");
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.append("project_id", projectId);
    if (selectedUnitActivityId) {
      formData.append("unit_activity_id", selectedUnitActivityId);
    }
    formData.set("paid_to", selectedContractorName);
    formData.set("amount", amountValue);

    let res;
    if (isEdit && payment) {
      res = await updatePayment(payment.id, formData);
    } else {
      res = await createPayment(formData);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  async function handleConfirmDelete() {
    if (!payment) return;
    const res = await deletePayment(payment.id, projectId, payment.amount, payment.paid_to || "");
    if (res?.error) {
      return { error: res.error };
    }
    setIsOpen(false);
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors min-h-[36px]"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>{triggerLabel}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Payment Record" : "Disburse / Record Payment"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select Contractor → Unit → Work Activity to disburse verified milestone funds
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              {/* 1. First Dropdown: Contractor (Paid To) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    1. Contractor (Paid To) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomRecipient(!useCustomRecipient)}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    {useCustomRecipient ? "Use Contractor Dropdown" : "Custom Recipient"}
                  </button>
                </div>

                {!useCustomRecipient ? (
                  <select
                    name="paid_to"
                    required
                    value={selectedContractorName}
                    onChange={(e) => handleContractorChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    {contractorList.length > 0 ? (
                      contractorList
                        .filter((c) => c.company_name && c.company_name !== "Unassigned")
                        .map((c) => {
                          const label = formatContractorLabel(c.company_name, c.full_name);
                          return (
                            <option key={c.id} value={label}>
                              🏢 {label}
                            </option>
                          );
                        })
                    ) : (
                      rawActivities
                        .filter((a) => a.contractor_name && a.contractor_name !== "Unassigned")
                        .map((a) => (
                          <option key={a.id} value={a.contractor_name}>
                            🏢 {a.contractor_name}
                          </option>
                        ))
                    )}
                  </select>
                ) : (
                  <input
                    name="paid_to"
                    type="text"
                    required
                    value={selectedContractorName}
                    onChange={(e) => setSelectedContractorName(e.target.value)}
                    placeholder="e.g. Apex Electricals & MEP"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm font-medium"
                  />
                )}
              </div>

              {/* 2. Second Dropdown: Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Project Unit *
                </label>
                <select
                  required
                  value={selectedUnitId}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  {fetchingData ? (
                    <option value="">Loading units...</option>
                  ) : displayUnits.length > 0 ? (
                    displayUnits.map((u) => (
                      <option key={u.unit_id} value={u.unit_id}>
                        🏠 {u.label}
                      </option>
                    ))
                  ) : (
                    <option value="">No units found</option>
                  )}
                </select>
              </div>

              {/* 3. Third Dropdown: Work Activity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    3. Work Activity *
                  </label>
                  {selectedActivity && (
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">
                      Progress: {selectedActivity.progress_percentage}%
                    </span>
                  )}
                </div>
                <select
                  name="unit_activity_id"
                  required
                  value={selectedUnitActivityId}
                  onChange={(e) => handleActivityChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  {fetchingData ? (
                    <option value="">Loading activities...</option>
                  ) : displayActivities.length > 0 ? (
                    displayActivities.map((ua) => (
                      <option key={ua.id} value={ua.id}>
                        🔨 {ua.activity_name} ({ua.progress_percentage}% Verified • Est: ₹{ua.estimated_cost.toLocaleString("en-IN")})
                      </option>
                    ))
                  ) : (
                    <option value="">No activities found</option>
                  )}
                </select>

                {selectedActivity && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-medium">
                    <div>
                      <span>Est. Cost: </span>
                      <strong className="font-bold font-mono text-slate-900">
                        ₹{selectedActivity.estimated_cost.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span>Verified Progress: </span>
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        {selectedActivity.progress_percentage}% Complete
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Amount Paid */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Paid (₹) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="100"
                  required
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    name="payment_type"
                    defaultValue={payment?.payment_type || "Bank Transfer"}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI / Digital</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Date
                  </label>
                  <input
                    name="payment_date"
                    type="date"
                    required
                    defaultValue={payment?.payment_date || new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction Notes / Reference #
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={payment?.notes || ""}
                  placeholder="e.g. Transaction Ref: HDFC9283719, Phase 1 milestone completion"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-100 mt-6">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={loading}
                    className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Confirm Payment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEdit && payment && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={`₹${Number(payment.amount).toLocaleString("en-IN")} to ${payment.paid_to}`}
          itemType="payment record"
          warningText="Deleting this transaction will reverse the recorded disbursement and automatically recalculate project financial balances and remaining budgets."
        />
      )}
    </>
  );
}
