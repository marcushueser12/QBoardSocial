"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState<"username" | "question">("username");
  const [username, setUsername] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<{ id: string; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadQuestion() {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("questions")
        .select("id, text")
        .eq("scope", "global")
        .eq("effective_date", today)
        .single();
      setQuestion(data);
    }
    loadQuestion();
  }, [supabase]);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim().toLowerCase() })
      .eq("id", user.id);

    if (updateError) {
      if (updateError.code === "23505") {
        setError("Username already taken");
      } else {
        setError(updateError.message);
      }
      setLoading(false);
      return;
    }

    setStep("question");
    setLoading(false);
  }

  async function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("answers").insert({
      question_id: question.id,
      user_id: user.id,
      text: answer.trim(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You already answered this question");
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id);

    router.refresh();
    router.push("/board");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Welcome to QBoard</h1>

        {step === "username" && (
          <form onSubmit={handleUsernameSubmit} className="mt-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Choose a username to get started.
            </p>
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                placeholder="your_username"
              />
              <p className="mt-1 text-xs text-gray-500">
                Letters, numbers, and underscores only
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </form>
        )}

        {step === "question" && (
          <form onSubmit={handleAnswerSubmit} className="mt-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Answer today&apos;s question to see what others shared.
            </p>
            {question ? (
              <>
                <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                  <p className="font-medium">{question.text}</p>
                </div>
                <div>
                  <label htmlFor="answer" className="block text-sm font-medium">
                    Your answer
                  </label>
                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-500">
                No question for today yet. Check back later!
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !question}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading ? "Submitting..." : "Submit & See Others"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
