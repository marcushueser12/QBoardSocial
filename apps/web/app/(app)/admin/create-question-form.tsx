"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function CreateQuestionForm() {
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("questions").insert({
      scope: "global",
      community_id: null,
      effective_date: date,
      text: text.trim(),
      created_by: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setText("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md space-y-4">
      <div>
        <label htmlFor="text" className="block text-sm font-medium">
          Question text
        </label>
        <input
          id="text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Question created!
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {loading ? "Creating..." : "Create Question"}
      </button>
    </form>
  );
}
