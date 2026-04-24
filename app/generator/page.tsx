"use client";

import { useAurora } from "@/lib/store";
import { TopicSelector } from "@/components/TopicSelector";
import { AxesConfigurator } from "@/components/AxesConfigurator";
import { ResultView } from "@/components/ResultView";
import { Brand } from "@/components/Brand";

export default function GeneratorPage() {
  const { step } = useAurora();

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
      <nav className="mb-12 flex items-center justify-between gap-6">
        <Brand size="md" />
        <StepIndicator current={step} />
      </nav>

      {step === "topic" && <TopicSelector />}
      {step === "axes" && <AxesConfigurator />}
      {step === "result" && <ResultView />}
    </main>
  );
}

function StepIndicator({ current }: { current: "topic" | "axes" | "result" }) {
  const steps: Array<{ key: "topic" | "axes" | "result"; label: string }> = [
    { key: "topic", label: "Tema" },
    { key: "axes", label: "Ejes" },
    { key: "result", label: "Argumentario" },
  ];
  return (
    <ol className="hidden sm:flex items-center gap-1 text-xs text-muted">
      {steps.map((s, i) => {
        const active = s.key === current;
        return (
          <li key={s.key} className="flex items-center gap-1">
            <span
              className={
                active ? "text-ink font-medium" : "text-muted"
              }
            >
              {i + 1}. {s.label}
            </span>
            {i < steps.length - 1 && <span className="px-1 text-muted">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
