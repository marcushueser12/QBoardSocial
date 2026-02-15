"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinCommunity(communityId: string, slug?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("memberships").insert({
    community_id: communityId,
    user_id: user.id,
    role: "member",
  });

  if (error) return { error: error.message };
  revalidatePath("/communities");
  if (slug) revalidatePath(`/communities/${slug}`);
  return { success: true };
}
