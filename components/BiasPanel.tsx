"use client";

import { useState } from "react";

type Sesgo = {
  tipo: string;
  descripcion: string;
  cita: string;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; sesgos: Sesgo[] }
  | { status: "error"; message: string };

type Props = {
  texto: string; // texto del argumentario (titulo + gancho + argumentos + cierre)
};

export function BiasPanel({ texto }: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  async function analyze() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState({ status: "error", message: data.error || "Error al analizar." });
        return;
      }
      setState({ status: "done", sesgos: data.sesgos });
    } catch {
      setState({ status: "error", message: "Error de red. Inténtalo de nuevo." });
    }
  }

  function toggle() {
    if (!open && state.status === "idle") {
      analyze();
    }
    setOpen((v) => !v);
  }

  return (
    <div className="border-t border-muted-soft pt-4 mt-4">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 text-left group"
      >
        <div>
          <span className="text-sm font-medium text-ink group-hover:text-accent transition-colors">
            ¿Qué sesgos detectas?
          </span>
          <span className="ml-2 text-[10px] text-muted uppercase tracking-wider">
            Análisis crítico
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className={`flex-shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 5l4.5 4.5L11.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {state.status === "loading" && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.3s" }} />
              <span>Analizando el texto…</span>
            </div>
          )}

          {state.status === "error" && (
            <p className="text-xs text-red-600">{state.message}</p>
          )}

          {state.status === "done" && (
            <ol className="space-y-4">
              {state.sesgos.map((s, i) => (
                <li key={i} className="space-y-1">
                  <p className="text-xs font-semibold text-ink">
                    {i + 1}. {s.tipo}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">{s.descripcion}</p>
                  {s.cita && (
                    <blockquote className="border-l-2 border-accent/40 pl-3 text-xs text-muted italic">
                      "{s.cita}"
                    </blockquote>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
