"use client";

import { useState } from "react";
import type { GenerationResult } from "@/types";
import { ArgumentaryCard } from "./ArgumentaryCard";

type Props = {
  results: GenerationResult[];
};

export function ComparisonView({ results }: Props) {
  const [mobileIdx, setMobileIdx] = useState(0);

  if (results.length === 0) return null;

  if (results.length === 1) {
    return (
      <div>
        <ArgumentaryCard result={results[0]} />
      </div>
    );
  }

  const [latest, previous, ...rest] = results;

  return (
    <div className="space-y-8">
      <div className="hidden md:grid grid-cols-2 gap-6 items-start">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            Argumentario actual
          </p>
          <ArgumentaryCard result={latest} compact accent="primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-accent-contrast mb-2">
            Anterior
          </p>
          <ArgumentaryCard result={previous} compact accent="contrast" />
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex gap-2 mb-3">
          {[latest, previous].map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setMobileIdx(i)}
              className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                mobileIdx === i
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-muted border-muted-soft"
              }`}
            >
              {i === 0 ? "Actual" : "Anterior"}
            </button>
          ))}
        </div>
        <ArgumentaryCard
          result={mobileIdx === 0 ? latest : previous}
          accent={mobileIdx === 0 ? "primary" : "contrast"}
        />
      </div>

      {rest.length > 0 && (
        <section>
          <h3 className="font-serif text-xl text-ink mb-4">Historial de esta sesión</h3>
          <div className="space-y-4">
            {rest.map((r) => (
              <details
                key={r.id}
                className="rounded-lg border border-muted-soft bg-white p-4"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="font-serif text-lg text-ink">{r.titulo}</span>
                  <span className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </summary>
                <div className="mt-4">
                  <ArgumentaryCard result={r} compact />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
