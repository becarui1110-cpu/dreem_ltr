// app/App.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

const MAX_ANSWERS = 5;

function isProbablySendButton(el: HTMLElement | null): boolean {
  if (!el) return false;

  // bouton (ou icône dans bouton) → remonter au bouton
  const btn = el.closest("button");
  if (!btn) return false;

  const aria = (btn.getAttribute("aria-label") || "").toLowerCase();
  const text = (btn.textContent || "").toLowerCase();

  // heuristiques
  if (btn.getAttribute("type") === "submit") return true;
  if (aria.includes("send") || aria.includes("envoyer")) return true;
  if (text.includes("send") || text.includes("envoyer")) return true;

  return false;
}

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  const [remaining, setRemaining] = useState<number>(MAX_ANSWERS);
  const [blocked, setBlocked] = useState(false);

  // ✅ nombre de “questions envoyées” en attente d’une réponse complète
  const pendingTurnsRef = useRef(0);
  const blockedRef = useRef(false);

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

  // ✅ Appelé à la fin d’une réponse du bot
  const handleResponseEnd = useCallback(() => {
    // Si aucune question n’a été envoyée (pendingTurns === 0),
    // on ignore (ça couvre le greeting / messages auto)
    if (pendingTurnsRef.current <= 0) return;

    // Une réponse complète correspond à une question envoyée
    pendingTurnsRef.current -= 1;

    setRemaining((prev) => {
      const next = Math.max(prev - 1, 0);

      window.dispatchEvent(
        new CustomEvent<{ remaining: number }>("ltr-quota-update", {
          detail: { remaining: next },
        })
      );

      if (next <= 0) {
        blockedRef.current = true;
        setBlocked(true);
      }

      return next;
    });
  }, []);

  // ✅ détecter une “vraie” soumission (Enter sans Shift, ou clic sur bouton Envoyer)
  const registerSendTurn = useCallback(() => {
    if (blockedRef.current) return;
    pendingTurnsRef.current += 1;
  }, []);

  const onKeyDownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (blockedRef.current) return;

      // Enter pour envoyer (souvent) — on ignore Shift+Enter
      if (e.key === "Enter" && !e.shiftKey) {
        registerSendTurn();
      }
    },
    [registerSendTurn]
  );

  const onClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (blockedRef.current) return;

      const target = e.target as HTMLElement | null;
      if (isProbablySendButton(target)) {
        registerSendTurn();
      }
    },
    [registerSendTurn]
  );

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

      <div className="flex-1 relative min-h-0">
        {ready ? (
          <div
            className="absolute inset-0"
            onKeyDownCapture={onKeyDownCapture}
            onClickCapture={onClickCapture}
          >
            <ChatKitPanel
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
            />

            {/* ✅ blocage uniquement de la zone de saisie (en bas) */}
            {blocked && (
              <div className="pointer-events-auto absolute inset-x-0 bottom-0">
                {/* gradient pour lisibilité */}
                <div className="h-20 bg-gradient-to-t from-slate-950/95 to-transparent" />

                {/* panneau blocage */}
                <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-3 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    Quota atteint
                  </p>
                  <p className="text-xs text-slate-400">
                    Vous pouvez continuer à lire cette conversation, mais vous
                    ne pouvez plus poser de question avec ce lien.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="https://ltr.dreem.ch"
                      className="inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-950 text-xs font-medium px-4 py-2 hover:bg-white/90 transition"
                    >
                      Demander un nouvel accès
                    </a>
                  </div>
                </div>

                {/* ✅ capture les clics dans la zone input */}
                <div className="absolute inset-0 cursor-not-allowed" />
              </div>
            )}
          </div>
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
