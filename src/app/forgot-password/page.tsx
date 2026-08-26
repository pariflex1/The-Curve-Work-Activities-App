"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/app/auth/actions";
import { Building2, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await forgotPassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Enter your email to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                If an account exists for that email, we have sent password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 text-sm mt-2"
              >
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
