"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LikeButton({
  answerId,
  userId,
  initialLiked,
  initialCount,
}: {
  answerId: string;
  userId: string;
  initialLiked?: boolean;
  initialCount?: number;
}) {
  const [liked, setLiked] = useState(initialLiked ?? false);
  const [count, setCount] = useState(initialCount ?? 0);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function toggleLike() {
    setLoading(true);
    if (liked) {
      await supabase
        .from("reactions")
        .delete()
        .eq("answer_id", answerId)
        .eq("user_id", userId);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("reactions").insert({
        answer_id: answerId,
        user_id: userId,
        type: "like",
      });
      setLiked(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`text-sm ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
    >
      {liked ? "♥" : "♡"} {count}
    </button>
  );
}
