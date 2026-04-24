export type Axis = {
  id: string;
  name: string;
  extreme1: string;
  extreme5: string;
  tooltip: string;
};

export type Subtopic = {
  id: string;
  name: string;
  description: string;
};

export type Topic = {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
};

export type AxisValue = 1 | 2 | 3 | 4 | 5;

export type ActiveAxis = {
  id: string;
  value: AxisValue;
};

export type Argumento = {
  subtitulo: string;
  desarrollo: string;
};

export type ReferenciaCultural = {
  titulo: string;
  tipo: "pelicula" | "serie" | "documental";
  anio: number;
  fragmento: string;
};

export type Argumentary = {
  titulo: string;
  gancho: string;
  argumentos: Argumento[];
  cierre: string;
  preguntas_aula: string[];
  referencias_culturales: ReferenciaCultural[];
};

export type GenerationResult = Argumentary & {
  id: string;
  createdAt: number;
  topicId: string;
  subtopicId: string;
  activeAxes: ActiveAxis[];
};

export type GenerateRequest = {
  topicId: string;
  subtopicId: string;
  activeAxes: ActiveAxis[];
};

export type GenerateResponse =
  | { ok: true; argumentary: Argumentary }
  | { ok: false; error: string };
