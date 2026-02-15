"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReportButton({
  targetType,
  targetId,
  onReported,
}: {
  targetType: "answer" | "user" | "community";
  targetId: string;
  onReported?: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleReport() {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setShowModal(false);
    setReason("");
    onReported?.();
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-gray-500 hover:text-red-500"
      >
        Report
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold">Report</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Why are you reporting this?
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              placeholder="Optional details..."
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
