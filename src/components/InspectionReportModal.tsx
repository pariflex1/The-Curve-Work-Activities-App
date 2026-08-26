"use client";

import { useState } from "react";
import { Camera, Image as ImageIcon, X, ArrowUpRight, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { submitProgressReport } from "@/app/contractor/work/[unitActivityId]/progress-actions";

interface InspectionReportModalProps {
  unitActivityId: string;
  activityName: string;
  category?: string | null;
  currentProgress: number;
  currentStatus: string;
  contractorName?: string | null;
  triggerLabel?: string;
}

export default function InspectionReportModal({
  unitActivityId,
  activityName,
  category,
  currentProgress,
  currentStatus,
  contractorName,
  triggerLabel = "Inspect & Log Progress",
}: InspectionReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newProgress, setNewProgress] = useState(currentProgress);
  const [note, setNote] = useState("");
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const updatedFiles = [...files, ...selectedFiles];
    setFiles(updatedFiles);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  }

  function removePhoto(index: number) {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (newProgress < 0 || newProgress > 100) {
      setError("Progress percentage must be between 0 and 100.");
      setLoading(false);
      return;
    }

    try {
      const uploadedPaths: string[] = [];

      // Upload photos to Supabase Storage if any
      if (files.length > 0) {
        setUploadProgressText("Uploading verification photos...");
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${unitActivityId}/${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("progress-photos")
            .upload(fileName, file);

          if (!uploadError) {
            uploadedPaths.push(fileName);
          }
        }
      }

      setUploadProgressText("Submitting inspection report...");
      const res = await submitProgressReport(
        unitActivityId,
        newProgress,
        note,
        uploadedPaths,
        remarks
      );

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setNote("");
          setRemarks("");
          setFiles([]);
          setPreviews([]);
        }, 800);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit inspection report.");
    } finally {
      setLoading(false);
      setUploadProgressText("");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNewProgress(currentProgress);
          setIsOpen(true);
        }}
        className="px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[32px]"
      >
        <ClipboardCheck className="w-3.5 h-3.5" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="w-11 h-11 bg-black text-white rounded-2xl flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Site Inspection Report
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect <strong className="text-black">{activityName}</strong> {contractorName ? `(Contractor: ${contractorName})` : ""}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inspection report submitted &amp; progress verified!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Progress Slider & Quick Buttons */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Verified Work Completion
                  </label>
                  <span className="text-2xl font-bold font-mono text-black">{newProgress}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                />

                <div className="flex gap-1.5 pt-1">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewProgress(val)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        newProgress === val
                          ? "bg-black text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Pending (0%)</span>
                  <span>In Progress (1-99%)</span>
                  <span>Completed (100%)</span>
                </div>
              </div>

              {/* Inspection Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Engineer Inspection Findings &amp; Work Note *
                </label>
                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe inspection result (e.g. Inspected brick masonry work; mortar ratio checked and wall alignment verified within tolerance)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              {/* Optional Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Site Observations / Action Items (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Curing required for next 48 hours"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              {/* Site Photos Upload */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Verification Site Photos (Camera / Gallery)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer min-h-[65px]">
                    <Camera className="w-5 h-5 text-black mb-1" />
                    <span className="text-xs text-slate-800 font-semibold">Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer min-h-[65px]">
                    <ImageIcon className="w-5 h-5 text-black mb-1" />
                    <span className="text-xs text-slate-800 font-semibold">Choose Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 group shadow-sm">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/75 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !note.trim()}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[42px] flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <span>{uploadProgressText || "Submitting..."}</span>
                  ) : (
                    <>
                      <span>Submit Verified Report</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
