import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
};

const SIZES = {
  sm: { title: "text-2xl", sub: "text-[10px]" },
  md: { title: "text-3xl sm:text-[2rem]", sub: "text-[11px]" },
  lg: { title: "text-5xl sm:text-6xl", sub: "text-xs" },
};

export function Brand({ size = "md", href = "/", className }: Props) {
  const s = SIZES[size];
  const content = (
    <span className={cn("inline-flex flex-col leading-none select-none", className)}>
      <span className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-serif italic tracking-tight text-ink",
            s.title,
          )}
        >
          Aurora
        </span>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-accent translate-y-[-0.15em]"
        />
      </span>
      <span
        className={cn(
          "mt-1.5 uppercase tracking-[0.22em] font-medium text-muted",
          s.sub,
        )}
      >
        Pensamiento crítico en ejercicio
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="group inline-block transition-opacity hover:opacity-80"
      aria-label="Ir al inicio de Aurora"
    >
      {content}
    </Link>
  );
}
