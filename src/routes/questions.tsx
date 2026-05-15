import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchTopics,
  fetchQuestionsByTopic,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
  type Topic,
} from "@/lib/questions-store";
import AuthGate from "@/components/AuthGate";

type Search = { topic?: string };

export const Route = createFileRoute("/questions")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    topic: typeof search.topic === "string" ? search.topic : undefined,
  }),
  component: QuestionsPageGated,
  head: () => ({
    meta: [
      { title: "Manage Questions — Kok Boru Battle" },
      { name: "description", content: "Add, edit, and delete questions for a topic." },
    ],
  }),
});

function QuestionsPageGated() {
  return (
    <AuthGate>
      <QuestionsPage />
    </AuthGate>
  );
}

type Draft = {
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

function emptyDraft(): Draft {
  return { text: "", options: ["", "", "", ""], correctIndex: 0 };
}

function QuestionsPage() {
  const { topic: topicId } = Route.useSearch();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentTopic = topics.find((t) => t.id === topicId);

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
  }, []);

  async function refresh() {
    if (!topicId) return;
    setLoading(true);
    try {
      setQuestions(await fetchQuestionsByTopic(topicId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topicId) return;
    if (!draft.text.trim() || draft.options.some((o) => !o.trim())) return;
    if (editingId) {
      await updateQuestion({
        id: editingId,
        topic_id: topicId,
        text: draft.text,
        options: draft.options,
        correctIndex: draft.correctIndex,
      });
    } else {
      await createQuestion({
        topic_id: topicId,
        text: draft.text,
        options: draft.options,
        correctIndex: draft.correctIndex,
      });
    }
    setDraft(emptyDraft());
    setEditingId(null);
    refresh();
  }

  function startEdit(q: Question) {
    setDraft({ text: q.text, options: [...q.options] as Draft["options"], correctIndex: q.correctIndex });
    setEditingId(q.id);
  }

  function cancelEdit() {
    setDraft(emptyDraft());
    setEditingId(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this question?")) return;
    await deleteQuestion(id);
    if (editingId === id) cancelEdit();
    refresh();
  }

  if (!topicId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-lg">Pick a topic first.</p>
          <Link to="/topics" className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Go to Topics
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[oklch(0.97_0.02_80)] to-[oklch(0.93_0.04_140)] p-4 md:p-6">
      <header className="flex items-center justify-between mb-6 max-w-5xl mx-auto flex-wrap gap-2">
        <div>
          <Link to="/" className="text-xl font-extrabold">Kok Boru Battle</Link>
          <div className="text-sm text-muted-foreground">
            Topic: <span className="font-bold">{currentTopic?.name ?? "…"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/topics" className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-bold">
            All Topics
          </Link>
          <Link
            to="/game"
            search={{ topic: topicId }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold"
          >
            Start Game
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <section className="bg-card rounded-2xl p-6 shadow border border-border">
          <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit question" : "Add a question"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <textarea
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                rows={2}
                required
                className="w-full rounded-lg border border-input p-3 bg-background"
              />
            </div>
            {draft.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={draft.correctIndex === i}
                  onChange={() => setDraft({ ...draft, correctIndex: i as 0 | 1 | 2 | 3 })}
                />
                <span className="font-bold w-6">{String.fromCharCode(65 + i)}</span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const opts = [...draft.options] as Draft["options"];
                    opts[i] = e.target.value;
                    setDraft({ ...draft, options: opts });
                  }}
                  required
                  className="flex-1 rounded-lg border border-input p-2 bg-background"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Select the radio for the correct answer.</p>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">
                {editingId ? "Save changes" : "Add question"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-card rounded-2xl p-6 shadow border border-border">
          <h2 className="text-2xl font-bold mb-4">Questions ({questions.length})</h2>
          {questions.length < 2 && !loading && (
            <div className="mb-4 rounded-lg bg-yellow-100 border border-yellow-400 px-3 py-2 text-yellow-900 text-sm">
              Add at least 2 questions so each team can get a different one.
            </div>
          )}
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-auto">
              {questions.map((q) => (
                <li key={q.id} className="rounded-lg border border-border p-3">
                  <div className="font-medium">{q.text}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Correct: {String.fromCharCode(65 + q.correctIndex)} — {q.options[q.correctIndex]}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startEdit(q)} className="text-sm px-3 py-1 rounded bg-secondary text-secondary-foreground font-medium">Edit</button>
                    <button onClick={() => remove(q.id)} className="text-sm px-3 py-1 rounded bg-destructive text-destructive-foreground font-medium">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
