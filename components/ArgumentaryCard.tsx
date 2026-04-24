"use client";

import { useState } from "react";
import type { GenerationResult } from "@/types";
import topicsData from "@/data/topics.json";
import axesData from "@/data/axes.json";
import type { Axis, Topic } from "@/types";
import { CulturalReferences } from "./CulturalReferences";
import { InfoTooltip } from "./InfoTooltip";
import { cn } from "@/lib/utils";

const topics = topicsData as Topic[];
const axes = axesData as Axis[];

type Props = {
  result: GenerationResult;
  compact?: boolean;
  accent?: "primary" | "contrast";
};

function resolveNames(result: GenerationResult) {
  const topic = topics.find((t) => t.id === result.topicId);
  const subtopic = topic?.subtopics.find((s) => s.id === result.subtopicId);
  return { topicName: topic?.name ?? result.topicId, subtopicName: subtopic?.name ?? result.subtopicId };
}

export function ArgumentaryCard({ result, compact, accent = "primary" }: Props) {
  const { topicName, subtopicName } = resolveNames(result);
  const accentClass = accent === "contrast" ? "text-accent-contrast" : "text-accent";
  const accentBorder = accent === "contrast" ? "border-accent-contrast/40" : "border-accent/40";
  // Por defecto ambas secciones abiertas: contienen contenido muy valioso
  const [showQuestions, setShowQuestions] = useState(true);
  const [showReferences, setShowReferences] = useState(true);

  return (
    <article
      lang="es"
      className="bg-white rounded-xl border border-muted-soft shadow-paper p-6 sm:p-8"
    >
      <header className={`mb-4 pb-4 border-b ${accentBorder}`}>
        <p className={`text-xs uppercase tracking-widest ${accentClass}`}>
          {topicName} · {subtopicName}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          {result.activeAxes.map((a) => {
            const ax = axes.find((x) => x.id === a.id);
            if (!ax) return null;
            return (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 text-[11px] text-muted bg-muted-softer px-2 py-0.5 rounded-full"
              >
                <span>
                  {ax.name}: <strong className="text-ink font-medium">{a.value}</strong>
                </span>
                <InfoTooltip label={`Eje ${ax.name}`}>
                  <span className="block">
                    <strong>Eje {ax.name}</strong> (valor {a.value} de 5)
                  </span>
                  <span className="block mt-1 text-xs text-muted">
                    1 = {ax.extreme1} · 5 = {ax.extreme5}
                  </span>
                  <span className="block mt-2">{ax.tooltip}</span>
                </InfoTooltip>
              </span>
            );
          })}
        </div>
      </header>

      <h2
        className={`font-serif ${compact ? "text-2xl" : "text-3xl"} leading-tight text-ink`}
      >
        {result.titulo}
      </h2>

      <div className="aurora-prose mt-5 max-w-reading text-ink">
        <p>{result.gancho}</p>

        {result.argumentos.map((arg, i) => (
          <div key={i} className="mt-5">
            <h3 className="font-serif text-xl text-ink">{arg.subtitulo}</h3>
            <p className="mt-1">{arg.desarrollo}</p>
          </div>
        ))}

        <p className="mt-6 italic text-ink/90">{result.cierre}</p>
      </div>

      {result.preguntas_aula.length > 0 && (
        <aside className="mt-8 border-t border-muted-soft">
          <div className="print:hidden">
            <DisclosureHeader
              open={showQuestions}
              onToggle={() => setShowQuestions((v) => !v)}
              eyebrow="Preguntas para el aula"
              label={`${result.preguntas_aula.length} ${result.preguntas_aula.length === 1 ? "pregunta" : "preguntas"} de debate`}
            />
          </div>
          <p className="hidden print:block text-[11px] font-medium uppercase tracking-[0.2em] text-muted mt-4 mb-2">
            Preguntas para el aula
          </p>
          <ol
            className={cn(
              "list-decimal list-inside space-y-1.5 text-sm text-ink/90 pb-5 pl-1 print:!block",
              showQuestions ? "block" : "hidden",
            )}
          >
            {result.preguntas_aula.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </aside>
      )}

      {(result.referencias_culturales?.length ?? 0) > 0 && (
        <div className="mt-2 border-t border-muted-soft">
          <div className="print:hidden">
            <DisclosureHeader
              open={showReferences}
              onToggle={() => setShowReferences((v) => !v)}
              eyebrow="El argumento en la ficción"
              label={`${result.referencias_culturales.length} ${result.referencias_culturales.length === 1 ? "referencia" : "referencias"} de cine y series`}
            />
          </div>
          <div
            className={cn(
              "print:!block",
              showReferences ? "block" : "hidden",
            )}
          >
            <CulturalReferences references={result.referencias_culturales} />
          </div>
        </div>
      )}
    </article>
  );
}

function DisclosureHeader({
  open,
  onToggle,
  eyebrow,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  eyebrow: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-4 py-4 text-left group"
    >
      <span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </span>
        <span className="block text-sm text-ink mt-0.5">{label}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "shrink-0 h-8 w-8 rounded-full border border-muted-soft flex items-center justify-center text-muted transition-all group-hover:border-ink/50 group-hover:text-ink",
          open && "rotate-180 bg-ink text-white border-ink",
        )}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
