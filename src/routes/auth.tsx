import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Kok Boru Edu" },
      { name: "description", content: "Sign in or create an account to manage your private Kok Boru topics and questions." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/topics" });
  }, [loading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/topics` },
        });
        if (error) throw error;
        setInfo("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/topics" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.96_0.03_80)] to-[oklch(0.92_0.05_140)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 space-y-6">
        <div className="text-center">
          <Link to="/" className="text-2xl font-extrabold">Kok Boru Edu</Link>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input p-3 bg-background"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input p-3 bg-background"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-foreground">{info}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm">
          {mode === "signin" ? (
            <button onClick={() => setMode("signup")} className="underline">
              Need an account? Sign up
            </button>
          ) : (
            <button onClick={() => setMode("signin")} className="underline">
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
