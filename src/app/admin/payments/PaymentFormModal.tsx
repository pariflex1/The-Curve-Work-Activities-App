"use client";

import { useState } from "react";
import { Plus, X, Coins, Trash2 } from "lucide-react";
import { createPayment, updatePayment, deletePayment } from "./payment-actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
                  Financial transaction record with balance recalculation &amp; audit logging
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Paid (₹) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="100"
                  required
                  defaultValue={payment?.amount || ""}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Paid To (Contractor / Vendor / Agency) *
                </label>
                <input
                  name="paid_to"
                  type="text"
                  required
                  defaultValue={payment?.paid_to || ""}
                  placeholder="e.g. Apex Electricals &amp; MEP"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
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
