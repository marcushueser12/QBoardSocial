import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Answer the daily question.
              <br />
              <span className="text-gray-500 dark:text-gray-400">
                See others after you answer.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              One question every day. Share your answer, then discover what
              everyone else said. Simple, thoughtful, and real.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="w-full rounded-lg bg-gray-900 px-8 py-4 text-center text-lg font-medium text-white hover:bg-gray-800 sm:w-auto dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Get Started
              </Link>
              <Link
                href="/auth/sign-in"
                className="w-full rounded-lg border border-gray-300 px-8 py-4 text-center text-lg font-medium hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-lg font-semibold">Daily Question</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              One new question every day. Answer honestly, then unlock the feed
              to see how others responded.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-lg font-semibold">Personal Board</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your timeline of every question and your answers. Track your
              journey and revisit past reflections.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-lg font-semibold">World Board</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              See what everyone else answered. Like, react, and connect with
              others who shared their thoughts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to join the conversation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-400">
            Create an account and answer your first question in under a minute.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-8 inline-block rounded-lg bg-gray-900 px-8 py-4 font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Sign Up Free
          </Link>
        </div>
      </section>
    </main>
  );
}
