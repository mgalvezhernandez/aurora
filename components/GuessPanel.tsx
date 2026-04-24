"use client";

import { useState } from "react";
import type { ActiveAxis } from "@/types";
import axesData from "@/data/axes.json";

type Axis = {
  id: string;
  name: string;
  extreme1: string;
  extreme5: string;
};

const AXES = axesData as Axis[];

type Props = {
  realAxes: ActiveAxis[];
  onClose: () => void;
};

function diff(real: number, guess: number): number {
  return Math.abs(real - guess);
}

function accuracy(real: ActiveAxis[], guesses: Record<string, number>): number {
  const total = real.reduce((acc, a) => acc + (5 - diff(a.value, guesses[a.id] ?? 3)), 0);
  return Math.round((total / (real.length * 4)) * 100);
}

export function GuessPanel({ realAxes, onClose }: Props) {
  const [guesses, setGuesses] = useState<Record<string, number>>(
    () => Object.fromEntries(realAxes.map((a) => [a.id, 3])),
  );
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const setGuess = (id: string, value: number) =>
    setGuesses((prev) => ({ ...prev, [id]: value }));

  const pct = revealed ? accuracy(realAxes, guesses) : null;

  function buildShareText(): string {
    const lines: string[] = [];
    lines.push(`🎯 Reto Aurora: precisión ${pct}%`);
    lines.push("");
    for (const a of realAxes) {
      const meta = AXES.find((x) => x.id === a.id);
      if (!meta) continue;
      const g = guesses[a.id] ?? 3;
      const d = diff(a.value, g);
      const icon = d === 0 ? "✅" : d === 1 ? "🟡" : "❌";
      lines.push(`${icon} ${meta.name} — tu apuesta: ${g} · real: ${a.value}`);
    }
    lines.push("");
    lines.push("¿Adivinas tú la postura? · aurora-zeta-gold.vercel.app");
    return lines.join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    // Intentar Web Share API primero (móvil)
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: { text: string }) => Promise<void> })
          .share({ text });
        return;
      } catch {
        // usuario canceló o no soportado → fallback a clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignorar
      }
    }
  }

  return (
    <div className="rounded-xl border border-muted-soft bg-white shadow-paper p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium mb-1">
            Adivina la postura
          </p>
          <h3 className="font-serif text-xl text-ink">
            {revealed
              ? "Resultado de tu apuesta"
              : "¿Qué ideología detectas en este argumentario?"}
          </h3>
          {!revealed && (
            <p className="text-xs text-muted mt-1 max-w-md">
              Mueve los sliders según la postura que crees que tiene el texto.
              Cuando estés listo, revela la configuración real.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-ink flex-shrink-0 mt-0.5"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <ol className="space-y-5">
        {realAxes.map((realAxis) => {
          const meta = AXES.find((a) => a.id === realAxis.id);
          if (!meta) return null;
          const guess = guesses[realAxis.id] ?? 3;
          const d = diff(realAxis.value, guess);
          const perfect = d === 0;
          const close = d === 1;

          return (
            <li key={realAxis.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{meta.name}</span>
                {revealed && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      perfect
                        ? "bg-green-50 text-green-700"
                        : close
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {perfect ? "¡Exacto!" : close ? "Muy cerca" : `Real: ${realAxis.value}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted w-28 text-right leading-tight">
                  {meta.extreme1}
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={guess}
                  disabled={revealed}
                  onChange={(e) => setGuess(realAxis.id, Number(e.target.value))}
                  className="flex-1 accent-accent disabled:opacity-70"
                />
                <span className="text-[10px] text-muted w-28 leading-tight">
                  {meta.extreme5}
                </span>
              </div>

              {revealed && (
                <div className="relative h-1.5 bg-muted-softer rounded-full overflow-hidden">
                  {/* barra real */}
                  <div
                    className="absolute h-full bg-accent/30 rounded-full"
                    style={{ width: `${((realAxis.value - 1) / 4) * 100}%` }}
                  />
                  {/* marcador real */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent border-2 border-white shadow"
                    style={{
                      left: `calc(${((realAxis.value - 1) / 4) * 100}% - 6px)`,
                    }}
                  />
                </div>
              )}

              {revealed && (
                <p className="text-[10px] text-muted">
                  Tu apuesta: <strong>{guess}</strong> · Postura real:{" "}
                  <strong className="text-accent">{realAxis.value}</strong>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="w-full py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          Revelar postura real
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-muted-softer px-4 py-3 text-center">
            <p className="text-sm font-medium text-ink">
              Precisión: <span className="text-accent text-lg font-bold">{pct}%</span>
            </p>
            <p className="text-xs text-muted mt-0.5">
              {pct! >= 90
                ? "¡Excelente! Detectas muy bien las posturas ideológicas."
                : pct! >= 60
                  ? "Bien. Con práctica lo afinarás más."
                  : "El texto ocultaba bien su ideología. Sigue entrenando."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2 rounded-md border border-muted-soft text-sm text-ink hover:bg-muted-softer inline-flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M10 4.5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V9.5M7 7h5m0 0L9.5 4.5M12 7l-2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {copied ? "¡Copiado al portapapeles!" : "Compartir resultado"}
          </button>
        </div>
      )}
    </div>
  );
}
