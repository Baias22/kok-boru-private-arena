import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth, signOut } from "@/hooks/use-auth";
import { LanguageSwitcher, useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Kok Boru Battle — Classroom Quiz Game" },
      {
        name: "description",
        content:
          "A 2D Kok Boru classroom quiz game. Two student teams answer their own questions to push the carcass into their own Tai Kazan.",
      },
    ],
  }),
});

function Home() {
  const { session, loading } = useAuth();
  const { t } = useT();
  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.96_0.03_80)] to-[oklch(0.92_0.05_140)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center"><LanguageSwitcher /></div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          {t("app.title")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("app.tagline")}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {loading ? (
            <span className="text-muted-foreground">…</span>
          ) : session ? (
            <>
              <Link
                to="/topics"
                className="px-8 py-4 rounded-xl text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                to="/topics"
                className="px-8 py-4 rounded-xl text-lg font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition shadow-lg"
              >
                {t("nav.manage")}
              </Link>
              <Link
                to="/topics"
                className="px-8 py-4 rounded-xl text-lg font-bold bg-accent text-accent-foreground hover:opacity-90 transition shadow-lg"
              >
                {t("nav.start")}
              </Link>
              <button
                onClick={() => signOut()}
                className="px-6 py-4 rounded-xl text-lg font-bold bg-muted text-foreground hover:opacity-90 transition shadow-lg"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-8 py-4 rounded-xl text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
