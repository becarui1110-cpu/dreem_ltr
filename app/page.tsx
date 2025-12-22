// app/page.tsx (LTR)
"use client";

import { Suspense, useEffect, useState } from "react";
import App from "./App";

const MAX_ANSWERS = 5;

function clampRemaining(n: number) {
  if (!Number.isFinite(n)) return MAX_ANSWERS;
  return Math.max(0, Math.min(MAX_ANSWERS, Math.floor(n)));
}

function getTokenFromUrl(): string {
  if (typeof window === "undefined") return "no-window";
  const sp = new URLSearchParams(window.location.search);
  return sp.get("token") ?? "no-token";
}

function DreemLogo() {
  return (
    <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
      <img
        src="/dreem_w.png"
        alt="Dreem"
        width={22}
        height={22}
        style={{ objectFit: "contain", display: "block" }}
      />
    </div>
  );
}

function HomeInner() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [remaining, setRemaining] = useState<number>(MAX_ANSWERS);
  const [infoOpen, setInfoOpen] = useState(false);

  // Hydrate compteur (anti reset au refresh)
  useEffect(() => {
    const token = getTokenFromUrl();
    const key = `ltr_quota_remaining:${token}`;

    const raw = window.localStorage.getItem(key);
    const restored = raw == null ? MAX_ANSWERS : clampRemaining(Number(raw));

    if (raw == null) window.localStorage.setItem(key, String(MAX_ANSWERS));
    setRemaining(restored);
  }, []);

  // Écoute les updates quota envoyées par App.tsx
  useEffect(() => {
    const handler: EventListener = (event) => {
      const e = event as CustomEvent<{ remaining: number }>;
      if (typeof e.detail?.remaining === "number") {
        setRemaining(clampRemaining(e.detail.remaining));
      }
    };

    window.addEventListener("ltr-quota-update", handler);
    return () => window.removeEventListener("ltr-quota-update", handler);
  }, []);

  const progress = Math.max(0, Math.min(1, remaining / MAX_ANSWERS));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <DreemLogo />
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-300">
                Conseiller Droit du Travail
              </p>
              <p className="text-base font-semibold">Agent IA Expert</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="hidden sm:inline">Session sécurisée</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Actif
            </span>

            <button
              onClick={() => setInfoOpen((v) => !v)}
              className="md:hidden rounded-lg border border-slate-700 px-3 py-1.5 text-xs bg-slate-900"
              aria-expanded={infoOpen}
              aria-controls="mobile-info"
            >
              {infoOpen ? "Masquer" : "Infos"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid md:grid-cols-[1.1fr_0.55fr] gap-6">
        {/* Chat panel */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl min-h-[520px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div>
              <h1 className="text-lg font-semibold">
                Votre conseiller en droit du travail
              </h1>
              <p className="text-sm text-slate-400">
                Contrat, licenciement, heures sup., certificats de travail, etc.
              </p>
            </div>
            <button
              onClick={() => setIsChatOpen((p) => !p)}
              className="text-xs border border-slate-700 hover:border-slate-500 px-3 py-1 rounded-lg bg-slate-900"
            >
              {isChatOpen ? "Masquer" : "Afficher"}
            </button>
          </div>

          <div className="flex-1 min-h-[430px] bg-slate-950/30">
            {isChatOpen ? (
              <App />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm py-10">
                Chat masqué. Cliquez sur “Afficher”.
              </div>
            )}
          </div>
        </section>

        {/* Right panel */}
        <aside className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Quota d’accès
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                Lien limité
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Réponses restantes
              </p>
              <p className="text-3xl font-mono font-semibold text-slate-50">
                {remaining}{" "}
                <span className="text-slate-500 text-sm">/ {MAX_ANSWERS}</span>
              </p>

              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500 origin-left"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Chaque réponse complète consomme 1 crédit.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Besoin d’aide ?
            </h2>
            <p className="text-sm text-slate-400">
              Si le quota est atteint, demandez un nouvel accès.
            </p>
            <a
              href="https://www.dreem.ch/product-page/discutez-avec-un-conseiller-du-travail-ia"
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-sm font-medium px-4 py-2 hover:bg-white/90 transition"
            >
              Demander un nouvel accès
            </a>
          </div>
        </aside>

        {/* Mobile infos */}
        <section
          id="mobile-info"
          className={`md:hidden col-span-1 transition-[max-height,opacity] duration-300 overflow-hidden ${
            infoOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-sm text-slate-400 text-center">
              Réponses restantes
            </p>
            <p className="text-xl font-mono text-center">
              {remaining} / {MAX_ANSWERS}
            </p>
            <a
              href="https://www.dreem.ch/product-page/discutez-avec-un-conseiller-du-travail-ia"
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-sm font-medium px-4 py-2 hover:bg-white/90 transition w-full"
            >
              Demander un nouvel accès
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
          Initialisation de la session…
        </div>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
