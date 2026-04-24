"use client";

import axesData from "@/data/axes.json";
import topicsData from "@/data/topics.json";
import type { Axis, Topic } from "@/types";
import { useAurora } from "@/lib/store";
import { AxisSlider } from "./AxisSlider";
import { cn } from "@/lib/utils";

const axes = axesData as Axis[];
const topics = topicsData as Topic[];

const CATEGORY_ACCENTS: Record<string, { hex: string; bgSoft: string; border: string }> = {
  "economia-bienestar": { hex: "#2E5FB8", bgSoft: "rgba(46,95,184,0.06)", border: "rgba(46,95,184,0.22)" },
  "vida-urbana":        { hex: "#B85C3A", bgSoft: "rgba(184,92,58,0.06)", border: "rgba(184,92,58,0.22)" },
  "derechos-civiles":   { hex: "#7A5AA8", bgSoft: "rgba(122,90,168,0.06)", border: "rgba(122,90,168,0.22)" },
  "entorno-ciencia":    { hex: "#3A8566", bgSoft: "rgba(58,133,102,0.06)", border: "rgba(58,133,102,0.22)" },
  "estado-mundo":       { hex: "#A88A2E", bgSoft: "rgba(168,138,46,0.06)", border: "rgba(168,138,46,0.22)" },
};

export function AxesConfigurator() {
  const {
    topicId,
    subtopicId,
    axes: axesState,
    toggleAxis,
    setAxisValue,
    setStep,
    generate,
    isGenerating,
    error,
    clearError,
    history,
  } = useAurora();

  const topic = topics.find((t) => t.id === topicId);
  const subtopic = topic?.subtopics.find((s) => s.id === subtopicId);

  const activeCount = Object.values(axesState).filter((a) => a.enabled).length;
  const canGenerate = activeCount >= 1 && !!subtopic && !isGenerating;

  const accent =
    (topic && CATEGORY_ACCENTS[topic.id]) ??
    CATEGORY_ACCENTS["economia-bienestar"];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
          Paso 2 de 3 · Postura
        </p>

        {topic && subtopic && (
          <section
            aria-label="Tema seleccionado"
            className="mt-3 relative overflow-hidden rounded-3xl border bg-white"
            style={{
              borderColor: accent.border,
              backgroundImage: `linear-gradient(135deg, ${accent.bgSoft} 0%, rgba(255,255,255,0) 60%)`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
              style={{ backgroundColor: accent.hex, opacity: 0.14 }}
            />
            <div
              aria-hidden
              className="absolute top-0 left-0 h-full w-1.5"
              style={{ backgroundColor: accent.hex }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: accent.hex }}
                      aria-hidden
                    />
                    <span className="text-muted">Argumentando sobre</span>
                  </div>

                  <h2 className="mt-2 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-ink">
                    {subtopic.name}
                  </h2>

                  <p className="mt-3 text-muted max-w-xl leading-relaxed">
                    {subtopic.description}
                  </p>

                  <p
                    className="mt-4 text-xs font-medium uppercase tracking-[0.16em]"
                    style={{ color: accent.hex }}
                  >
                    {topic.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("topic")}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors border border-muted-soft rounded-full px-3 py-1.5 bg-white/70 backdrop-blur"
                  aria-label="Cambiar tema"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M7.5 2.5L4 6l3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Cambiar
                </button>
              </div>
            </div>
          </section>
        )}

        <h3 className="mt-10 font-serif text-3xl sm:text-4xl text-ink">
          Elige tu <span className="italic" style={{ color: accent.hex }}>postura</span>
        </h3>
        <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
          Activa los ejes que quieras usar. Cada eje puede tener un valor entre 1 y 5.
          Al menos uno debe estar activo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {axes.map((axis) => {
          const st = axesState[axis.id] ?? { enabled: false, value: 3 as const };
          return (
            <AxisSlider
              key={axis.id}
              axis={axis}
              value={st.value}
              enabled={st.enabled}
              onToggle={() => toggleAxis(axis.id)}
              onChange={(v) => setAxisValue(axis.id, v)}
            />
          );
        })}
      </div>

      {activeCount === 0 && (
        <p className="text-sm text-accent-contrast bg-accent-contrast/10 border border-accent-contrast/30 rounded-md px-4 py-3">
          Activa al menos un eje ideológico para generar un argumentario.
        </p>
      )}

      {error && (
        <div className="text-sm text-accent-contrast bg-accent-contrast/10 border border-accent-contrast/30 rounded-md px-4 py-3 flex items-start justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-xs uppercase tracking-wide hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {activeCount > 0 ? (
            <>
              <span className="text-ink font-medium">{activeCount}</span>{" "}
              {activeCount === 1 ? "eje activo" : "ejes activos"} de 6
            </>
          ) : (
            "Ningún eje activo"
          )}
        </p>

        <div className="flex gap-3">
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setStep("result")}
              className="px-4 py-2.5 text-sm rounded-md border border-muted-soft text-ink hover:bg-muted-softer"
            >
              Ver historial
            </button>
          )}
          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => generate()}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
              canGenerate
                ? "bg-ink text-white hover:bg-ink/90 shadow-paper"
                : "bg-muted-soft text-muted cursor-not-allowed",
            )}
          >
            {isGenerating ? (
              <>
                <Spinner />
                Construyendo el argumentario desde tu postura...
              </>
            ) : (
              <>
                Generar argumentario
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M3 7h8m0 0L7 3m4 4l-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"
      aria-hidden
    />
  );
}
