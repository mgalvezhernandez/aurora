"use client";

import { useAurora } from "@/lib/store";
import { ComparisonView } from "./ComparisonView";

export function ResultView() {
  const { history, backToAxes, resetAll } = useAurora();

  if (history.length === 0) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">Paso 3 de 3</p>
        <h2 className="font-serif text-3xl text-ink">
          {history.length === 1 ? "Tu argumentario" : "Compara las perspectivas"}
        </h2>
        {history.length === 1 && (
          <p className="text-muted text-sm max-w-reading">
            Este texto no refleja &quot;la verdad&quot; ni &quot;una opinión de Aurora&quot;.
            Es un ejercicio: así se argumentaría este tema desde la postura que has
            seleccionado. Prueba ahora otra combinación de ejes y compara.
          </p>
        )}
      </header>

      <ComparisonView results={history} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-muted-soft pt-6">
        <button
          type="button"
          onClick={() => copyCurrent(history[0])}
          className="text-sm text-muted hover:text-ink"
        >
          Copiar texto
        </button>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={backToAxes}
            className="px-4 py-2.5 text-sm rounded-md bg-accent text-white hover:bg-accent/90"
          >
            Ver desde otra perspectiva
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2.5 text-sm rounded-md border border-muted-soft text-ink hover:bg-muted-softer"
          >
            Nuevo tema
          </button>
        </div>
      </div>
    </div>
  );
}

function copyCurrent(r: import("@/types").GenerationResult) {
  const text = [
    r.titulo,
    "",
    r.gancho,
    "",
    ...r.argumentos.map((a) => `${a.subtitulo}\n${a.desarrollo}`),
    "",
    r.cierre,
    "",
    "Preguntas para el aula:",
    ...r.preguntas_aula.map((q, i) => `${i + 1}. ${q}`),
  ].join("\n");
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}
