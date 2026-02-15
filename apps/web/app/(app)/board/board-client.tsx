"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LikeButton } from "@/components/like-button";
import { ReportButton } from "@/components/report-button";

type Question = { id: string; text: string; effective_date: string };
type Answer = { id: string; text: string };
type Profile = { id: string; username: string; avatar_url: string | null; is_anonymous: boolean };

export function BoardClient({
  question,
  myAnswer,
  userId,
}: {
  question: Question | null;
  myAnswer: Answer | null;
  userId: string;
}) {
  const [answerText, setAnswerText] = useState("");
  const [answers, setAnswers] = useState<
    {
      id: string;
      text: string;
      created_at: string;
      user_id: string;
      profile: Profile | null;
      likeCount?: number;
      liked?: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedAnswers, setHasFetchedAnswers] = useState(false);
  const supabase = createClient();

  async function fetchAnswers() {
    if (!question || !myAnswer) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("answers")
      .select(`
        id,
        text,
        created_at,
        user_id,
        profile:profiles!user_id(id, username, avatar_url, is_anonymous)
      `)
      .eq("question_id", question.id)
      .neq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const answersWithLikes = await Promise.all(
        (data || []).map(async (a: any) => {
          const { count } = await supabase
            .from("reactions")
            .select("*", { count: "exact", head: true })
            .eq("answer_id", a.id);
          const { data: myReaction } = await supabase
            .from("reactions")
            .select("id")
            .eq("answer_id", a.id)
            .eq("user_id", userId)
            .single();
          return { ...a, likeCount: count ?? 0, liked: !!myReaction };
        })
      );
      setAnswers(answersWithLikes);
    }
    setHasFetchedAnswers(true);
    setLoading(false);
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !answerText.trim()) return;
    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("answers")
      .insert({
        question_id: question.id,
        user_id: userId,
        text: answerText.trim(),
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setAnswerText("");
    setLoading(false);
    window.location.reload();
  }

  if (!question) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          No question for today yet. Check back later!
        </p>
      </div>
    );
  }

  if (!myAnswer) {
    return (
      <div>
        <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <p className="text-lg font-medium">{question.text}</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {question.effective_date}
          </p>
        </div>
        <form onSubmit={handleSubmitAnswer} className="mt-6">
          <label htmlFor="answer" className="block text-sm font-medium">
            Your answer (required to see others)
          </label>
          <textarea
            id="answer"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            required
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            placeholder="Share your thoughts..."
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
        <p className="text-lg font-medium">{question.text}</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {question.effective_date}
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <p className="font-medium">Your answer</p>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{myAnswer.text}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Others&apos; answers</h2>
        {!hasFetchedAnswers ? (
          <button
            onClick={fetchAnswers}
            disabled={loading}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? "Loading..." : "Load answers"}
          </button>
        ) : (
          <div className="mt-4 space-y-4">
            {answers.length === 0 && !loading && (
              <p className="text-gray-500">No other answers yet.</p>
            )}
            {answers.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {(a.profile as Profile)?.is_anonymous
                      ? "Anonymous"
                      : (a.profile as Profile)?.username || "Unknown"}
                  </p>
                  <div className="flex items-center gap-2">
                    <LikeButton
                    answerId={a.id}
                    userId={userId}
                    initialLiked={a.liked}
                    initialCount={a.likeCount}
                  />
                    <ReportButton targetType="answer" targetId={a.id} />
                  </div>
                </div>
                <p className="mt-1">{a.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
