"use client";

import { useState } from "react";
import { joinCommunity } from "./actions";

export function JoinButton({
  communityId,
  slug,
  visibility,
}: {
  communityId: string;
  slug?: string;
  visibility: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    const result = await joinCommunity(communityId, slug);
    if (result.error) setError(result.error);
    setLoading(false);
  }

  if (visibility === "open") {
    return (
      <div>
        <button
          onClick={handleJoin}
          disabled={loading}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {loading ? "Joining..." : "Join Community"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <p className="mt-4 text-sm text-gray-500">
      This community is {visibility}. Request an invite from the owner.
    </p>
  );
}
