"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HowItWorksModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white max-w-lg w-full rounded-xl shadow-paper border border-muted-soft p-7">
        <h2 id="howto-title" className="font-serif text-2xl text-ink">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-5 space-y-4 text-ink">
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center">
              1
            </span>
            <p>
              <span className="font-medium">Elige un tema.</span> Selecciona una categoría y un subtema concreto del catálogo.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center">
              2
            </span>
            <p>
              <span className="font-medium">Configura tu postura.</span> Activa los ejes ideológicos que quieras (mínimo uno) y ajusta el valor de cada uno entre 1 y 5.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center">
              3
            </span>
            <p>
              <span className="font-medium">Genera y contrasta.</span> La IA construye un argumentario coherente con tu postura. Después cambia los ejes y compara: verás cómo el mismo tema puede defenderse desde marcos muy distintos.
            </p>
          </li>
        </ol>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-ink text-white hover:bg-ink/90"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
