import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportsList } from "./reports-list";
import { CreateQuestionForm } from "./create-question-form";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/board");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Create Global Question</h2>
        <CreateQuestionForm />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Reports</h2>
        <ReportsList />
      </section>
    </div>
  );
}
