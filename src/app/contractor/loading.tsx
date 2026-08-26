export default function ContractorLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-44" />
              <div className="h-3 bg-slate-100 rounded w-64" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-8 bg-slate-300 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
