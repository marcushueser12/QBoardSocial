"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AccountDeletionButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("answers")
      .update({ deleted_at: new Date().toISOString(), text: "[Deleted]" })
      .eq("user_id", user.id);

    await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), username: "deleted_user" })
      .eq("id", user.id);

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="mt-2">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Delete Account
        </button>
      ) : (
        <div className="rounded-lg border border-red-200 p-4 dark:border-red-900">
          <p className="text-sm text-red-600 dark:text-red-400">
            This will soft-delete your account. Type DELETE to confirm.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
