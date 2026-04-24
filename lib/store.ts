"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActiveAxis, AxisValue, GenerationResult } from "@/types";

export type Step = "topic" | "axes" | "result";

type AxisState = {
  enabled: boolean;
  value: AxisValue;
};

/**
 * Fases narradas mostradas al usuario durante el streaming.
 * Se detectan inspeccionando el texto acumulado recibido de Claude.
 */
export type StreamPhase =
  | "conectando"
  | "titulo"
  | "gancho"
  | "argumentos"
  | "cierre"
  | "preguntas"
  | "referencias"
  | "finalizando";

export const STREAM_PHASE_LABELS: Record<StreamPhase, string> = {
  conectando: "Conectando con el modelo…",
  titulo: "Definiendo el título…",
  gancho: "Redactando el gancho inicial…",
  argumentos: "Construyendo los argumentos…",
  cierre: "Cerrando con reflexión…",
  preguntas: "Preparando preguntas para el aula…",
  referencias: "Buscando referencias culturales…",
  finalizando: "Afinando detalles finales…",
};

function detectPhase(accumulated: string): StreamPhase {
  // Ir detectando fases conforme aparecen las claves en el JSON
  if (accumulated.includes('"referencias_culturales"')) {
    // Si las referencias ya están llegando pero aún no se cierra
    if (accumulated.trim().endsWith("}")) return "finalizando";
    return "referencias";
  }
  if (accumulated.includes('"preguntas_aula"')) return "preguntas";
  if (accumulated.includes('"cierre"')) return "cierre";
  if (accumulated.includes('"argumentos"')) return "argumentos";
  if (accumulated.includes('"gancho"')) return "gancho";
  if (accumulated.includes('"titulo"')) return "titulo";
  return "conectando";
}

type AuroraState = {
  step: Step;
  topicId: string | null;
  subtopicId: string | null;
  axes: Record<string, AxisState>;
  history: GenerationResult[];
  isGenerating: boolean;
  streamPhase: StreamPhase | null;
  streamTokens: number;
  error: string | null;

  setStep: (s: Step) => void;
  selectSubtopic: (topicId: string, subtopicId: string) => void;
  toggleAxis: (axisId: string) => void;
  setAxisValue: (axisId: string, value: AxisValue) => void;
  /** Aplica un preset: activa los ejes indicados con sus valores y desactiva el resto. */
  applyAxisPreset: (activeValues: Record<string, AxisValue>) => void;
  activeAxes: () => ActiveAxis[];
  generate: () => Promise<void>;
  generateContrapunto: () => Promise<void>;
  resetAll: () => void;
  clearHistory: () => void;
  backToAxes: () => void;
  clearError: () => void;
};

const DEFAULT_AXIS_IDS = [
  "economico",
  "social",
  "identidad",
  "medioambiental",
  "autoridad",
  "sistema",
];

function initialAxes(): Record<string, AxisState> {
  const out: Record<string, AxisState> = {};
  for (const id of DEFAULT_AXIS_IDS) {
    out[id] = { enabled: false, value: 3 };
  }
  return out;
}

function invertValue(value: AxisValue): AxisValue {
  return (6 - value) as AxisValue;
}

/**
 * Lee un stream SSE desde /api/generate?stream=1
 * Llama a onPhase cuando detecta una nueva fase y onFinal con el resultado.
 */
async function consumeGenerateStream(
  body: {
    topicId: string;
    subtopicId: string;
    activeAxes: ActiveAxis[];
  },
  callbacks: {
    onPhase: (phase: StreamPhase, tokens: number) => void;
    onFinal: (ok: boolean, argumentary?: unknown, error?: string) => void;
  },
) {
  const res = await fetch("/api/generate?stream=1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Puede venir como JSON error (validación fallida)
    try {
      const data = await res.json();
      callbacks.onFinal(false, undefined, data?.error || `Error ${res.status}`);
    } catch {
      callbacks.onFinal(false, undefined, `Error HTTP ${res.status}`);
    }
    return;
  }

  if (!res.body) {
    callbacks.onFinal(false, undefined, "Sin respuesta del servidor.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  let lastPhase: StreamPhase = "conectando";
  callbacks.onPhase("conectando", 0);

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Procesar eventos SSE (delimitados por doble salto de línea)
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      if (event === "token") {
        const p = parsed as { chunk: string; total: number };
        accumulated += p.chunk;
        const phase = detectPhase(accumulated);
        if (phase !== lastPhase) {
          lastPhase = phase;
          callbacks.onPhase(phase, accumulated.length);
        } else {
          // Actualizar contador sin cambio de fase
          callbacks.onPhase(phase, accumulated.length);
        }
      } else if (event === "final") {
        const p = parsed as
          | { ok: true; argumentary: unknown }
          | { ok: false; error: string };
        if (p.ok) {
          callbacks.onFinal(true, p.argumentary);
        } else {
          callbacks.onFinal(false, undefined, p.error);
        }
        return;
      }
    }
  }
}

