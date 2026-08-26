import Link from "next/link";
import { Building2, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export default function SignupPage() {
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
          Admin-Issued Accounts
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          The Curve Real Estate Construction &amp; Payments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-sm border border-slate-200 rounded-3xl text-center space-y-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              Registration Managed by Admin
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Public user registration is disabled. Site Engineers, Contractors, and Project Owners are provisioned and given credentials directly by the Project Administrator.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[46px] text-sm"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
