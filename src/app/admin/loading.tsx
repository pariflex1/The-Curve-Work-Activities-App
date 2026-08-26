import { ShieldCheck } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded-lg w-48" />
              <div className="h-4 bg-slate-100 rounded-lg w-64" />
            </div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-32" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="h-4 bg-slate-200 rounded-md w-24" />
              <div className="h-10 bg-slate-300 rounded-xl w-16" />
              <div className="h-3 bg-slate-100 rounded-md w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
