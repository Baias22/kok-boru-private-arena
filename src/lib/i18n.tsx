import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ru" | "ky";

type Dict = Record<string, string>;

const DICTS: Record<Lang, Dict> = {
  en: {
    "app.title": "Kok Boru Battle",
    "app.tagline": "A two-team classroom quiz game. Teachers create topics, students answer their own team's questions and push the carcass into their own Tai Kazan.",
    "nav.signIn": "Sign in / Sign up",
    "nav.dashboard": "Dashboard",
    "nav.manage": "Manage Topics & Questions",
    "nav.start": "Start Game",
    "nav.logout": "Logout",
    "nav.backToTopics": "Back to Topics",
    "game.start": "Start Game",
    "game.pause": "Pause",
    "game.resume": "Resume",
    "game.restart": "Restart",
    "game.topic": "Topic",
    "game.scoreHint": "← push the carcass into your own Tai Kazan to win →",
    "game.teamNameHint": "✏️ Tap to rename your team",
    "game.noTopic": "No topic selected.",
    "game.goToTopics": "Go to Topics",
    "game.notEnough": "Please add more questions to this topic (at least 2).",
    "game.manageQuestions": "Manage questions",
    "game.startHint": "Click Start Game to deal questions to both teams.",
    "game.paused": "Paused",
    "game.winner": "{name} wins the round!",
    "game.score": "Score",
    "game.nextRound": "Next Round",
    "lang.label": "Language",
  },
  ru: {
    "app.title": "Kok Boru Battle",
    "app.tagline": "Командная викторина для класса. Учитель создаёт темы, две команды отвечают на свои вопросы и толкают тушу в свой Тай Казан.",
    "nav.signIn": "Войти / Регистрация",
    "nav.dashboard": "Кабинет",
    "nav.manage": "Темы и вопросы",
    "nav.start": "Начать игру",
    "nav.logout": "Выйти",
    "nav.backToTopics": "К темам",
    "game.start": "Начать игру",
    "game.pause": "Пауза",
    "game.resume": "Продолжить",
    "game.restart": "Заново",
    "game.topic": "Тема",
    "game.scoreHint": "← закиньте тушу в свой Тай Казан, чтобы победить →",
    "game.teamNameHint": "✏️ Нажмите, чтобы изменить название команды",
    "game.noTopic": "Тема не выбрана.",
    "game.goToTopics": "Перейти к темам",
    "game.notEnough": "Добавьте больше вопросов в эту тему (минимум 2).",
    "game.manageQuestions": "Управлять вопросами",
    "game.startHint": "Нажмите «Начать игру», чтобы раздать вопросы командам.",
    "game.paused": "Пауза",
    "game.winner": "{name} побеждает в раунде!",
    "game.score": "Счёт",
    "game.nextRound": "Следующий раунд",
    "lang.label": "Язык",
  },
  ky: {
    "app.title": "Kok Boru Battle",
    "app.tagline": "Эки команда үчүн класстык викторина. Мугалим темаларды түзөт, окуучулар суроолорго жооп берип, улакты өз Тай Казанына салат.",
    "nav.signIn": "Кирүү / Катталуу",
    "nav.dashboard": "Кабинет",
    "nav.manage": "Темалар жана суроолор",
    "nav.start": "Оюнду баштоо",
    "nav.logout": "Чыгуу",
    "nav.backToTopics": "Темаларга кайтуу",
    "game.start": "Оюнду баштоо",
    "game.pause": "Тыныгуу",
    "game.resume": "Улантуу",
    "game.restart": "Кайра баштоо",
    "game.topic": "Тема",
    "game.scoreHint": "← улакты өз Тай Казаныңарга салгыла →",
    "game.teamNameHint": "✏️ Команданын атын өзгөртүү үчүн басыңыз",
    "game.noTopic": "Тема тандалган жок.",
    "game.goToTopics": "Темаларга өтүү",
    "game.notEnough": "Бул темага жок дегенде 2 суроо кошуңуз.",
    "game.manageQuestions": "Суроолорду башкаруу",
    "game.startHint": "«Оюнду баштоо» баскычын басып, командаларга суроо таратыңыз.",
    "game.paused": "Тыныгуу",
    "game.winner": "{name} раундда жеңди!",
    "game.score": "Эсеп",
    "game.nextRound": "Кийинки раунд",
    "lang.label": "Тил",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string };

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = (typeof window !== "undefined" && window.localStorage.getItem("lang")) as Lang | null;
      if (saved === "en" || saved === "ru" || saved === "ky") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = DICTS[lang][key] ?? DICTS.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LanguageProvider");
  return ctx;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useT();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "ky", label: "KY" },
  ];
  return (
    <div className={`inline-flex overflow-hidden rounded-lg border border-border bg-card/80 text-xs font-bold backdrop-blur ${className}`}>
      {opts.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`px-2.5 py-1.5 transition ${
            lang === o.code ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
          }`}
          aria-pressed={lang === o.code}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}