import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">QBoard Social</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Answer the daily question. See others after you answer.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/auth/sign-in"
            className="rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
