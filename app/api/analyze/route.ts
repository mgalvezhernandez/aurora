import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `Eres un experto en pensamiento crítico y análisis de discurso. Tu tarea es analizar un argumentario educativo e identificar sus sesgos, supuestos implícitos y posibles falacias. El objetivo es pedagógico: ayudar a los alumnos a desarrollar un pensamiento crítico sobre el texto que acaban de leer.`;

const ANALYZE_PROMPT = (texto: string) => `Analiza el siguiente argumentario educativo e identifica 2 o 3 sesgos, supuestos implícitos o falacias que contiene. Para cada uno:
- "tipo": nombre del sesgo o falacia (ej. "Apelación a la emoción", "Supuesto implícito", "Generalización apresurada"…)
- "descripcion": explicación breve y clara de en qué consiste en este texto (1-2 frases)
- "cita": fragmento literal corto del argumentario donde se manifiesta

Responde SOLO con JSON válido, sin markdown ni texto adicional:
{
  "sesgos": [
    { "tipo": "...", "descripcion": "...", "cita": "..." }
  ]
}

ARGUMENTARIO A ANALIZAR:
---
${texto}
---`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "API key no configurada." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (!b?.texto || typeof b.texto !== "string" || b.texto.trim().length < 30) {
    return NextResponse.json({ ok: false, error: "Falta el texto a analizar." }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

    const res = await client.messages.create({
      model,
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: "user", content: ANALYZE_PROMPT(b.texto.trim()) }],
    });

    const raw = res.content.find((c) => c.type === "text")?.text ?? "";
    // Extraer JSON de la respuesta
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Respuesta sin JSON válido.");
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed?.sesgos)) throw new Error("Estructura inesperada.");

    return NextResponse.json({ ok: true, sesgos: parsed.sesgos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al analizar.";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
