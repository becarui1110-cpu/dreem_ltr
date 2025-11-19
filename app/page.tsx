// app/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import App from "./App";

const LINK_TTL_HOURS = 6; // durée totale du lien

type TimeParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

function computeTimeParts(ms: number): TimeParts {
  if (ms <= 0) {
    return { hours: "00", minutes: "00", seconds: "00" };
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

function HomeInner() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // 1) Récupérer la date d'expiration dans le token (timestamp en ms)
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    const [tsStr] = token.split(".");
    const ts = Number(tsStr);

    if (!Number.isFinite(ts)) return;
    setExpiresAt(ts);
  }, [searchParams]);

  // 2) Compte à rebours + redirection quand expiré
  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setRemainingMs(0);
        router.push("/expired");
        return;
      }
      setRemainingMs(diff);
    };

    update(); // premier calcul immédiat

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, router]);

  const totalMs = LINK_TTL_HOURS * 60 * 60 * 1000;
  const progress =
    remainingMs == null
      ? 1
      : Math.max(0, Math.min(1, remainingMs / totalMs));

  const timeParts = computeTimeParts(remainingMs ?? totalMs);

  const hasData = remainingMs !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Topbar */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-400/90" />
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
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid md:grid-cols-[1.1fr_0.55fr] gap-6">
        {/* Chat panel */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl min-h-[520px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div>
              <h1 className="text-lg font-semibold">
                Votre conseiller en droit du travail
              </h1>
              <p className="text-sm text-slate-400">
                Posez vos questions sur le contrat, le licenciement, les heures
                supplémentaires, les certificats de travail, etc.
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
          {/* Widget compte à rebours */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Informations d’accès
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Lien sécurisé
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Vous utilisez un lien d’accès temporaire à votre conseiller en
              droit du travail. Une fois expiré, il faudra en demander un
              nouveau.
            </p>

            {/* Widget digital */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Temps restant avant expiration
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Durée totale : {LINK_TTL_HOURS} heures
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                {/* chiffres */}
                <div className="flex items-center justify-center gap-2 font-mono">
                  <div className="flex flex-col items-center">
                    <div className="min-w-[3.2rem] text-center text-2xl md:text-3xl font-semibold bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                      {hasData ? timeParts.hours : "--"}
                    </div>
                    <span className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                      Heures
                    </span>
                  </div>

                  <div className="text-xl md:text-2xl text-slate-500 pb-4">
                    :
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="min-w-[3.2rem] text-center text-2xl md:text-3xl font-semibold bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                      {hasData ? timeParts.minutes : "--"}
                    </div>
                    <span className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                      Minutes
                    </span>
                  </div>

                  <div className="text-xl md:text-2xl text-slate-500 pb-4">
                    :
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="min-w-[3.2rem] text-center text-2xl md:text-3xl font-semibold bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                      {hasData ? timeParts.seconds : "--"}
                    </div>
                    <span className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                      Secondes
                    </span>
                  </div>
                </div>

                {/* statut */}
                <p className="text-[11px] text-slate-500">
                  {hasData
                    ? "À l’expiration, l’accès sera automatiquement coupé pour garantir la sécurité de vos données."
                    : "Calcul du temps restant à partir de votre lien sécurisé…"}
                </p>
              </div>

              {/* barre de progression */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Progression du temps</span>
                  <span>
                    {hasData
                      ? `${timeParts.hours}h${timeParts.minutes} restantes`
                      : "Synchronisation…"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-transform duration-500 origin-left"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloc aide */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Besoin d’aide ?
            </h2>
            <p className="text-sm text-slate-400">
              Si le chat ne s’affiche pas ou si votre lien a expiré, retournez
              sur le site principal pour générer un nouvel accès à votre
              conseiller.
            </p>
            <a
              href="https://ltr.dreem.ch" // 👉 remplace par ton domaine
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-sm font-medium px-4 py-2 hover:bg-white/90 transition"
            >
              Retourner sur le site
            </a>
          </div>

          {/* Bloc info expert */}
          <div className="bg-gradient-to-r from-emerald-500/15 to-slate-900/0 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200 mb-1">
              Accès expert
            </p>
            <p className="text-sm text-slate-100">
              Vous bénéficiez d’un accompagnement personnalisé et de réponses
              structurées sur vos questions de droit du travail.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

/**
 * Page wrapper avec Suspense pour satisfaire Next.js
 * (useSearchParams doit être utilisé sous une boundary)
 */
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
          Initialisation de la session sécurisée…
        </div>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
