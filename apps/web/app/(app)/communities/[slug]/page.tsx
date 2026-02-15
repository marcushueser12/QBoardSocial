import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CommunityBoardClient } from "./community-board-client";
import { JoinButton } from "./join-button";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (!community) notFound();

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const { data: question } = await supabase
    .from("questions")
    .select("id, text, effective_date")
    .eq("community_id", community.id)
    .eq("effective_date", today)
    .single();

  const { data: myAnswer } = question
    ? await supabase
        .from("answers")
        .select("id, text")
        .eq("question_id", question.id)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single()
    : { data: null };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{community.name}</h1>
        {community.description && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {community.description}
          </p>
        )}
      </div>

      {!membership ? (
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Join this community to see and answer the daily question.
          </p>
          <JoinButton
            communityId={community.id}
            slug={community.slug}
            visibility={community.visibility}
          />
        </div>
      ) : (
        <CommunityBoardClient
          community={community}
          question={question}
          myAnswer={myAnswer}
          userId={user.id}
        />
      )}
    </div>
  );
}
