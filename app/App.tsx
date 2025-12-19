// app/App.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

const MAX_ANSWERS = 5;

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  const [remaining, setRemaining] = useState<number>(MAX_ANSWERS);
  const [blocked, setBlocked] = useState(false);

  // ✅ pour ne pas compter le message d'accueil
  const [ignoredFirstEnd, setIgnoredFirstEnd] = useState(false);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel][LTR] widget action", action);
    }
  }, []);

  // 🔁 sync initial vers page.tsx
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<{ remaining: number }>("ltr-quota-update", {
        detail: { remaining: MAX_ANSWERS },
      })
    );
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (!ignoredFirstEnd) {
      setIgnoredFirstEnd(true);
      return; // 👈 ignore la première fin de réponse (souvent greeting)
    }

    setRemaining((prev) => {
      const next = Math.max(prev - 1, 0);

      window.dispatchEvent(
        new CustomEvent<{ remaining: number }>("ltr-quota-update", {
          detail: { remaining: next },
        })
      );

      if (next <= 0) setBlocked(true);
      return next;
    });
  }, [ignoredFirstEnd]);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col min-h-0 relative">
      {/* Bandeau quota en haut du chat */}
      <div className="px-3 py-1 text-[11px] text-slate-400 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
        <span>Session LTR Dreem</span>
        <span>
          Réponses restantes :{" "}
          <span className={remaining <= 1 ? "text-amber-300 font-semibold" : "text-emerald-300 font-semibold"}>
            {remaining}
          </span>{" "}
          / {MAX_ANSWERS}
        </span>
      </div>

      <div className="flex-1 relative min-h-0">
        {ready ? (
          <>
            <ChatKitPanel
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
            />

            {blocked && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center px-4 text-center">
                <p className="text-sm font-semibold text-slate-100 mb-2">
                  Quota de réponses atteint
                </p>
                <p className="text-xs text-slate-400 mb-4 max-w-sm">
                  Vous avez utilisé les 5 réponses incluses dans ce lien. Demandez un nouvel accès pour continuer.
                </p>
                <a
                  href="https://ltr.dreem.ch"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-xs font-medium px-4 py-2 hover:bg-white/90 transition"
                >
                  Retourner sur le site
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-950/40">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">
                Initialisation du conseiller en droit du travail…
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
