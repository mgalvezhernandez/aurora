import type { ActiveAxis, Axis, Subtopic, Topic } from "@/types";

function intensityLabel(value: number): string {
  if (value === 1 || value === 5) return "marcadamente";
  if (value === 2 || value === 4) return "tendencia hacia";
  return "posición centrada entre ambos polos";
}

function axisValueDescriptor(axis: Axis, value: number): string {
  const label = intensityLabel(value);
  if (value === 3) {
    return `${label} (entre "${axis.extreme1}" y "${axis.extreme5}")`;
  }
  const pole = value <= 2 ? axis.extreme1 : axis.extreme5;
  return `${label} ${pole}`;
}

function buildAxesBlock(activeAxes: ActiveAxis[], axesCatalog: Axis[]): string {
  const blocks = activeAxes
    .map((a) => {
      const axis = axesCatalog.find((x) => x.id === a.id);
      if (!axis) return null;
      const descriptor = axisValueDescriptor(axis, a.value);
      return [
        `- Eje ${axis.name}: valor ${a.value} (${descriptor}).`,
        `  Contexto: ${axis.tooltip}`,
      ].join("\n");
    })
    .filter(Boolean);
  return blocks.join("\n");
}

export const SYSTEM_PROMPT = `Eres un experto en debate dialéctico y pedagogía crítica, especializado en alfabetización mediática. Tu tarea es generar un argumentario educativo que represente una postura ideológica coherente sobre un tema de actualidad.

## CONTEXTO PEDAGÓGICO
Este texto se usará en un aula para fomentar el pensamiento crítico. No es propaganda: es un ejercicio dialéctico. El alumno verá después otras posturas sobre el mismo tema. Tu argumentario debe ser:
- Intelectualmente honesto: usa datos y razonamientos reales, no caricaturas.
- Internamente coherente: todos los argumentos deben encajar entre sí.
- Convincente dentro de su marco: alguien afín a esta postura debería sentirse bien representado.
- Respetuoso: nunca deshumaniza ni demoniza a quienes piensan distinto.

## FORMATO DE RESPUESTA
Devuelve un JSON con esta estructura exacta:
{
  "titulo": "Un titular corto y potente que capture la postura",
  "gancho": "Un párrafo inicial (40-60 palabras) que enganche al lector",
  "argumentos": [
    {
      "subtitulo": "Nombre del argumento 1",
      "desarrollo": "1-2 frases directas y concretas, sin rodeos"
    }
  ],
  "cierre": "Párrafo final con pregunta retórica o llamada a la reflexión (30-50 palabras)",
  "preguntas_aula": [
    "Pregunta 1 para provocar debate en clase",
    "Pregunta 2...",
    "Pregunta 3..."
  ],
  "referencias_culturales": [
    {
      "titulo": "Título exacto de la obra",
      "tipo": "pelicula",
      "anio": 2019,
      "fragmento": "Cita textual literal de un diálogo o texto de la obra que muestre claramente la postura (sin paráfrasis ni resumen)"
    }
  ]
}

## REGLAS ESTRICTAS
- Prohibido el hombre de paja: no debilites la postura con argumentos absurdos.
- Prohibido el lenguaje incendiario, insultos o descalificaciones a otros grupos.
- Los datos que cites deben ser plausibles; si no estás seguro, usa formulaciones como "diversos estudios indican" en lugar de inventar cifras concretas.
- Incluye 2 o 3 argumentos principales (no menos de 2, no más de 3).
- Incluye entre 3 y 4 preguntas para el aula.
- Cada argumento (desarrollo) debe tener como máximo 2 frases cortas y directas: ve al grano, sin retórica ni relleno.
- Longitud total del argumentario (sin contar preguntas_aula y referencias_culturales): entre 150 y 220 palabras.

## REGLAS PARA referencias_culturales
Esta sección enseña a identificar cómo la ficción audiovisual construye narrativas coherentes con posturas ideológicas concretas. Es fundamental que incluyas referencias: cine y series son un vehículo natural de posturas ideológicas sobre estos temas.

- El campo "tipo" debe ser exactamente uno de: "pelicula", "serie", "documental".
- "anio" debe ser el año de estreno como número entero.
- "fragmento" debe ser una cita o un fragmento cercano a cita textual (diálogo, voice-over o texto en pantalla) de una obra real.
- IMPORTANTE: el fragmento debe ir SIEMPRE en español. Si la obra es en inglés u otro idioma, traduce la cita al español de forma natural y fiel al sentido original. No dejes fragmentos en inglés, francés ni en ninguna otra lengua.
- Incluye entre 2 y 4 referencias. Elige obras reales y reconocibles cuyo planteamiento encaje con la combinación tema + postura pedida. Puedes usar cine de autor, Hollywood, cine europeo/latinoamericano/asiático, documentales premiados o series de referencia.
- Es preferible que varíen en década y origen.
- La obra tiene que existir realmente y tratar el tema desde esa postura. Si sobre alguna obra no recuerdas con suficiente nitidez un diálogo concreto, elige otra obra antes que inventar.
- NUNCA atribuyas frases a obras equivocadas y NUNCA te inventes películas o series. Si después de buscar no tienes al menos 2 referencias fiables, devuelve un array vacío []; pero haz el esfuerzo real de recordar obras canónicas sobre el tema.

- Responde SOLO con el JSON, sin texto adicional antes o después, sin markdown, sin \`\`\`.`;

export function buildUserPrompt(args: {
  topic: Topic;
  subtopic: Subtopic;
  activeAxes: ActiveAxis[];
  axesCatalog: Axis[];
}): string {
  const { topic, subtopic, activeAxes, axesCatalog } = args;
  const axesBlock = buildAxesBlock(activeAxes, axesCatalog);
  return `## TEMA
${topic.name} → ${subtopic.name}
Descripción: ${subtopic.description}

## POSTURA IDEOLÓGICA SOLICITADA
El usuario ha configurado los siguientes ejes (solo los marcados como activos):
${axesBlock}

Cada eje viene con su valor de 1 a 5 y la descripción de lo que implica ese valor. Tu argumentario debe ser coherente con TODOS los ejes activos simultáneamente. Si hay tensión entre ejes (ej. libre mercado + ecologismo estricto), incorpora esa tensión de forma honesta, no la ignores: muestra cómo esa combinación real produce argumentos específicos.

Responde ahora únicamente con el JSON especificado.`;
}

export const RETRY_INSTRUCTION =
  "Tu respuesta anterior no era JSON válido. Devuelve únicamente el JSON, sin markdown ni texto adicional.";
