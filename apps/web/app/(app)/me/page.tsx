import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio, days_answered, communities_joined")
    .eq("id", user.id)
    .single();

  const { data: answers } = await supabase
    .from("answers")
    .select(`
      id,
      text,
      created_at,
      question:questions(id, text, effective_date)
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const { count: daysAnswered } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const { count: communitiesJoined } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Board</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        {profile?.username}
      </p>

      <div className="mt-6 flex gap-6">
        <div className="rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-800">
          <span className="text-2xl font-bold">{daysAnswered ?? 0}</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Days answered
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-800">
          <span className="text-2xl font-bold">{communitiesJoined ?? 0}</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Communities
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your answers</h2>
        <div className="mt-4 space-y-4">
          {answers?.map((a: any) => (
            <div
              key={a.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {(a.question as any)?.effective_date}
              </p>
              <p className="mt-1 font-medium">{(a.question as any)?.text}</p>
              <p className="mt-2">{a.text}</p>
            </div>
          ))}
          {(!answers || answers.length === 0) && (
            <p className="text-gray-500">No answers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
