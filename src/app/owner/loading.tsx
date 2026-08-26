export default function OwnerLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-48" />
              <div className="h-3 bg-slate-100 rounded w-72" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-9 bg-slate-300 rounded w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
