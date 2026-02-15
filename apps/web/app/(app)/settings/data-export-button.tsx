"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DataExportButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleExport() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: answers } = await supabase
      .from("answers")
      .select(`
        id,
        text,
        created_at,
        question:questions(text, effective_date)
      `)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: { id: user.id, email: user.email },
      profile,
      answers,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qboard-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="mt-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {loading ? "Exporting..." : "Export My Data"}
    </button>
  );
}
