"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

// Ejemplo estático: argumentario pre-generado sobre un tema reconocible.
// Sirve como muestra del output de la app sin necesidad de que el usuario
// configure nada.
const EXAMPLE = {
  tema: "Salario mínimo",
  postura: "Intervencionista · Social progresista",
  titulo: "Subir el salario mínimo: justicia social, no capricho",
  gancho:
    "Cuando el trabajo a jornada completa no basta para pagar un alquiler, algo falla en el sistema. Subir el salario mínimo no es populismo: es devolver la dignidad al empleo.",
  argumentos: [
    {
      subtitulo: "Un suelo salarial reduce la pobreza trabajadora",
      desarrollo:
        "Diversos estudios muestran que un salario mínimo actualizado saca de la pobreza a familias enteras sin destruir empleo de forma significativa.",
    },
    {
      subtitulo: "El consumo interno se reactiva desde abajo",
      desarrollo:
        "Las rentas más bajas gastan cada euro que entra. Subir sus ingresos dinamiza el comercio local mucho más que bajar impuestos a los más ricos.",
    },
  ],
  cierre:
    "¿Queremos una economía que crezca sobre sueldos precarios, o una que reparta lo que genera? La respuesta dice mucho del país que somos.",
};

export function ExampleModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Bloquear scroll del body
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="example-title"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-paper border border-muted-soft">
        <header className="sticky top-0 bg-white border-b border-muted-soft px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
              Ejemplo de argumentario
            </p>
            <p className="text-xs text-muted mt-0.5">
              Así es el resultado que genera Aurora con una configuración concreta
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 text-muted hover:text-ink rounded-full"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="p-6 sm:p-8">
          <p id="example-title" className="text-xs uppercase tracking-widest text-accent">
            {EXAMPLE.tema}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-muted bg-muted-softer px-2 py-0.5 rounded-full">
              Postura: {EXAMPLE.postura}
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl leading-tight text-ink mt-5">
            {EXAMPLE.titulo}
          </h2>

          <div className="aurora-prose mt-5 max-w-reading text-ink">
            <p>{EXAMPLE.gancho}</p>
            {EXAMPLE.argumentos.map((arg, i) => (
              <div key={i} className="mt-5">
                <h3 className="font-serif text-xl text-ink">{arg.subtitulo}</h3>
                <p className="mt-1">{arg.desarrollo}</p>
              </div>
            ))}
            <p className="mt-6 italic text-ink/90">{EXAMPLE.cierre}</p>
          </div>

          <div className="mt-8 p-4 bg-muted-softer rounded-lg border border-muted-soft">
            <p className="text-xs text-muted leading-relaxed">
              <strong className="text-ink">¿Qué verías al generar el tuyo?</strong>{" "}
              Además del texto, herramientas para adivinar la postura ideológica del
              texto, detectar sesgos, comparar con la postura opuesta y exportar a PDF.
            </p>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-white border-t border-muted-soft px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-ink"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
