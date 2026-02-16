"use client";

import Link from "next/link";

type QuestionWithResponse = {
  id: string;
  text: string;
  effective_date: string;
  myAnswer: { id: string; text: string; created_at: string } | null;
};

export function PersonalBoardClient({
  questionsWithResponses,
}: {
  questionsWithResponses: QuestionWithResponse[];
}) {
  return (
    <div className="mt-4 space-y-4">
      {questionsWithResponses.length === 0 && (
        <p className="rounded-lg border border-gray-200 p-6 text-center text-gray-500 dark:border-gray-800">
          No questions yet. Check back for the daily question!
        </p>
      )}
      {questionsWithResponses.map((q) => (
        <div
          key={q.id}
          className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {q.effective_date}
          </p>
          <p className="mt-1 font-medium">{q.text}</p>
          {q.myAnswer ? (
            <div className="mt-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your answer
              </p>
              <p className="mt-1">{q.myAnswer.text}</p>
            </div>
          ) : (
            <Link
              href={`/board?date=${q.effective_date}`}
              className="mt-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Answer this question →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
