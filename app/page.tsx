"use client";

import Link from "next/link";
import { useState } from "react";
import { HowItWorksModal } from "@/components/HowItWorksModal";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <main className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-[320px] w-[320px] rounded-full bg-accent-contrast/10 blur-3xl"
      />

      <div className="relative max-w-3xl mx-auto px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-muted-soft bg-white/70 backdrop-blur text-[11px] font-medium uppercase tracking-[0.18em] text-muted mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Proyecto Aurora · v1
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl leading-[1.02] text-ink tracking-tight">
          Un mismo tema,
          <br />
          <span className="italic text-accent">distintas miradas.</span>
        </h1>

        <p className="mt-8 text-lg text-ink/75 max-w-2xl leading-relaxed">
          Aurora te permite explorar cómo un mismo tema puede argumentarse desde
          distintas corrientes ideológicas. No para convencerte de nada, sino para
          que aprendas a reconocer los distintos marcos de pensamiento que hay
          detrás de cada discurso y fomentar tu pensamiento crítico.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/generator"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ink text-white font-medium hover:bg-ink/90 transition-all shadow-paper"
          >
            Empezar
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M3 8h10m0 0L8 3m5 5l-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-muted-soft bg-white/60 backdrop-blur text-sm text-ink hover:border-ink/40 transition-colors"
          >
            ¿Cómo funciona?
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          {[
            { n: "6", label: "Ejes ideológicos independientes" },
            { n: "17", label: "Subtemas de actualidad" },
            { n: "∞", label: "Perspectivas contrastables" },
          ].map((stat) => (
            <div key={stat.label} className="border-t border-muted-soft pt-4">
              <div className="font-serif text-3xl text-ink">{stat.n}</div>
              <div className="text-xs text-muted mt-1 leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-14 text-xs text-muted max-w-xl leading-relaxed">
          Pensado para uso en aula (ESO, Bachillerato, universidad). Un ejercicio
          dialéctico para fomentar el pensamiento crítico mediante el contraste de
          perspectivas.
        </p>
      </div>

      <HowItWorksModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
