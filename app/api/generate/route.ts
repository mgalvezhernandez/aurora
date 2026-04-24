import { NextResponse } from "next/server";
import topicsData from "@/data/topics.json";
import axesData from "@/data/axes.json";
import type { Axis, GenerateRequest, GenerateResponse, Topic } from "@/types";
import { buildUserPrompt, RETRY_INSTRUCTION } from "@/lib/promptBuilder";
import {
  generateArgumentary,
  parseArgumentary,
  streamClaude,
} from "@/lib/claudeClient";

export const runtime = "nodejs";
export const maxDuration = 60;

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

function errorJson(error: string, status = 400) {
  return NextResponse.json<GenerateResponse>({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return errorJson("Body JSON inválido.", 400);
  }

  const body = validateBody(parsed);
  if (!body) {
    return errorJson(
      "Parámetros inválidos. Revisa topicId, subtopicId y activeAxes.",
      400,
    );
  }

  const topic = topics.find((t) => t.id === body.topicId);
  const subtopic = topic?.subtopics.find((s) => s.id === body.subtopicId);
  if (!topic || !subtopic) {
    return errorJson("Tema o subtema no encontrado en el catálogo.", 400);
  }

  const knownAxisIds = new Set(axes.map((a) => a.id));
  for (const a of body.activeAxes) {
    if (!knownAxisIds.has(a.id)) {
      return errorJson(`Eje desconocido: ${a.id}`, 400);
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return errorJson(
      "Falta configurar ANTHROPIC_API_KEY en el servidor. Copia .env.local.example a .env.local y añade tu clave.",
      500,
    );
  }

  const userPrompt = buildUserPrompt({
    topic,
    subtopic,
    activeAxes: body.activeAxes,
    axesCatalog: axes,
  });

  // Streaming activado si el cliente lo pide con ?stream=1
  const url = new URL(req.url);
  const useStream = url.searchParams.get("stream") === "1";

  if (!useStream) {
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
      return errorJson(msg, 502);
    }
  }

  // --- MODO STREAMING (SSE) ---
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      let accumulated = "";
      try {
        send("start", { ts: Date.now() });

        for await (const chunk of streamClaude(userPrompt)) {
          accumulated += chunk;
          send("token", { chunk, total: accumulated.length });
        }

        // Intentar parsear al finalizar
        try {
          const argumentary = parseArgumentary(accumulated);
          send("final", { ok: true, argumentary });
        } catch (parseErr) {
          // Reintentar una vez
          try {
            let retryAccumulated = "";
            for await (const chunk of streamClaude(userPrompt, RETRY_INSTRUCTION)) {
              retryAccumulated += chunk;
              send("token", { chunk, total: retryAccumulated.length });
            }
            const argumentary = parseArgumentary(retryAccumulated);
            send("final", { ok: true, argumentary });
          } catch (retryErr) {
            const msg =
              retryErr instanceof Error ? retryErr.message : "Error al parsear.";
            send("final", { ok: false, error: msg });
          }
        }
      } catch (err) {
        const raw = err instanceof Error ? err.message : "Error al generar.";
        const msg = /rate.?limit/i.test(raw)
          ? "La API ha limitado las peticiones. Espera unos segundos y vuelve a intentarlo."
          : /timeout/i.test(raw)
            ? "La generación tardó demasiado. Inténtalo de nuevo."
            : raw;
        send("final", { ok: false, error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
