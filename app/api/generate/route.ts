import { NextResponse } from "next/server";
import topicsData from "@/data/topics.json";
import axesData from "@/data/axes.json";
import type { Axis, GenerateRequest, GenerateResponse, Topic } from "@/types";
import { buildUserPrompt } from "@/lib/promptBuilder";
import { generateArgumentary } from "@/lib/claudeClient";

export const runtime = "nodejs";
export const maxDuration = 30;

const topics = topicsData as Topic[];
const axes = axesData as Axis[];

function validateBody(body: unknown): GenerateRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.topicId !== "string" || typeof b.subtopicId !== "string") return null;
  if (!Array.isArray(b.activeAxes)) return null;
  const activeAxes: GenerateRequest["activeAxes"] = [];
  for (const a of b.activeAxes) {
    if (typeof a !== "object" || a === null) return null;
    const obj = a as Record<string, unknown>;
    if (typeof obj.id !== "string") return null;
    const v = obj.value;
    if (typeof v !== "number" || v < 1 || v > 5 || !Number.isInteger(v)) return null;
    activeAxes.push({ id: obj.id, value: v as 1 | 2 | 3 | 4 | 5 });
  }
  if (activeAxes.length === 0) return null;
  return {
    topicId: b.topicId,
    subtopicId: b.subtopicId,
    activeAxes,
  };
}

export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Body JSON inválido." },
      { status: 400 },
    );
  }

  const body = validateBody(parsed);
  if (!body) {
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Parámetros inválidos. Revisa topicId, subtopicId y activeAxes." },
      { status: 400 },
    );
  }

  const topic = topics.find((t) => t.id === body.topicId);
  const subtopic = topic?.subtopics.find((s) => s.id === body.subtopicId);
  if (!topic || !subtopic) {
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Tema o subtema no encontrado en el catálogo." },
      { status: 400 },
    );
  }

  const knownAxisIds = new Set(axes.map((a) => a.id));
  for (const a of body.activeAxes) {
    if (!knownAxisIds.has(a.id)) {
      return NextResponse.json<GenerateResponse>(
        { ok: false, error: `Eje desconocido: ${a.id}` },
        { status: 400 },
      );
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<GenerateResponse>(
      {
        ok: false,
        error:
          "Falta configurar ANTHROPIC_API_KEY en el servidor. Copia .env.local.example a .env.local y añade tu clave.",
      },
      { status: 500 },
    );
  }

  const userPrompt = buildUserPrompt({
    topic,
    subtopic,
    activeAxes: body.activeAxes,
    axesCatalog: axes,
  });

  try {
    const argumentary = await generateArgumentary(userPrompt);
    return NextResponse.json<GenerateResponse>({ ok: true, argumentary });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Error al generar.";
    const msg = /rate.?limit/i.test(raw)
      ? "La API ha limitado las peticiones. Espera unos segundos y vuelve a intentarlo."
      : /timeout/i.test(raw)
        ? "La generación tardó demasiado. Inténtalo de nuevo."
        : raw;
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: msg },
      { status: 502 },
    );
  }
}
