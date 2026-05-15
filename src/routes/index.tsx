import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Kok Boru Edu — Classroom Quiz Game" },
      {
        name: "description",
        content:
          "A 2D Kok Boru classroom quiz game. Two student teams answer their own questions to push the carcass into their own Tai Kazan.",
      },
    ],
  }),
});

function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.96_0.03_80)] to-[oklch(0.92_0.05_140)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Kok Boru Edu
        </h1>
        <p className="text-lg text-muted-foreground">
          A two-team classroom quiz game. Teachers create topics, students answer their own
          team's questions and push the carcass into their own Tai Kazan.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/topics"
            className="px-8 py-4 rounded-xl text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg"
          >
            Start Game
          </Link>
          <Link
            to="/topics"
            className="px-8 py-4 rounded-xl text-lg font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition shadow-lg"
          >
            Manage Topics & Questions
          </Link>
        </div>
      </div>
    </main>
  );
}
