"use client";

import { useState } from "react";
import topicsData from "@/data/topics.json";
import type { Topic } from "@/types";
import { useAurora } from "@/lib/store";
import { cn } from "@/lib/utils";

const topics = topicsData as Topic[];

const CATEGORY_ACCENTS: Record<string, { dot: string; ring: string; bg: string }> = {
  "economia-bienestar": { dot: "bg-[#2E5FB8]", ring: "ring-[#2E5FB8]/30", bg: "bg-[#2E5FB8]/5" },
  "vida-urbana": { dot: "bg-[#B85C3A]", ring: "ring-[#B85C3A]/30", bg: "bg-[#B85C3A]/5" },
  "derechos-civiles": { dot: "bg-[#7A5AA8]", ring: "ring-[#7A5AA8]/30", bg: "bg-[#7A5AA8]/5" },
  "entorno-ciencia": { dot: "bg-[#3A8566]", ring: "ring-[#3A8566]/30", bg: "bg-[#3A8566]/5" },
  "estado-mundo": { dot: "bg-[#A88A2E]", ring: "ring-[#A88A2E]/30", bg: "bg-[#A88A2E]/5" },
};

export function TopicSelector() {
  const { topicId, subtopicId, selectSubtopic, setStep } = useAurora();
  const [expanded, setExpanded] = useState<string | null>(topicId);

  function handleToggle(id: string) {
    setExpanded((curr) => (curr === id ? null : id));
  }

  const canContinue = !!topicId && !!subtopicId;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
          Paso 1 de 3 · Tema
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05] text-ink">
          ¿Qué tema quieres <span className="italic">explorar</span>?
        </h2>
        <p className="text-muted max-w-xl">
          Elige una categoría y, dentro de ella, un tema concreto. Luego definirás
          desde qué postura quieres verlo.
        </p>
      </header>

      <ul className="space-y-3">
        {topics.map((topic) => {
          const isOpen = expanded === topic.id;
          const accent = CATEGORY_ACCENTS[topic.id] ?? CATEGORY_ACCENTS["economia-bienestar"];
          return (
            <li
              key={topic.id}
              className={cn(
                "rounded-2xl border bg-white overflow-hidden transition-all",
                isOpen ? "border-ink/20 shadow-paper" : "border-muted-soft hover:border-ink/20",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`subtopics-${topic.id}`}
                onClick={() => handleToggle(topic.id)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "mt-1 shrink-0 h-2.5 w-2.5 rounded-full",
                      accent.dot,
                    )}
                    aria-hidden
                  />
                  <span>
                    <span className="font-serif text-xl sm:text-2xl text-ink">
                      {topic.name}
                    </span>
                    <span className="block text-sm text-muted mt-1 leading-relaxed">
                      {topic.description}
                    </span>
                  </span>
                </div>
                <span
                  aria-hidden
                  className={cn(
                    "shrink-0 h-9 w-9 rounded-full border border-muted-soft flex items-center justify-center text-muted transition-all",
                    isOpen && "rotate-180 bg-ink text-white border-ink",
                  )}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M3 5l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div
                  id={`subtopics-${topic.id}`}
                  className={cn("border-t border-muted-soft px-4 sm:px-6 py-5", accent.bg)}
                >
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted mb-3 px-1">
                    Elige un subtema
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topic.subtopics.map((s) => {
                      const selected = topicId === topic.id && subtopicId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectSubtopic(topic.id, s.id)}
                          className={cn(
                            "group relative text-left rounded-xl bg-white border transition-all p-4 hover:-translate-y-0.5 hover:shadow-paper",
                            selected
                              ? `border-ink ring-2 ${accent.ring}`
                              : "border-muted-soft hover:border-ink/40",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-sans font-semibold text-ink text-[15px] leading-snug">
                              {s.name}
                            </span>
                            <span
                              aria-hidden
                              className={cn(
                                "shrink-0 h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                                selected
                                  ? "bg-ink border-ink text-white"
                                  : "border-muted-soft text-transparent group-hover:border-ink/40",
                              )}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path
                                  d="M2 5l2 2 4-4"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                          <p className="text-[13px] text-muted mt-1.5 leading-relaxed">
                            {s.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted">
          {canContinue ? (
            <span>
              <span className="text-ink font-medium">Listo.</span> Continúa para configurar tu postura.
            </span>
          ) : (
            "Selecciona un subtema para continuar."
          )}
        </p>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => setStep("axes")}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
            canContinue
              ? "bg-ink text-white hover:bg-ink/90 shadow-paper"
              : "bg-muted-soft text-muted cursor-not-allowed",
          )}
        >
          Siguiente
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 7h8m0 0L7 3m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
