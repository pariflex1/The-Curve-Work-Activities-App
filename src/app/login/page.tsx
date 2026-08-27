"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Building2, Lock, Smartphone, ArrowRight, ArrowLeft } from "lucide-react";

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
    <main className="min-h-screen bg-[#f8f9fe] text-slate-900 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-200/60 w-fit android-ripple"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Sign In
        </h2>
        <p className="text-center text-xs text-slate-500 mt-1">
          Access your real estate operations console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] border border-slate-200/80 rounded-3xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f8f9fe] border border-slate-300/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white text-base sm:text-sm transition-all"
                  placeholder="e.g. 9876543210 or admin@thecurve.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f8f9fe] border border-slate-300/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white text-base sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-50 text-sm cursor-pointer android-ripple"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
