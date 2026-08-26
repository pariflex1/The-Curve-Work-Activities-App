"use client";

import { useState } from "react";
import { Plus, X, Coins, Trash2 } from "lucide-react";
import { createPayment, updatePayment, deletePayment } from "./payment-actions";

interface PaymentFormModalProps {
  projectId: string;
  unitActivityId?: string | null;
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
  payment,
  triggerLabel = "Record Payment",
  isEdit = false,
}: PaymentFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.append("project_id", projectId);
    if (unitActivityId) {
      formData.append("unit_activity_id", unitActivityId);
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

  async function handleDelete() {
    if (!payment || !confirm(`Delete payment of ₹${payment.amount} to ${payment.paid_to}?`)) return;
    setLoading(true);
    const res = await deletePayment(payment.id, projectId, payment.amount, payment.paid_to || "");
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-1.5 text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{triggerLabel}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isEdit ? "Edit Payment Record" : "Disburse / Record Payment"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Financial transaction record with balance recalculation &amp; audit logging
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount Paid (₹) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="100"
                  required
                  defaultValue={payment?.amount || ""}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Paid To (Contractor / Vendor / Agency) *
                </label>
                <input
                  name="paid_to"
                  type="text"
                  required
                  defaultValue={payment?.paid_to || ""}
                  placeholder="e.g. Apex Electricals &amp; MEP"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    name="payment_type"
                    defaultValue={payment?.payment_type || "Bank Transfer"}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI / Digital</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Payment Date
                  </label>
                  <input
                    name="payment_date"
                    type="date"
                    required
                    defaultValue={payment?.payment_date || new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Transaction Notes / Reference #
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={payment?.notes || ""}
                  placeholder="e.g. Transaction Ref: HDFC9283719, Phase 1 milestone completion"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-5 border-t border-white/10 mt-6">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Confirm Payment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
