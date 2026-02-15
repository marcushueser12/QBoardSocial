"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReportsList() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setReports(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  if (loading) return <p className="mt-4 text-gray-500">Loading...</p>;

  return (
    <div className="mt-4 space-y-4">
      {reports.length === 0 && (
        <p className="text-gray-500">No reports yet.</p>
      )}
      {reports.map((r) => (
        <div
          key={r.id}
          className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-medium">
                {r.target_type} - {r.target_id}
              </p>
              {r.reason && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {r.reason}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-1 text-xs ${
                  r.status === "pending"
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : r.status === "resolved"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {r.status}
              </span>
              {r.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(r.id, "resolved")}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "dismissed")}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
