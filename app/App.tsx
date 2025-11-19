"use client";

import { useCallback, useState, useEffect } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-5xl mx-auto flex flex-col h-[80vh] md:h-[85vh] border border-slate-800 bg-slate-900/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/70">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Assistant MyCarAdvisor
            </p>
            <p className="text-sm font-semibold text-slate-50">
              Conseiller IA — Premium
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300">En ligne</span>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 relative">
          {ready ? (
            <ChatKitPanel
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">
                  Initialisation de l’assistant…
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-2 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400">
          Les réponses sont générées automatiquement. Vérifiez les informations
          importantes avant toute décision.
        </div>
      </div>
    </main>
  );
}
