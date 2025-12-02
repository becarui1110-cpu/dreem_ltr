"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import App from "./App";

/** 🧮 Nombre max de réponses */
const MAX_ANSWERS = 5;

/** 🔢 Formatage texte */
type TimeParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

function HomeInner() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  /** 🔢 quota */
  const [remaining, setRemaining] = useState(MAX_ANSWERS);

  /** 🧲 Écouteur pour recevoir les mises à jour du quota depuis App.tsx */
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setRemaining(e.detail.remaining);
    };

    // écoute l’événement "ltr-quota-update"
    window.addEventListener("ltr-quota-update", handler as any);

    return () =>
      window.removeEventListener("ltr-quota-update", handler as any);
  }, []);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-400/90" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-300">
                LTR Dreem — Conseiller IA
              </p>
              <p className="text-sm sm:text-base font-semibold">
                Droit du travail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 px-2.5 py-1 text-[11px] border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Actif
            </span>

            {/* Mobile info */}
            <button
              onClick={() => setInfoOpen((v) => !v)}
              className="md:hidden rounded-lg border border-slate-700 px-3 py-1.5 text-xs bg-slate-900"
            >
              {infoOpen ? "Masquer" : "Infos"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-4 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-[1.1fr_0.55fr] gap-4 sm:gap-6">

        {/* CHAT */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl min-h-[420px] sm:min-h-[520px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-800">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold">Votre conseiller LTR</h1>
              <p className="text-[12px] sm:text-sm text-slate-400 truncate">
                Posez vos questions en droit du travail — réponse claire et fiable.
              </p>
            </div>
            <button
              onClick={() => setIsChatOpen((p) => !p)}
              className="text-xs border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg bg-slate-900"
            >
              {isChatOpen ? "Masquer" : "Afficher"}
            </button>
          </div>

          <div className="flex-1 min-h-[360px] sm:min-h-[430px] bg-slate-950/30">
            {isChatOpen ? (
              <App />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm py-10">
                Chat masqué. Cliquez sur “Afficher”.
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside className="hidden md:block space-y-4">

          {/* QUOTA Widget */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">Quota d’utilisation</h2>
            <p className="text-sm text-slate-400">
              Ce lien donne accès à un nombre limité de réponses du conseiller.
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">Réponses restantes</p>

              <p className="text-3xl font-mono font-semibold text-slate-50">
                {remaining}{" "}
                <span className="text-slate-500 text-sm">/ {MAX_ANSWERS}</span>
              </p>

              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500 origin-left"
                  style={{ transform: `scaleX(${remaining / MAX_ANSWERS})` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Chaque réponse consomme 1 crédit.
              </p>
            </div>
          </div>

          {/* HELP */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">Besoin d’aide ?</h2>
            <p className="text-sm text-slate-400">
              Si le quota est atteint ou si vous souhaitez plus de réponses, demandez un nouvel accès.
            </p>
            <a
              href="https://ltr.dreem.ch"
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-sm font-medium px-4 py-2 hover:bg-white/90 transition"
            >
              Retourner sur le site
            </a>
          </div>
        </aside>
      </main>
    </div>
  );
}

/** Suspense wrapper */
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
          Initialisation…
        </div>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
