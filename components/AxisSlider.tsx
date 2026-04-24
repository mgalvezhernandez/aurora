"use client";

import { useId } from "react";
import type { Axis, AxisValue } from "@/types";
import { InfoTooltip } from "./InfoTooltip";
import { cn } from "@/lib/utils";

type Props = {
  axis: Axis;
  value: AxisValue;
  enabled: boolean;
  onToggle: () => void;
  onChange: (v: AxisValue) => void;
};

export function AxisSlider({ axis, value, enabled, onToggle, onChange }: Props) {
  const sliderId = useId();
  const toggleId = useId();

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-5 transition-opacity",
        enabled ? "border-muted-soft" : "border-muted-soft opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg text-ink">
            Eje {axis.name}
          </h3>
          <InfoTooltip label={`Eje ${axis.name}`}>{axis.tooltip}</InfoTooltip>
        </div>

        <label
          htmlFor={toggleId}
          className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none"
        >
          <span>{enabled ? "Activo" : "Inactivo"}</span>
          <span
            className={cn(
              "relative inline-block h-5 w-9 rounded-full transition-colors",
              enabled ? "bg-accent" : "bg-muted-soft",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                enabled && "translate-x-4",
              )}
            />
          </span>
          <input
            id={toggleId}
            type="checkbox"
            className="sr-only"
            checked={enabled}
            onChange={onToggle}
            aria-label={`Activar eje ${axis.name}`}
          />
        </label>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted mb-2">
          <span className="max-w-[40%]">
            <span className="font-medium text-ink">1 ·</span> {axis.extreme1}
          </span>
          <span className="max-w-[40%] text-right">
            {axis.extreme5} <span className="font-medium text-ink">· 5</span>
          </span>
        </div>

        <input
          id={sliderId}
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          disabled={!enabled}
          onChange={(e) => onChange(Number(e.target.value) as AxisValue)}
          aria-label={`Valor del eje ${axis.name}`}
          aria-valuetext={`Nivel ${value} de 5`}
          className="aurora-range"
        />

        <div className="flex justify-between mt-2 text-[11px] text-muted">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={cn(
                "w-5 text-center",
                enabled && value === n && "text-accent font-semibold",
              )}
            >
              {n}
            </span>
          ))}
        </div>

        {enabled && (
          <p className="text-sm text-muted mt-3">
            Valor actual: <span className="font-medium text-ink">{value}</span>
          </p>
        )}
      </div>
    </div>
  );
}
