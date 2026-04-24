import type { ReferenciaCultural } from "@/types";

type Props = {
  references: ReferenciaCultural[];
};

const TIPO_LABEL: Record<ReferenciaCultural["tipo"], string> = {
  pelicula: "Película",
  serie: "Serie",
  documental: "Documental",
};

export function CulturalReferences({ references }: Props) {
  if (!references || references.length === 0) return null;

  return (
    <section
      aria-label="El argumento en la ficción"
      className="relative -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 overflow-hidden rounded-b-xl"
      style={{
        backgroundColor: "#111111",
        color: "#F3EFE6",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, #D4A857 0, transparent 40%), radial-gradient(circle at 80% 90%, #8C4A2F 0, transparent 45%)",
        }}
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#D4A857]">
          <FilmStrip />
          <span>El argumento en la ficción</span>
        </div>

        <h3 className="mt-3 font-serif text-2xl sm:text-3xl tracking-tight text-[#F3EFE6]">
          Cómo lo cuenta <span className="italic">el cine y las series</span>
        </h3>

        <p className="mt-2 text-sm text-[#F3EFE6]/60 max-w-xl leading-relaxed">
          Fragmentos literales de obras audiovisuales donde este tema se trata
          desde esta misma postura.
        </p>

        <ul className="mt-8 space-y-7">
          {references.map((r, i) => (
            <li
              key={`${r.titulo}-${i}`}
              className="border-t border-[#F3EFE6]/10 pt-6 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold"
                  style={{ color: "#D4A857" }}
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ backgroundColor: "#D4A857" }}
                    aria-hidden
                  />
                  {TIPO_LABEL[r.tipo]}
                </span>
                <span className="text-[11px] text-[#F3EFE6]/50">·</span>
                <span className="text-[11px] text-[#F3EFE6]/60 tabular-nums">
                  {r.anio}
                </span>
              </div>

              <p className="mt-1.5 font-serif italic text-xl sm:text-2xl tracking-tight text-[#F3EFE6]">
                {r.titulo}
              </p>

              <blockquote
                className="relative mt-3 pl-5 font-serif text-[15px] sm:text-base leading-relaxed text-[#F3EFE6]/90"
                style={{
                  borderLeft: "2px solid #D4A857",
                }}
              >
                <span
                  aria-hidden
                  className="absolute -left-1 -top-2 font-serif text-3xl leading-none"
                  style={{ color: "#D4A857" }}
                >
                  &ldquo;
                </span>
                {r.fragmento}
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FilmStrip() {
  return (
    <span
      aria-hidden
      className="inline-flex items-center gap-[3px]"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-[7px] w-[5px] rounded-[1px]"
          style={{ backgroundColor: "#D4A857", opacity: 0.65 }}
        />
      ))}
    </span>
  );
}
