import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CommunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: communities } = await supabase
    .from("communities")
    .select("id, name, slug, description, visibility")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Link
          href="/communities/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Create Community
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {communities?.map((c) => (
          <Link
            key={c.id}
            href={`/communities/${c.slug}`}
            className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          >
            <h2 className="font-semibold">{c.name}</h2>
            {c.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {c.description}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">{c.visibility}</p>
          </Link>
        ))}
        {(!communities || communities.length === 0) && (
          <p className="text-gray-500">No communities yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
