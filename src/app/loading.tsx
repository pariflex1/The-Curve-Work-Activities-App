import { Building2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Top Progress Accent Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7903] via-[#ff9436] to-[#FFE5CC] animate-pulse z-50" />

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl max-w-sm w-full text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#FF7903] animate-ping opacity-20" />
          <div className="w-16 h-16 rounded-2xl bg-[#FF7903] text-white flex items-center justify-center shadow-lg relative z-10">
            <Building2 className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">THE CURVE</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Loading Workspace...
          </p>
        </div>

        <div className="flex justify-center items-center gap-1.5 pt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF7903] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff9436] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFB877] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
