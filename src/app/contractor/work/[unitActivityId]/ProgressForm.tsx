"use client";

import { useState } from "react";
import { Camera, Image as ImageIcon, X, Upload, CheckCircle2, ArrowUpRight } from "lucide-react";
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Record Work Progress</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit daily site completion percentages and visual verification photos
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Current Progress</span>
          <p className="text-xl font-bold text-amber-400 font-mono">{currentProgress}%</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Progress report submitted successfully! Activity status and history updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Progress % Input & Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              New Progress Percentage *
            </label>
            <span className="text-2xl font-bold text-white font-mono">{newProgress}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={newProgress}
            onChange={(e) => setNewProgress(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>0% (Pending)</span>
            <span>50%</span>
            <span>100% (Completed)</span>
          </div>
        </div>

        {/* Work Completed Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Work Completed Note *
          </label>
          <textarea
            required
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what specific work was finished (e.g. Completed brick masonry for east-facing wall, cured for 48 hrs)..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
          />
        </div>

        {/* Optional Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Remarks / Site Observations (Optional)
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Material delivery pending for next milestone"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
          />
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Site Verification Photos (Camera / Gallery)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer min-h-[70px]">
              <Camera className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">Take Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer min-h-[70px]">
              <ImageIcon className="w-6 h-6 text-cyan-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">Choose Gallery</span>
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
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-white/15 group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
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
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 min-h-[48px] cursor-pointer"
        >
          {loading ? (
            <span>{uploadProgressText || "Submitting..."}</span>
          ) : (
            <>
              <span>Submit Progress Update</span>
              <ArrowUpRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
