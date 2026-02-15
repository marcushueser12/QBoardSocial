import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DataExportButton } from "./data-export-button";
import { AccountDeletionButton } from "./account-deletion-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, is_anonymous")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {profile?.username}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Data Export</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Download a copy of your data (GDPR).
        </p>
        <DataExportButton />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Permanently delete your account and all associated data.
        </p>
        <AccountDeletionButton />
      </section>
    </div>
  );
}
