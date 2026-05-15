import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchTopics,
  createTopic,
  renameTopic,
  deleteTopic,
  type Topic,
} from "@/lib/questions-store";
import AuthGate from "@/components/AuthGate";
import { signOut } from "@/hooks/use-auth";

export const Route = createFileRoute("/topics")({
  component: TopicsPageGated,
  head: () => ({
    meta: [
      { title: "Topics — Kok Boru Battle" },
      { name: "description", content: "Create and manage quiz topics for the Kok Boru classroom game." },
    ],
  }),
});

function TopicsPageGated() {
  return (
    <AuthGate>
      <TopicsPage />
    </AuthGate>
  );
}

function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setTopics(await fetchTopics());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load topics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createTopic(name.trim());
      setName("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create topic");
    }
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) return;
    await renameTopic(id, editingName.trim());
    setEditingId(null);
    setEditingName("");
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this topic and all its questions?")) return;
    await deleteTopic(id);
    refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[oklch(0.97_0.02_80)] to-[oklch(0.93_0.04_140)] p-4 md:p-6">
      <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <Link to="/" className="text-xl font-extrabold">Kok Boru Battle</Link>
        <button
          onClick={() => signOut()}
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-card rounded-2xl p-6 shadow border border-border">
          <h2 className="text-2xl font-bold mb-4">Create a topic</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. History of Kyrgyzstan"
              className="flex-1 rounded-lg border border-input p-3 bg-background"
              required
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold"
            >
              Create
            </button>
          </form>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </section>

        <section className="bg-card rounded-2xl p-6 shadow border border-border">
          <h2 className="text-2xl font-bold mb-4">Topics ({topics.length})</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : topics.length === 0 ? (
            <p className="text-muted-foreground">No topics yet. Create your first one above.</p>
          ) : (
            <ul className="space-y-3">
              {topics.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-border p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  {editingId === t.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-lg border border-input p-2 bg-background"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(t.id)}
                        className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        className="px-3 py-1 rounded bg-secondary text-secondary-foreground font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-lg">{t.name}</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            navigate({ to: "/game", search: { topic: t.id } })
                          }
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold"
                        >
                          Start Game
                        </button>
                        <button
                          onClick={() =>
                            navigate({ to: "/questions", search: { topic: t.id } })
                          }
                          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-bold"
                        >
                          Questions
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(t.id);
                            setEditingName(t.name);
                          }}
                          className="px-3 py-2 rounded-lg bg-muted text-foreground font-medium"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
