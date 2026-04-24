import Anthropic from "@anthropic-ai/sdk";
import type { Argumentary, ReferenciaCultural } from "@/types";
import { RETRY_INSTRUCTION, SYSTEM_PROMPT } from "./promptBuilder";

const DEFAULT_MODEL = "claude-sonnet-4-6";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY no está configurada en el entorno.");
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) return fence[1].trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }
  return trimmed;
}

const VALID_TIPOS = new Set(["pelicula", "serie", "documental"]);

function parseReferencias(raw: unknown): ReferenciaCultural[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r): ReferenciaCultural | null => {
      if (typeof r !== "object" || r === null) return null;
      const o = r as Record<string, unknown>;
      if (
        typeof o.titulo !== "string" ||
        typeof o.fragmento !== "string" ||
        typeof o.tipo !== "string" ||
        !VALID_TIPOS.has(o.tipo)
      ) {
        return null;
      }
      const anio =
        typeof o.anio === "number"
          ? Math.trunc(o.anio)
          : typeof o.anio === "string"
            ? parseInt(o.anio, 10)
            : NaN;
      if (!Number.isFinite(anio)) return null;
      const fragmento = o.fragmento.trim();
      const titulo = o.titulo.trim();
      if (!titulo || !fragmento) return null;
      return {
        titulo,
        tipo: o.tipo as ReferenciaCultural["tipo"],
        anio,
        fragmento,
      };
    })
    .filter((x): x is ReferenciaCultural => x !== null);
}

function parseArgumentary(raw: string): Argumentary {
  const candidate = extractJson(raw);
  const obj = JSON.parse(candidate);
  if (
    typeof obj?.titulo !== "string" ||
    typeof obj?.gancho !== "string" ||
    !Array.isArray(obj?.argumentos) ||
    typeof obj?.cierre !== "string" ||
    !Array.isArray(obj?.preguntas_aula)
  ) {
    throw new Error("JSON con estructura inesperada.");
  }
  const argumentos = obj.argumentos
    .filter(
      (a: unknown): a is { subtitulo: string; desarrollo: string } =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as Record<string, unknown>).subtitulo === "string" &&
        typeof (a as Record<string, unknown>).desarrollo === "string",
    )
    .map((a: { subtitulo: string; desarrollo: string }) => ({
      subtitulo: a.subtitulo,
      desarrollo: a.desarrollo,
    }));
  const preguntas_aula = obj.preguntas_aula.filter(
    (q: unknown): q is string => typeof q === "string",
  );
  if (argumentos.length < 2) {
    throw new Error("El argumentario debe incluir al menos 2 argumentos.");
  }
  const referencias_culturales = parseReferencias(obj.referencias_culturales);
  return {
    titulo: obj.titulo,
    gancho: obj.gancho,
    argumentos,
    cierre: obj.cierre,
    preguntas_aula,
    referencias_culturales,
  };
}

async function callClaude(userPrompt: string, extraSystem?: string): Promise<string> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const system = extraSystem ? `${SYSTEM_PROMPT}\n\n${extraSystem}` : SYSTEM_PROMPT;
  const res = await client.messages.create({
    model,
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });
  const chunk = res.content.find((c) => c.type === "text");
  if (!chunk || chunk.type !== "text") {
    throw new Error("La API no devolvió contenido de texto.");
  }
  return chunk.text;
}

export async function generateArgumentary(userPrompt: string): Promise<Argumentary> {
  let raw: string;
  try {
    raw = await callClaude(userPrompt);
    return parseArgumentary(raw);
  } catch (err) {
    if (err instanceof SyntaxError || (err as Error).message.includes("estructura")) {
      const retry = await callClaude(userPrompt, RETRY_INSTRUCTION);
      return parseArgumentary(retry);
    }
    throw err;
  }
}
