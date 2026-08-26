"use client";

import { useState } from "react";
import { AlertTriangle, Lock, Eye, EyeOff, X, Loader2, Trash2 } from "lucide-react";
import { verifyUserPassword } from "@/app/auth/verify-password";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ error?: string } | void | undefined>;
  title?: string;
  itemName?: string;
  itemType?: string; // e.g. "project", "block", "unit", "activity", "payment"
  warningText?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = "item",
  warningText,
}: DeleteConfirmationModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your account password to confirm.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Verify password with backend
    const check = await verifyUserPassword(password);
    if (!check.valid) {
      setError(check.error || "Incorrect password. Deletion unauthorized.");
      setLoading(false);
      return;
    }

    // 2. Perform deletion callback
    try {
      const res = await onConfirm();
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setPassword("");
      setError(null);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete item.");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setPassword("");
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {title || `Delete ${itemType}?`}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Authentication required for permanent deletion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="bg-red-50/80 border border-red-100 rounded-xl p-3.5 text-xs text-red-800 space-y-1">
          {itemName && (
            <p className="font-semibold text-red-900">
              Target: <span className="font-mono underline">{itemName}</span>
            </p>
          )}
          <p>
            {warningText ||
              `This action is irreversible. All associated data will be permanently removed. To confirm this deletion, please enter your account password below.`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Account Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                autoFocus
                placeholder="Enter your password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 min-h-[40px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
