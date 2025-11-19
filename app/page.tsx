// app/page.tsx
"use client";

import { useState } from "react";
import App from "./App";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Topbar */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-400/90" />
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-300">
                MyCarAdvisor
              </p>
              <p className="text-base font-semibold">Agent IA Premium</p>
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
              <h1 className="text-lg font-semibold">Votre assistant premium</h1>
              <p className="text-sm text-slate-400">
                Posez vos questions sur le véhicule, les coûts, les options…
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
              // on réutilise ton composant existant
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Informations d’accès
            </h2>
            <p className="text-sm text-slate-400">
              Vous utilisez un lien d’accès temporaire. Une fois expiré, il
              faudra en demander un nouveau.
            </p>
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Durée du lien
              </p>
              <p className="text-base font-semibold text-slate-50">24 heures</p>
              <p className="text-xs text-slate-500">
                Le compte à rebours est géré côté serveur.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Besoin d’aide ?
            </h2>
            <p className="text-sm text-slate-400">
              Si le chat ne s’affiche pas ou si votre lien a expiré, retournez
              sur <span className="text-slate-100">mycaradvisor.ch</span> pour
              générer un nouvel accès.
            </p>
            <a
              href="https://mycaradvisor.ch"
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-sm font-medium px-4 py-2 hover:bg-white/90 transition"
            >
              Retourner sur le site
            </a>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/15 to-slate-900/0 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200 mb-1">
              Premium activé
            </p>
            <p className="text-sm text-slate-100">
              Vous avez accès aux fonctionnalités avancées de l’agent.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