export const useAurora = create<AuroraState>()(
  persist(
    (set, get) => ({
      step: "topic",
      topicId: null,
      subtopicId: null,
      axes: initialAxes(),
      history: [],
      isGenerating: false,
      streamPhase: null,
      streamTokens: 0,
      error: null,

      setStep: (s) => set({ step: s }),

      selectSubtopic: (topicId, subtopicId) => set({ topicId, subtopicId }),

      toggleAxis: (axisId) =>
        set((state) => {
          const curr = state.axes[axisId] ?? { enabled: false, value: 3 };
          return {
            axes: {
              ...state.axes,
              [axisId]: { ...curr, enabled: !curr.enabled },
            },
          };
        }),

      setAxisValue: (axisId, value) =>
        set((state) => {
          const curr = state.axes[axisId] ?? { enabled: false, value: 3 };
          return {
            axes: {
              ...state.axes,
              [axisId]: { ...curr, value },
            },
          };
        }),

      applyAxisPreset: (activeValues) =>
        set(() => {
          const next: Record<string, AxisState> = {};
          for (const id of DEFAULT_AXIS_IDS) {
            const preset = activeValues[id];
            if (preset !== undefined) {
              next[id] = { enabled: true, value: preset };
            } else {
              next[id] = { enabled: false, value: 3 };
            }
          }
          return { axes: next, error: null };
        }),

      activeAxes: () => {
        const { axes } = get();
        return Object.entries(axes)
          .filter(([, v]) => v.enabled)
          .map(([id, v]) => ({ id, value: v.value }));
      },

      generate: async () => {
        const { topicId, subtopicId, activeAxes } = get();
        const active = activeAxes();
        if (!topicId || !subtopicId) {
          set({ error: "Selecciona un subtema antes de generar." });
          return;
        }
        if (active.length === 0) {
          set({
            error: "Activa al menos un eje ideológico para generar un argumentario.",
          });
          return;
        }
        set({
          isGenerating: true,
          error: null,
          streamPhase: "conectando",
          streamTokens: 0,
        });
        try {
          await consumeGenerateStream(
            { topicId, subtopicId, activeAxes: active },
            {
              onPhase: (phase, tokens) =>
                set({ streamPhase: phase, streamTokens: tokens }),
              onFinal: (ok, argumentary, error) => {
                if (!ok || !argumentary) {
                  set({
                    isGenerating: false,
                    streamPhase: null,
                    streamTokens: 0,
                    error: error || "Error al generar el argumentario.",
                  });
                  return;
                }
                const arg = argumentary as Omit<
                  GenerationResult,
                  "id" | "createdAt" | "topicId" | "subtopicId" | "activeAxes"
                >;
                const entry: GenerationResult = {
                  ...arg,
                  id:
                    typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : `${Date.now()}-${Math.random()}`,
                  createdAt: Date.now(),
                  topicId,
                  subtopicId,
                  activeAxes: active,
                };
                set((state) => ({
                  history: [entry, ...state.history],
                  step: "result",
                  isGenerating: false,
                  streamPhase: null,
                  streamTokens: 0,
                }));
              },
            },
          );
        } catch (err) {
          set({
            isGenerating: false,
            streamPhase: null,
            streamTokens: 0,
            error: err instanceof Error ? err.message : "Error desconocido.",
          });
        }
      },

      generateContrapunto: async () => {
        const { topicId, subtopicId, axes } = get();
        if (!topicId || !subtopicId) {
          set({ error: "No hay tema seleccionado para el contrapunto." });
          return;
        }
        const invertedAxes: Record<string, AxisState> = {};
        for (const [id, state] of Object.entries(axes)) {
          invertedAxes[id] = {
            enabled: state.enabled,
            value: invertValue(state.value),
          };
        }
        const invertedActive: ActiveAxis[] = Object.entries(invertedAxes)
          .filter(([, v]) => v.enabled)
          .map(([id, v]) => ({ id, value: v.value }));

        if (invertedActive.length === 0) {
          set({ error: "No hay ejes activos para generar un contrapunto." });
          return;
        }

        set({
          axes: invertedAxes,
          isGenerating: true,
          error: null,
          streamPhase: "conectando",
          streamTokens: 0,
        });
        try {
          await consumeGenerateStream(
            { topicId, subtopicId, activeAxes: invertedActive },
            {
              onPhase: (phase, tokens) =>
                set({ streamPhase: phase, streamTokens: tokens }),
              onFinal: (ok, argumentary, error) => {
                if (!ok || !argumentary) {
                  set({
                    isGenerating: false,
                    streamPhase: null,
                    streamTokens: 0,
                    error: error || "Error al generar el contrapunto.",
                  });
                  return;
                }
                const arg = argumentary as Omit<
                  GenerationResult,
                  "id" | "createdAt" | "topicId" | "subtopicId" | "activeAxes"
                >;
                const entry: GenerationResult = {
                  ...arg,
                  id:
                    typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : `${Date.now()}-${Math.random()}`,
                  createdAt: Date.now(),
                  topicId,
                  subtopicId,
                  activeAxes: invertedActive,
                };
                set((state) => ({
                  history: [entry, ...state.history],
                  step: "result",
                  isGenerating: false,
                  streamPhase: null,
                  streamTokens: 0,
                }));
              },
            },
          );
        } catch (err) {
          set({
            isGenerating: false,
            streamPhase: null,
            streamTokens: 0,
            error: err instanceof Error ? err.message : "Error desconocido.",
          });
        }
      },

      resetAll: () =>
        set({
          step: "topic",
          topicId: null,
          subtopicId: null,
          axes: initialAxes(),
          history: [],
          error: null,
          isGenerating: false,
          streamPhase: null,
          streamTokens: 0,
        }),

      clearHistory: () => set({ history: [] }),

      backToAxes: () => set({ step: "axes", error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "aurora-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
);
