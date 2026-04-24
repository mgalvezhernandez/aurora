"use client";

import { useRef, useState, useEffect } from "react";
import { useAurora } from "@/lib/store";
import { ComparisonView } from "./ComparisonView";
import { GuessPanel } from "./GuessPanel";
import { BiasPanel } from "./BiasPanel";
import type { GenerationResult } from "@/types";

export function ResultView() {
  const {
    history,
    backToAxes,
    resetAll,
    clearHistory,
    generateContrapunto,
    isGenerating,
  } = useAurora();

  const [showGuess, setShowGuess] = useState(false);
  const [utilsOpen, setUtilsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const utilsRef = useRef<HTMLDivElement | null>(null);

  // Cerrar menú "utilidades" al hacer click fuera
  useEffect(() => {
    if (!utilsOpen) return;
    function onDoc(e: MouseEvent) {
      if (utilsRef.current && !utilsRef.current.contains(e.target as Node)) {
        setUtilsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [utilsOpen]);

  if (history.length === 0) return null;

  const latest = history[0];

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleCopy = () => {
    copyCurrent(latest);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const textoArgumentario = buildTexto(latest);

  return (
    <div className="space-y-6">
      <header className="space-y-2 print:hidden">
        <p className="text-xs uppercase tracking-widest text-muted">Paso 3 de 3</p>
        <h2 className="font-serif text-3xl text-ink">
          {history.length === 1 ? "Tu argumentario" : "Compara las perspectivas"}
        </h2>
        {history.length === 1 && (
          <p className="text-muted text-sm max-w-reading">
            Así se argumenta este tema desde la postura que elegiste. Prueba otra
            combinación y compara.
          </p>
        )}
      </header>

      <ComparisonView results={history} />

      {/* Reto crítico: Adivina la postura + Análisis de sesgos */}
      <div className="rounded-xl border border-muted-soft bg-white shadow-paper p-5 sm:p-6 space-y-2 print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden className="text-accent">
              <path d="M5.5 1.5l1.2 2.5 2.8.3-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.3z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
            </svg>
          </span>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink font-medium">
            Reto crítico
          </p>
        </div>

        {/* Adivina la postura */}
        {!showGuess ? (
          <button
            type="button"
            onClick={() => setShowGuess(true)}
            className="flex items-center gap-2 text-sm text-ink hover:text-accent transition-colors group"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <circle cx="6.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6.5 9v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M4 8.5c0 0 .8 1 2.5 1s2.5-1 2.5-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            Adivina la postura ideológica del texto
          </button>
        ) : (
          <GuessPanel
            realAxes={latest.activeAxes}
            onClose={() => setShowGuess(false)}
          />
        )}

        {/* Análisis de sesgos */}
        <BiasPanel texto={textoArgumentario} />
      </div>

      {/* Acciones principales */}
      <div className="border-t border-muted-soft pt-6 print:hidden space-y-4">
        {/* Fila primaria: acción pedagógica clave + navegación */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={backToAxes}
            disabled={isGenerating}
            className="px-4 py-2.5 text-sm rounded-md border border-muted-soft text-ink hover:bg-muted-softer disabled:opacity-50"
          >
            Cambiar ejes
          </button>
          <button
            type="button"
            onClick={resetAll}
            disabled={isGenerating}
            className="px-4 py-2.5 text-sm rounded-md border border-muted-soft text-ink hover:bg-muted-softer disabled:opacity-50"
          >
            Nuevo tema
          </button>
          <button
            type="button"
            onClick={generateContrapunto}
            disabled={isGenerating}
            className="px-5 py-2.5 text-sm rounded-md bg-accent-contrast text-white hover:bg-accent-contrast/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 font-medium"
            title="Genera automáticamente el argumentario desde la postura opuesta"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 5h8m0 0L7 2m3 3l-3 3M12 9H4m0 0l3 3m-3-3l3-3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isGenerating ? "Generando..." : "Ver el contrapunto"}
          </button>
        </div>

        {/* Fila de utilidades: menos destacada, agrupada en un menú */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative" ref={utilsRef}>
            <button
              type="button"
              onClick={() => setUtilsOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
              aria-expanded={utilsOpen}
              aria-haspopup="menu"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx="3" cy="7" r="1.2" fill="currentColor" />
                <circle cx="7" cy="7" r="1.2" fill="currentColor" />
                <circle cx="11" cy="7" r="1.2" fill="currentColor" />
              </svg>
              Más opciones
            </button>
            {utilsOpen && (
              <div
                role="menu"
                className="absolute bottom-full mb-2 left-0 min-w-[180px] rounded-lg border border-muted-soft bg-white shadow-paper py-1 z-10"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handleCopy();
                    setUtilsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-muted-softer"
                >
                  {copied ? "¡Copiado!" : "Copiar texto"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handlePrint();
                    setUtilsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-muted-softer"
                >
                  Descargar PDF
                </button>
                <div className="my-1 border-t border-muted-soft" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (confirm("¿Borrar todo el historial de argumentarios guardados?")) {
                      clearHistory();
                      setUtilsOpen(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-accent-contrast hover:bg-accent-contrast/5"
                >
                  Limpiar historial
                </button>
              </div>
            )}
          </div>

          {copied && (
            <span className="text-xs text-accent animate-[fadeIn_0.3s]">
              Texto copiado al portapapeles
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function buildTexto(r: GenerationResult): string {
  return [
    r.titulo,
    r.gancho,
    ...r.argumentos.map((a) => `${a.subtitulo}: ${a.desarrollo}`),
    r.cierre,
  ].join("\n\n");
}

function copyCurrent(r: GenerationResult) {
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
