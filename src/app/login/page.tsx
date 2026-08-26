"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Building2, Lock, Smartphone, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          The Curve Real Estate Construction &amp; Payments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-sm border border-slate-200 rounded-3xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                Mobile Number or Email
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-base sm:text-sm transition-all"
                  placeholder="e.g. 9876543210 or admin@thecurve.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-600 hover:text-black font-semibold"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-base sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-50 text-sm"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Accounts are issued and authorized by the Administrator.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
