"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  children: React.ReactNode;
};

type Pos = { top: number; left: number; width: number };

export function InfoTooltip({ label, children }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const id = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    function update() {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const viewport = window.innerWidth;
      const width = Math.min(300, viewport - 24);
      let left = r.left;
      if (left + width > viewport - 12) left = Math.max(12, viewport - width - 12);
      setPos({ top: r.bottom + 8, left, width });
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (tipRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Información: ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border border-muted/50 text-[11px] font-semibold text-muted hover:border-accent hover:text-accent transition-colors align-middle",
        )}
      >
        i
      </button>
      {mounted && open && pos &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              backgroundColor: "#ffffff",
              zIndex: 1000,
            }}
            className="rounded-lg border border-ink/15 p-3.5 text-sm leading-relaxed text-ink shadow-[0_12px_30px_-6px_rgba(0,0,0,0.22),0_3px_8px_rgba(0,0,0,0.08)]"
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
