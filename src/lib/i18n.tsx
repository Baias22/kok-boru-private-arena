import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ru" | "ky";

type Dict = Record<string, string>;

const DICTS: Record<Lang, Dict> = {
  en: {
    "app.title": "Kok Boru Battle",
    "app.tagline": "A two-team classroom quiz game. Teachers create topics, students answer their own team's questions and push the carcass into their own Tai Kazan.",
    "nav.signIn": "Sign in / Sign up",
    "nav.dashboard": "Open App",
    "nav.manage": "Manage Topics & Questions",
    "nav.start": "Start Game",
    "nav.logout": "Logout",
    "nav.signOut": "Sign out",
    "nav.backToTopics": "Back to Topics",
    "nav.allTopics": "All Topics",

    "topics.title": "Topics",
    "topics.create": "Create a topic",
    "topics.placeholder": "e.g. History of Kyrgyzstan",
    "topics.createBtn": "Create",
    "topics.loading": "Loading…",
    "topics.empty": "No topics yet. Create your first one above.",
    "topics.startGame": "Start Game",
    "topics.questions": "Questions",
    "topics.rename": "Rename",
    "topics.delete": "Delete",
    "topics.save": "Save",
    "topics.cancel": "Cancel",
    "topics.confirmDelete": "Delete this topic and all its questions?",

    "questions.pickFirst": "Pick a topic first.",
    "questions.goTopics": "Go to Topics",
    "questions.topicLabel": "Topic",
    "questions.add": "Add a question",
    "questions.edit": "Edit question",
    "questions.field": "Question",
    "questions.selectHint": "Select the radio for the correct answer.",
    "questions.addBtn": "Add question",
    "questions.saveBtn": "Save changes",
    "questions.cancel": "Cancel",
    "questions.list": "Questions",
    "questions.minWarn": "Add at least 2 questions so each team can get a different one.",
    "questions.correct": "Correct",
    "questions.editBtn": "Edit",
    "questions.deleteBtn": "Delete",
    "questions.confirmDelete": "Delete this question?",

    "auth.signinTitle": "Sign in to your account",
    "auth.signupTitle": "Create your account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signin": "Sign in",
    "auth.signup": "Create account",
    "auth.wait": "Please wait…",
    "auth.or": "or",
    "auth.google": "Continue with Google",
    "auth.toSignup": "Need an account? Sign up",
    "auth.toSignin": "Already have an account? Sign in",
    "auth.created": "Account created. Check your email to confirm, then sign in.",

    "game.start": "Start Game",
    "game.pause": "Pause",
    "game.resume": "Resume",
    "game.restart": "Restart",
    "game.topic": "Topic",
    "game.scoreHint": "← push the carcass into your own Tai Kazan to win →",
    "game.chaseHint": "🐎 Boys are chasing the girls! Answer correctly to move →",
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
    "game.mode": "Game mode",
    "game.mode.classic": "Classic Kok Boru",
    "game.mode.chase": "Chase: Boys vs Girls",
    "game.bg": "Background",
    "game.bg.steppe": "Steppe",
    "game.bg.mountains": "Mountains of Kyrgyzstan",
    "game.team.girls": "Girls",
    "game.team.boys": "Boys",
    "card.correct": "✓ Correct!",
    "card.wrong": "✗ Wrong answer",
    "card.empty": "Please add more questions to this topic",
    "lang.label": "Language",
  },
  ru: {
    "app.title": "Kok Boru Battle",
    "app.tagline": "Командная викторина для класса. Учитель создаёт темы, две команды отвечают на свои вопросы и толкают тушу в свой Тай Казан.",
    "nav.signIn": "Войти / Регистрация",
    "nav.dashboard": "Открыть приложение",
    "nav.manage": "Темы и вопросы",
    "nav.start": "Начать игру",
    "nav.logout": "Выйти",
    "nav.signOut": "Выйти",
    "nav.backToTopics": "К темам",
    "nav.allTopics": "Все темы",

    "topics.title": "Темы",
    "topics.create": "Создать тему",
    "topics.placeholder": "например, История Кыргызстана",
    "topics.createBtn": "Создать",
    "topics.loading": "Загрузка…",
    "topics.empty": "Тем пока нет. Создайте первую выше.",
    "topics.startGame": "Начать игру",
    "topics.questions": "Вопросы",
    "topics.rename": "Переименовать",
    "topics.delete": "Удалить",
    "topics.save": "Сохранить",
    "topics.cancel": "Отмена",
    "topics.confirmDelete": "Удалить тему и все её вопросы?",

    "questions.pickFirst": "Сначала выберите тему.",
    "questions.goTopics": "К темам",
    "questions.topicLabel": "Тема",
    "questions.add": "Добавить вопрос",
    "questions.edit": "Редактировать вопрос",
    "questions.field": "Вопрос",
    "questions.selectHint": "Отметьте правильный ответ.",
    "questions.addBtn": "Добавить вопрос",
    "questions.saveBtn": "Сохранить",
    "questions.cancel": "Отмена",
    "questions.list": "Вопросы",
    "questions.minWarn": "Добавьте хотя бы 2 вопроса, чтобы у команд были разные.",
    "questions.correct": "Правильно",
    "questions.editBtn": "Изменить",
    "questions.deleteBtn": "Удалить",
    "questions.confirmDelete": "Удалить этот вопрос?",

    "auth.signinTitle": "Войдите в свой аккаунт",
    "auth.signupTitle": "Создайте аккаунт",
    "auth.email": "Эл. почта",
    "auth.password": "Пароль",
    "auth.signin": "Войти",
    "auth.signup": "Создать аккаунт",
    "auth.wait": "Пожалуйста, подождите…",
    "auth.or": "или",
    "auth.google": "Войти через Google",
    "auth.toSignup": "Нет аккаунта? Зарегистрируйтесь",
    "auth.toSignin": "Уже есть аккаунт? Войдите",
    "auth.created": "Аккаунт создан. Подтвердите почту и войдите.",

    "game.start": "Начать игру",
    "game.pause": "Пауза",
    "game.resume": "Продолжить",
    "game.restart": "Заново",
    "game.topic": "Тема",
    "game.scoreHint": "← закиньте тушу в свой Тай Казан, чтобы победить →",
    "game.chaseHint": "🐎 Мальчики догоняют девочек! Отвечайте правильно, чтобы двигаться →",
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
    "game.mode": "Режим игры",
    "game.mode.classic": "Классика Кок Бору",
    "game.mode.chase": "Погоня: Мальчики vs Девочки",
    "game.bg": "Фон",
    "game.bg.steppe": "Степь",
    "game.bg.mountains": "Горы Кыргызстана",
    "game.team.girls": "Девочки",
    "game.team.boys": "Мальчики",
    "card.correct": "✓ Верно!",
    "card.wrong": "✗ Неверно",
    "card.empty": "Добавьте больше вопросов в эту тему",
    "lang.label": "Язык",
  },
  ky: {
    "app.title": "Kok Boru Battle",
    "app.tagline": "Эки команда үчүн класстык викторина. Мугалим темаларды түзөт, окуучулар суроолорго жооп берип, улакты өз Тай Казанына салат.",
    "nav.signIn": "Кирүү / Катталуу",
    "nav.dashboard": "Колдонмону ачуу",
    "nav.manage": "Темалар жана суроолор",
    "nav.start": "Оюнду баштоо",
    "nav.logout": "Чыгуу",
    "nav.signOut": "Чыгуу",
    "nav.backToTopics": "Темаларга кайтуу",
    "nav.allTopics": "Бардык темалар",

    "topics.title": "Темалар",
    "topics.create": "Тема түзүү",
    "topics.placeholder": "мисалы, Кыргызстандын тарыхы",
    "topics.createBtn": "Түзүү",
    "topics.loading": "Жүктөлүүдө…",
    "topics.empty": "Темалар жок. Жогорудан биринчисин түзүңүз.",
    "topics.startGame": "Оюнду баштоо",
    "topics.questions": "Суроолор",
    "topics.rename": "Атын өзгөртүү",
    "topics.delete": "Өчүрүү",
    "topics.save": "Сактоо",
    "topics.cancel": "Жокко чыгаруу",
    "topics.confirmDelete": "Бул теманы жана бардык суроолорун өчүрөсүзбү?",

    "questions.pickFirst": "Алгач тема тандаңыз.",
    "questions.goTopics": "Темаларга",
    "questions.topicLabel": "Тема",
    "questions.add": "Суроо кошуу",
    "questions.edit": "Сурону өзгөртүү",
    "questions.field": "Суроо",
    "questions.selectHint": "Туура жоопту белгилеңиз.",
    "questions.addBtn": "Суроо кошуу",
    "questions.saveBtn": "Сактоо",
    "questions.cancel": "Жокко чыгаруу",
    "questions.list": "Суроолор",
    "questions.minWarn": "Жок дегенде 2 суроо кошуңуз — командаларга башка-башка суроо берилет.",
    "questions.correct": "Туура",
    "questions.editBtn": "Өзгөртүү",
    "questions.deleteBtn": "Өчүрүү",
    "questions.confirmDelete": "Бул сурону өчүрөсүзбү?",

    "auth.signinTitle": "Аккаунтуңузга кириңиз",
    "auth.signupTitle": "Аккаунт түзүңүз",
    "auth.email": "Эл. почта",
    "auth.password": "Сырсөз",
    "auth.signin": "Кирүү",
    "auth.signup": "Аккаунт түзүү",
    "auth.wait": "Күтө туруңуз…",
    "auth.or": "же",
    "auth.google": "Google аркылуу кирүү",
    "auth.toSignup": "Аккаунтуңуз жокпу? Катталыңыз",
    "auth.toSignin": "Аккаунтуңуз барбы? Кириңиз",
    "auth.created": "Аккаунт түзүлдү. Почтаңызды ырастап, кириңиз.",

    "game.start": "Оюнду баштоо",
    "game.pause": "Тыныгуу",
    "game.resume": "Улантуу",
    "game.restart": "Кайра баштоо",
    "game.topic": "Тема",
    "game.scoreHint": "← улакты өз Тай Казаныңарга салгыла →",
    "game.chaseHint": "🐎 Балдар кыздарды кууп жетүүдө! Туура жооп бергиле →",
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
    "game.mode": "Оюн режими",
    "game.mode.classic": "Классикалык Көк Бөрү",
    "game.mode.chase": "Кууш: Балдар vs Кыздар",
    "game.bg": "Фон",
    "game.bg.steppe": "Талаа",
    "game.bg.mountains": "Кыргызстандын тоолору",
    "game.team.girls": "Кыздар",
    "game.team.boys": "Балдар",
    "card.correct": "✓ Туура!",
    "card.wrong": "✗ Туура эмес",
    "card.empty": "Бул темага дагы суроо кошуңуз",
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
