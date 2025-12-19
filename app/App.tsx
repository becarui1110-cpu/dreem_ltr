// app/App.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

const MAX_ANSWERS = 5;

// anti double-décompte si ChatKitPanel déclenche onResponseEnd plusieurs fois
const MIN_MS_BETWEEN_COUNTS = 1200;

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  const [remaining, setRemaining] = useState<number>(MAX_ANSWERS);
  const [blocked, setBlocked] = useState(false);

  // ✅ ignore la première fin de réponse (souvent le greeting)
  const ignoredFirstEndRef = useRef(false);

  // ✅ anti-double count
  const lastCountAtRef = useRef(0);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel][LTR] widget action", action);
    }
  }, []);

  // sync initial vers page.tsx
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<{ remaining: number }>("ltr-quota-update", {
          detail: { remaining: MAX_ANSWERS },
        })
      );
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    // 1) ignorer le greeting
    if (!ignoredFirstEndRef.current) {
      ignoredFirstEndRef.current = true;
      return;
    }

    // 2) anti double-count (si onResponseEnd se déclenche 2x)
    const now = Date.now();
    if (now - lastCountAtRef.current < MIN_MS_BETWEEN_COUNTS) return;
    lastCountAtRef.current = now;

    setRemaining((prev) => {
      const next = Math.max(prev - 1, 0);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent<{ remaining: number }>("ltr-quota-update", {
            detail: { remaining: next },
          })
        );
      }

      if (next <= 0) setBlocked(true);
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    // ✅ IMPORTANT: pas de <main> plein écran ici, juste remplir le parent
    <div className="w-full h-full flex flex-col min-h-0 relative">
      {/* Bandeau quota */}
      <div className="px-3 py-1 text-[11px] text-slate-400 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
        <span>Session LTR Dreem</span>
        <span>
          Réponses restantes :{" "}
          <span
            className={
              remaining <= 1
                ? "text-amber-300 font-semibold"
                : "text-emerald-300 font-semibold"
            }
          >
            {remaining}
          </span>{" "}
          / {MAX_ANSWERS}
        </span>
      </div>

      {/* Zone chat */}
      <div className="flex-1 relative min-h-0">
        {ready ? (
          <>
            <ChatKitPanel
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
            />

            {/* ✅ Bloquer uniquement la saisie, pas la lecture */}
            {blocked && (
              <div className="pointer-events-auto absolute inset-x-0 bottom-0">
                {/* un léger gradient au-dessus de la zone de saisie */}
                <div className="h-16 bg-gradient-to-t from-slate-950/95 to-transparent" />

                <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-100">
                    Quota atteint
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vous pouvez continuer à lire la conversation, mais vous ne
                    pouvez plus poser de question avec ce lien.
                  </p>

                  <a
                    href="https://ltr.dreem.ch"
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-xs font-medium px-4 py-2 hover:bg-white/90 transition"
                  >
                    Demander un nouvel accès
                  </a>
                </div>

                {/* ✅ couche qui empêche le clic sur l’input uniquement en bas */}
                <div className="absolute inset-x-0 bottom-0 h-28 cursor-not-allowed" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
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
