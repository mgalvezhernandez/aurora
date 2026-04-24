# Aurora v1 — Generador de argumentarios enfrentados

Herramienta educativa web (Next.js 14 + TypeScript + Tailwind) que genera, mediante la API de Claude, argumentarios sobre temas de actualidad según la postura ideológica que el usuario configure en 6 ejes independientes. Pensada para uso en aula (ESO, Bachillerato, universidad) con el objetivo de fomentar el pensamiento crítico a través del contraste de perspectivas.

> No es una herramienta de polarización. Es una herramienta de exposición dialéctica. El mismo hecho puede defenderse desde marcos muy distintos; el objetivo es que el alumno aprenda a reconocerlos.

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la clave de API
cp .env.local.example .env.local
# editar .env.local y poner tu ANTHROPIC_API_KEY

# 3. Arrancar en desarrollo
npm run dev
# → http://localhost:3000
```

### Variables de entorno

| Variable | Descripción | Obligatorio |
|---|---|---|
| `ANTHROPIC_API_KEY` | Clave de la Anthropic API. No se expone al cliente. | Sí |
| `ANTHROPIC_MODEL` | Modelo a usar. Por defecto `claude-sonnet-4-6`. | No |

## Estructura

```
/app
  /page.tsx                 Landing
  /generator/page.tsx       Wizard (los 3 pasos)
  /api/generate/route.ts    Endpoint que llama a Claude
/components
  TopicSelector.tsx
  AxesConfigurator.tsx
  AxisSlider.tsx
  ArgumentaryCard.tsx
  ComparisonView.tsx
  ResultView.tsx
  InfoTooltip.tsx
  HowItWorksModal.tsx
  SiteFooter.tsx
/data
  topics.json               Catálogo de temas
  axes.json                 Los 6 ejes ideológicos (textos literales)
/lib
  promptBuilder.ts          Construye el prompt a partir del estado
  claudeClient.ts           Wrapper de la API (con reintento JSON)
  store.ts                  Estado global (Zustand)
/types
  index.ts
```

## Flujo

1. **Landing** — bienvenida + botón *Empezar* + enlace *¿Cómo funciona?* (modal).
2. **Paso 1 · Tema** — categorías expandibles; se elige un único subtema.
3. **Paso 2 · Ejes** — 6 sliders (1–5) con toggle individual y tooltip explicativo. Mínimo un eje activo.
4. **Paso 3 · Argumentario** — título, gancho, 2–3 argumentos, cierre y 3–4 preguntas para el aula. Botones *Ver desde otra perspectiva*, *Nuevo tema* y *Copiar texto*.
5. **Contraste** — al generar un segundo argumentario sobre el mismo tema, aparecen ambos en paralelo (split-screen en desktop, pestañas en móvil). A partir del tercero, los anteriores se apilan como historial desplegable.

## Prompt maestro

El prompt maestro vive en `lib/promptBuilder.ts` (constante `SYSTEM_PROMPT`). Para cada eje activo se construye dinámicamente un bloque con:

- Valor numérico 1–5.
- Etiqueta de intensidad: `marcadamente` (1/5), `tendencia hacia` (2/4), `posición centrada entre ambos polos` (3).
- Texto literal del tooltip como contexto.

El cliente Claude aplica caché de prompt (`cache_control: ephemeral`) sobre el `system` para abaratar llamadas repetidas en la misma sesión, y reintenta una vez si la respuesta no es JSON válido, añadiendo la instrucción correctora indicada en la especificación.

## Diseño

- Paleta: paper `#FAFAF9`, ink `#1A1A1A`, accent `#2E5FB8`, contrast `#B85C3A`.
- Tipografía: *Fraunces* (titulares), *Inter* (cuerpo).
- Columna de lectura máxima: 600 px.
- Sin gradientes chillones, sin emojis, sin rojo/azul binario en el argumentario.

## Accesibilidad

- Navegación por teclado en todos los controles.
- Tooltips con `aria-describedby` / `role="tooltip"` y cierre por `Esc`.
- Argumentarios con `lang="es"`.
- Indicador de carga con texto explícito: *Construyendo el argumentario desde tu postura...*.

## Fuera del alcance de v1

Autenticación, persistencia permanente, traducción multilingüe, vídeo/audio sintético, comentarios de comunidad, moderación automática adicional y "espejo algorítmico".

## Criterios de aceptación

- [x] Catálogo completo seleccionable subtema por subtema.
- [x] 1–6 ejes activables con sliders 1–5.
- [x] Generación en < 20 s (depende de la API) con estructura título/gancho/2–3 argumentos/cierre/3–4 preguntas.
- [x] Regeneración con comparación en paralelo del argumentario anterior y el nuevo.
- [x] Tooltips con el texto literal de la especificación.
- [x] Reintento si el JSON no es válido.
