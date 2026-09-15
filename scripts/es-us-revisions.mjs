/**
 * Rewrites the Spanish translations from Castilian to the Spanish spoken in the
 * United States.
 *
 * The site is a Michigan university addressing US Hispanic families, so the
 * market is `es-US`. The first pass was written in Peninsular Spanish, which
 * reads as foreign to that audience — "grado" for a bachelor's degree,
 * "aparcamiento" for parking, "máster" for a master's.
 *
 * Ordered rules, applied in sequence to each Spanish string. The specific
 * phrases come first so the general patterns cannot mangle them: "Instituto de
 * Investigación" is a research institute and must survive the rule that turns
 * the high-school sense of "instituto" into "escuela preparatoria".
 *
 * Applied to the shared glossary, so one rule fixes every page that repeats the
 * phrase.
 */

/** [match, replacement] — strings are literal, regexes are global. */
export const RULES = [
  // ---- Specific phrases first -------------------------------------------
  // "Solicitar plaza" is how Spain says it; US Spanish asks for admission.
  ["Solicita tu plaza", "Solicita tu admisión"],
  ["Cómo solicitar plaza", "Cómo solicitar admisión"],
  ["solicitar plaza universitaria", "solicitar admisión a la universidad"],
  ["solicitan plaza", "solicitan admisión"],
  ["solicitar plaza", "solicitar admisión"],
  ["Reserva tu plaza", "Reserva tu lugar"],
  ["Reservar plaza", "Reservar lugar"],
  ["reserva de plaza", "reserva de lugar"],
  [/\bplazas? garantizadas?\b/g, "lugar garantizado"],
  ["tiene plaza garantizada", "tiene lugar garantizado"],

  // Tuition, where "matrícula" means the money rather than the act of enrolling.
  ["Matrícula y ayudas económicas", "Colegiatura y ayuda financiera"],
  ["la matrícula completa", "la colegiatura completa"],
  ["mitad de su matrícula", "mitad de su colegiatura"],
  ["El certificado tiene matrícula abierta", "El certificado tiene inscripción abierta"],
  ["la matrícula a tiempo completo", "la inscripción de tiempo completo"],

  // Cost.
  ["Coste y ayudas", "Costo y ayuda financiera"],
  ["Consulta coste y ayudas", "Consulta costo y ayuda financiera"],
  ["Explora costo y ayudas", "Consulta costo y ayuda financiera"],
  [/\bcoste\b/g, "costo"],
  [/\bCoste\b/g, "Costo"],
  [/\bcostes\b/g, "costos"],

  // Degrees. "Grado" is the post-Bologna Spanish term; US Spanish says
  // "licenciatura" for a bachelor's and "maestría" for a master's.
  ["Grado en Gestión de la Inteligencia Artificial", "Licenciatura en Gestión de la Inteligencia Artificial"],
  ["Grado en Gestión de la IA", "Licenciatura en Gestión de la IA"],
  ["Grado en empresa", "Licenciatura en negocios"],
  ["Admisiones de grado", "Admisiones de licenciatura"],
  ["Titulación de grado", "Licenciatura"],
  ["Grado, posgrado, certificado", "Licenciatura, posgrado, certificado"],
  ["titulaciones de grado", "licenciaturas"],
  ["estudiantes de grado", "estudiantes de licenciatura"],
  ["alumnado de grado", "estudiantes de licenciatura"],
  ["programas de grado y posgrado", "programas de licenciatura y posgrado"],
  ["itinerarios de grado y máster", "programas de licenciatura y maestría"],
  ["un grado de cuatro años", "una licenciatura de cuatro años"],
  ["Un grado de cuatro años", "Una licenciatura de cuatro años"],
  ["Este grado de cuatro años", "Esta licenciatura de cuatro años"],
  ["Desde un grado de cuatro años", "Desde una licenciatura de cuatro años"],
  ["El grado exige la admisión ordinaria de grado", "La licenciatura exige la admisión ordinaria de licenciatura"],
  ["cursas un grado", "cursas una licenciatura"],
  ["El Grado en", "La Licenciatura en"],
  ["el Grado en", "la Licenciatura en"],

  [/\bMáster\b/g, "Maestría"],
  [/\bmáster\b/g, "maestría"],
  ["El Maestría en", "La Maestría en"],
  ["Programas de maestría y doctorado", "Programas de maestría y doctorado"],
  ["un maestría", "una maestría"],
  ["Un maestría avanzado", "Una maestría avanzada"],

  // Dining. The bare label is the nav and footer heading for Dining.
  ["Restauración en el campus", "Comedores del campus"],
  ["Restauración", "Comedores"],
  ["Ver opciones de restauración", "Ver opciones de comida"],
  ["restauración universitaria", "servicios de comida universitarios"],
  ["puntos de restauración", "lugares para comer"],
  ["saldo de restauración", "crédito para comidas"],
  ["cocina de kilómetro cero", "cocina con productos locales"],

  // Parking. "Lote" rather than a second "Estacionamiento", so the sentence does
  // not read "estacionamiento gratuito en el Estacionamiento Norte".
  ["Parking Norte de Visitantes", "Lote Norte de Visitantes"],
  [/\baparcamiento\b/g, "estacionamiento"],
  [/\bAparcamiento\b/g, "Estacionamiento"],
  ["zona azul", "estacionamiento con parquímetro"],
  [/\bservicio de lanzadera\b/g, "servicio de transporte"],
  [/\blanzadera\b/g, "transporte"],

  // Academics.
  [/\bnota media\b/g, "promedio"],
  [/\bNota media\b/g, "Promedio"],
  ["una media superior", "un promedio superior"],
  ["una buena media", "un buen promedio"],
  ["situación académica regular", "buen estado académico"],
  ["situación regular", "buen estado académico"],
  ["se convalidan íntegramente", "se transfieren íntegramente"],
  ["opciones de convalidación", "opciones de transferencia de créditos"],
  ["cómo se convalidan sus créditos", "cómo se transfieren sus créditos"],
  ["¿Puedo convalidar el certificado dentro de una titulación?", "¿Puedo transferir los créditos del certificado a una licenciatura?"],
  ["Convalidable íntegramente", "Transferible en su totalidad"],
  [/\basignaturas\b/g, "cursos"],
  [/\bLas asignaturas\b/g, "Los cursos"],
  ["una asignatura troncal", "una materia académica principal"],
  ["elección de asignaturas", "elección de cursos"],
  ["Las cursos", "Los cursos"],
  ["las cursos", "los cursos"],

  // High school, but not the research institute of the same name.
  ["disponible en su instituto", "disponible en su escuela preparatoria"],

  // Academic year.
  ["tercer curso", "tercer año"],
  ["en segundo curso", "en segundo año"],

  // ---- Agreement repairs -------------------------------------------------
  // Swapping a noun changes its gender, and the words agreeing with it do not
  // follow on their own: "asignatura" is feminine and "curso" is masculine,
  // "nota media" feminine and "promedio" masculine. These run last and fix the
  // articles and adjectives the substitutions above leave stranded.
  ["Las asignaturas introductorias", "Los cursos introductorios"],
  ["Los cursos introductorias", "Los cursos introductorios"],
  ["la mayoría de las de cursos superiores", "la mayoría de los de niveles superiores"],
  ["una promedio mínima", "un promedio mínimo"],
  ["una promedio", "un promedio"],
  ["la buen estado académico", "el buen estado académico"],
  ["El maestría", "La maestría"],
  ["el maestría", "la maestría"],
  ["un licenciatura", "una licenciatura"],
  ["El licenciatura", "La licenciatura"],
];

export function reviseSpanish(text) {
  let out = text;
  for (const [match, replacement] of RULES) {
    out = typeof match === "string" ? out.split(match).join(replacement) : out.replace(match, replacement);
  }
  return out;
}
