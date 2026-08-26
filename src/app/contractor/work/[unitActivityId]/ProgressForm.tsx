"use client";

import { useState } from "react";
import { Camera, Image as ImageIcon, X, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { submitProgressReport } from "./progress-actions";

interface ProgressFormProps {
  unitActivityId: string;
  currentProgress: number;
}

export default function ProgressForm({
  unitActivityId,
  currentProgress,
}: ProgressFormProps) {
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
        setUploadProgressText("Uploading photos...");
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

      setUploadProgressText("Submitting report...");
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
        setNote("");
        setRemarks("");
        setFiles([]);
        setPreviews([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit progress update.");
    } finally {
      setLoading(false);
      setUploadProgressText("");
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Record Work Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit daily site completion percentages and visual verification photos
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Current Progress</span>
          <p className="text-lg font-bold text-blue-600 font-mono">{currentProgress}%</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Progress report submitted successfully! Activity status and history updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Progress % Input & Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              New Progress Percentage *
            </label>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{newProgress}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={newProgress}
            onChange={(e) => setNewProgress(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>0% (Pending)</span>
            <span>50%</span>
            <span>100% (Completed)</span>
          </div>
        </div>

        {/* Work Completed Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Work Completed Note *
          </label>
          <textarea
            required
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what specific work was finished (e.g. Completed brick masonry for east-facing wall, cured for 48 hrs)..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
          />
        </div>

        {/* Optional Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Remarks / Site Observations (Optional)
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Material delivery pending for next milestone"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
          />
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Site Verification Photos (Camera / Gallery)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer min-h-[70px]">
              <Camera className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-xs text-slate-700 font-semibold">Take Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer min-h-[70px]">
              <ImageIcon className="w-6 h-6 text-indigo-600 mb-1" />
              <span className="text-xs text-slate-700 font-semibold">Choose Gallery</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 group shadow-sm">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !note.trim()}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 text-sm shadow-sm transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {loading ? (
            <span>{uploadProgressText || "Submitting..."}</span>
          ) : (
            <>
              <span>Submit Progress Update</span>
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
