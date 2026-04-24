"use client";

import { create } from "zustand";
import type { ActiveAxis, AxisValue, GenerationResult } from "@/types";

export type Step = "topic" | "axes" | "result";

type AxisState = {
  enabled: boolean;
  value: AxisValue;
};

type AuroraState = {
  step: Step;
  topicId: string | null;
  subtopicId: string | null;
  axes: Record<string, AxisState>;
  history: GenerationResult[];
  isGenerating: boolean;
  error: string | null;

  setStep: (s: Step) => void;
  selectSubtopic: (topicId: string, subtopicId: string) => void;
  toggleAxis: (axisId: string) => void;
  setAxisValue: (axisId: string, value: AxisValue) => void;
  activeAxes: () => ActiveAxis[];
  generate: () => Promise<void>;
  resetAll: () => void;
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

export const useAurora = create<AuroraState>((set, get) => ({
  step: "topic",
  topicId: null,
  subtopicId: null,
  axes: initialAxes(),
  history: [],
  isGenerating: false,
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
      set({ error: "Activa al menos un eje ideológico para generar un argumentario." });
      return;
    }
    set({ isGenerating: true, error: null });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, subtopicId, activeAxes: active }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Error al generar el argumentario.");
      }
      const entry: GenerationResult = {
        ...data.argumentary,
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
      }));
    } catch (err) {
      set({
        isGenerating: false,
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
    }),

  backToAxes: () => set({ step: "axes", error: null }),

  clearError: () => set({ error: null }),
}));
