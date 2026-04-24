"use client";

import { useAurora } from "@/lib/store";
import { TopicSelector } from "@/components/TopicSelector";
import { AxesConfigurator } from "@/components/AxesConfigurator";
import { ResultView } from "@/components/ResultView";
import { Brand } from "@/components/Brand";
import { GeneratingLoader } from "@/components/GeneratingLoader";

type StepKey = "topic" | "axes" | "result";

export default function GeneratorPage() {
  const { step, isGenerating, topicId, subtopicId, history, setStep } = useAurora();

  // Reglas de "paso accesible":
  //  - "topic" siempre clicable
  //  - "axes" si hay tema+subtema
  //  - "result" si hay historial
  function canGoTo(s: StepKey): boolean {
    if (s === "topic") return true;
    if (s === "axes") return !!topicId && !!subtopicId;
    if (s === "result") return history.length > 0;
    return false;
  }

  function handleStepClick(s: StepKey) {
    if (!canGoTo(s) || isGenerating) return;
    setStep(s);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
      <nav className="mb-12 flex items-center justify-between gap-6 print:hidden">
        <Brand size="md" />
        <StepIndicator current={step} onNavigate={handleStepClick} canGoTo={canGoTo} />
      </nav>

      {isGenerating ? (
        <GeneratingLoader />
      ) : (
        <>
          {step === "topic" && <TopicSelector />}
          {step === "axes" && <AxesConfigurator />}
          {step === "result" && <ResultView />}
        </>
      )}
    </main>
  );
}

function StepIndicator({
  current,
  onNavigate,
  canGoTo,
}: {
  current: StepKey;
  onNavigate: (s: StepKey) => void;
  canGoTo: (s: StepKey) => boolean;
}) {
  const steps: Array<{ key: StepKey; label: string }> = [
    { key: "topic", label: "Tema" },
    { key: "axes", label: "Postura" },
    { key: "result", label: "Resultado" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <>
      {/* Versión desktop */}
      <ol className="hidden sm:flex items-center gap-1 text-xs text-muted">
        {steps.map((s, i) => {
          const active = s.key === current;
          const reachable = canGoTo(s.key) && !active;
          return (
            <li key={s.key} className="flex items-center gap-1">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onNavigate(s.key)}
                className={
                  active
                    ? "text-ink font-medium"
                    : reachable
                      ? "text-muted hover:text-ink hover:underline underline-offset-2"
                      : "text-muted/60 cursor-not-allowed"
                }
              >
                {i + 1}. {s.label}
              </button>
              {i < steps.length - 1 && <span className="px-1 text-muted">›</span>}
            </li>
          );
        })}
      </ol>

      {/* Versión móvil: compacta pero visible */}
      <div className="sm:hidden flex items-center gap-2 text-[11px] text-muted">
        <span className="font-medium text-ink tabular-nums">
          {currentIdx + 1}/3
        </span>
        <span className="h-1 w-16 bg-muted-softer rounded-full overflow-hidden">
          <span
            className="block h-full bg-accent transition-all"
            style={{ width: `${((currentIdx + 1) / 3) * 100}%` }}
          />
        </span>
        <span className="text-ink font-medium">
          {steps[currentIdx]?.label}
        </span>
      </div>
    </>
  );
}
