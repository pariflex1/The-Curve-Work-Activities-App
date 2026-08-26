"use client";

import { useState, useEffect } from "react";
import { Plus, X, Coins, Trash2, Building2, CheckCircle2 } from "lucide-react";
import { createPayment, updatePayment, deletePayment } from "./payment-actions";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export interface ContractorOption {
  id: string;
  company_name: string;
  full_name?: string | null;
}

export interface UnitActivityOption {
  id: string;
  unit_number: string;
  block_name: string;
  activity_name: string;
  contractor_name: string;
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
  const [unitActivitiesList, setUnitActivitiesList] = useState<UnitActivityOption[]>([]);
  const [selectedUnitActivityId, setSelectedUnitActivityId] = useState<string>(unitActivityId || "");
  const [selectedContractorName, setSelectedContractorName] = useState<string>(payment?.paid_to || "");
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadData() {
      setFetchingData(true);
      try {
        const supabase = createBrowserClient();

        // 1. Fetch blocks & units for this project to ensure 100% reliable query without deep nested join errors
        const { data: blocks } = await supabase
          .from("blocks")
          .select("id, name, units(id, unit_number)")
          .eq("project_id", projectId);

        const unitMap: Record<string, { unitNumber: string; blockName: string }> = {};
        const unitIds: string[] = [];

        (blocks || []).forEach((b: any) => {
          (b.units || []).forEach((u: any) => {
            unitIds.push(u.id);
            unitMap[u.id] = { unitNumber: u.unit_number, blockName: b.name };
          });
        });

        let list: UnitActivityOption[] = [];

        if (unitIds.length > 0) {
          const { data: ua } = await supabase
            .from("unit_activities")
            .select(`
              id,
              unit_id,
              estimated_cost,
              progress_percentage,
              activity_master ( name ),
              project_contractors (
                company_name,
                profiles ( full_name )
              )
            `)
            .in("unit_id", unitIds);

          if (!isMounted) return;

          if (ua && ua.length > 0) {
            list = ua.map((item: any) => {
              const info = unitMap[item.unit_id] || { unitNumber: "Unit", blockName: "Block" };
              const activityName = item.activity_master?.name || "Activity";
              const cName = item.project_contractors?.company_name || "";
              const pName = item.project_contractors?.profiles?.full_name || "";
              const contractorName = cName
                ? `${cName}${pName && pName !== cName ? ` — ${pName}` : ""}`
                : "Unassigned";

              return {
                id: item.id,
                unit_number: info.unitNumber,
                block_name: info.blockName,
                activity_name: activityName,
                contractor_name: contractorName,
                estimated_cost: Number(item.estimated_cost) || 0,
                progress_percentage: Number(item.progress_percentage) || 0,
              };
            });

            setUnitActivitiesList(list);

            const initialId = unitActivityId || list[0]?.id || "";
            setSelectedUnitActivityId(initialId);
            const matched = list.find((a) => a.id === initialId);
            if (matched && matched.contractor_name !== "Unassigned" && !selectedContractorName) {
              setSelectedContractorName(matched.contractor_name);
            }
          }
        }

        // 2. Fetch project contractors list or all contractor profiles
        if (contractors && contractors.length > 0) {
          setContractorList(contractors);
        } else {
          const { data: pc } = await supabase
            .from("project_contractors")
            .select("id, company_name, profiles(full_name)")
            .eq("project_id", projectId);

          if (!isMounted) return;

          if (pc && pc.length > 0) {
            setContractorList(
              pc.map((c: any) => ({
                id: c.id,
                company_name: c.company_name,
                full_name: c.profiles?.full_name,
              }))
            );
          } else {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name, company_name")
              .eq("role", "contractor");

            if (!isMounted) return;

            if (profiles && profiles.length > 0) {
              setContractorList(
                profiles.map((p: any) => ({
                  id: p.id,
                  company_name: p.company_name || p.full_name,
                  full_name: p.full_name,
                }))
              );
            }
          }
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

  const selectedActivity = unitActivitiesList.find((a) => a.id === selectedUnitActivityId);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.append("project_id", projectId);
    if (selectedUnitActivityId) {
      formData.append("unit_activity_id", selectedUnitActivityId);
    }

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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
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
                  Connect payment directly to Unit Work Activity &amp; Contractor
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              {/* 1. Unit & Work Activity Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Unit &amp; Work Activity *
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
                  onChange={(e) => {
                    setSelectedUnitActivityId(e.target.value);
                    const matched = unitActivitiesList.find((a) => a.id === e.target.value);
                    if (matched && matched.contractor_name !== "Unassigned") {
                      setSelectedContractorName(matched.contractor_name);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  {fetchingData ? (
                    <option value="">Loading unit activities...</option>
                  ) : unitActivitiesList.length > 0 ? (
                    unitActivitiesList.map((ua) => (
                      <option key={ua.id} value={ua.id}>
                        🏢 {ua.block_name} → Unit {ua.unit_number} → {ua.activity_name} ({ua.contractor_name})
                      </option>
                    ))
                  ) : (
                    <option value="">No unit activities found for this project</option>
                  )}
                </select>
                {selectedActivity && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 flex items-center justify-between font-medium">
                    <span className="truncate">
                      Est. Cost: <strong className="font-bold font-mono text-slate-900">₹{selectedActivity.estimated_cost.toLocaleString("en-IN")}</strong>
                    </span>
                    <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      {selectedActivity.progress_percentage}% Verified
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Amount Paid */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Paid (₹) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="100"
                  required
                  defaultValue={payment?.amount || (selectedActivity ? selectedActivity.estimated_cost * (selectedActivity.progress_percentage / 100) : "")}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* 3. Paid To Contractor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Paid To (Contractor) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomRecipient(!useCustomRecipient)}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    {useCustomRecipient ? "Select Contractor Dropdown" : "Custom Recipient"}
                  </button>
                </div>

                {!useCustomRecipient ? (
                  <select
                    name="paid_to"
                    required
                    value={
                      selectedContractorName ||
                      (contractorList[0]
                        ? `${contractorList[0].company_name}${contractorList[0].full_name && contractorList[0].full_name !== contractorList[0].company_name ? ` — ${contractorList[0].full_name}` : ""}`
                        : "")
                    }
                    onChange={(e) => setSelectedContractorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm font-semibold cursor-pointer"
                  >
                    {contractorList.length > 0 ? (
                      contractorList.map((c) => {
                        const val = `${c.company_name}${c.full_name && c.full_name !== c.company_name ? ` — ${c.full_name}` : ""}`;
                        return (
                          <option key={c.id} value={val}>
                            🏢 {val}
                          </option>
                        );
                      })
                    ) : selectedActivity && selectedActivity.contractor_name !== "Unassigned" ? (
                      <option value={selectedActivity.contractor_name}>🏢 {selectedActivity.contractor_name}</option>
                    ) : (
                      <option value="Apex Civil Structures — Amit Patel">🏢 Apex Civil Structures — Amit Patel</option>
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
