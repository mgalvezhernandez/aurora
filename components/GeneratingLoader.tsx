"use client";

import { useEffect, useRef, useState } from "react";

// Tiempo estimado de generación (según logs ~20s). La barra llega al 95%
// en este tiempo; el último 5% se reserva para cuando llegue la respuesta real.
const ESTIMATED_MS = 22000;

const MESSAGES = [
  "Leyendo tu postura ideológica…",
  "Analizando el tema elegido…",
  "Buscando el mejor ángulo argumental…",
  "Redactando con honestidad intelectual…",
  "Afinando los detalles finales…",
];

export function GeneratingLoader() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());

  // Progreso simulado con curva "aspirante" (nunca llega al 100% hasta recibir el final real)
  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      const el = Date.now() - startRef.current;
      setElapsed(el);
      // Curva exponencial invertida: sube rápido al principio, se ralentiza hacia el 95%
      const ratio = Math.min(1, el / ESTIMATED_MS);
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      setProgress(Math.min(95, Math.round(eased * 95)));
    }, 200);
    return () => clearInterval(id);
  }, []);

  // Rotación de mensajes
  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const seconds = Math.floor(elapsed / 1000);

  return (
    <div className="relative rounded-xl border border-muted-soft bg-white p-8 sm:p-12 shadow-paper overflow-hidden">
      {/* Shimmer sutil de fondo */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent pointer-events-none animate-[shimmer_3s_ease-in-out_infinite]"
        style={{ backgroundSize: "200% 100%" }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Círculo de progreso central */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 64 64"
            aria-hidden
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-muted-soft"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="text-accent transition-all duration-300"
              style={{
                strokeDasharray: 2 * Math.PI * 28,
                strokeDashoffset:
                  2 * Math.PI * 28 - (2 * Math.PI * 28 * progress) / 100,
              }}
            />
          </svg>
          <span className="relative text-xs font-semibold text-accent tabular-nums">
            {progress}%
          </span>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
          Generando
        </p>

        {/* Mensaje rotatorio con transición suave */}
        <h3
          key={messageIndex}
          className="mt-3 font-serif text-xl sm:text-2xl text-ink leading-tight animate-[fadeIn_0.6s_ease-out]"
        >
          {MESSAGES[messageIndex]}
        </h3>

        {/* Barra de progreso lineal */}
        <div className="mt-6 w-full max-w-sm">
          <div className="h-1 bg-muted-softer rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted tabular-nums">
            {seconds}s · tiempo estimado 15-30s
          </p>
        </div>

        <p className="mt-8 text-xs text-muted max-w-md leading-relaxed">
          Se está construyendo un argumentario coherente, honesto y riguroso desde
          la postura que has seleccionado.
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
