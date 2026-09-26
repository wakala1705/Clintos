// Sin backend todavía: datos de ejemplo (mismo criterio que los mocks de otras
// features, ver hooks/Interconsulta/). Dos listas, una por pestaña:
//   - EN_ESPERA: pacientes que llegaron y aún no tienen valoración de triage
//     { id, paciente, documento, esperaMin, edad, sexo, tipoIngreso, banderas[], observacion };
//   - CLASIFICADOS: pacientes ya valorados, con su nivel (1-5, ver
//     @/hooks/TriageBadge/triageLevels) y quién/cuándo los clasificó
//     { id, paciente, documento, esperaMin, edad, tipoIngreso, nivel, hora, clasificadoPor }.
// `esperaMin` es el tiempo en minutos desde la llegada hasta ahora (espera) o
// hasta la clasificación (clasificados). Todo lo demás (resumen, conteos de
// las pestañas) se deriva de estas listas.

export const TABS = [
  { value: 'espera', label: 'En espera' },
  { value: 'clasificados', label: 'Clasificados' },
];

export const PAGE_SIZE = 10;

// Umbral de espera que la referencia legacy destaca en el resumen
// ("N pacientes > 30m").
export const UMBRAL_ESPERA_MIN = 30;

export const EN_ESPERA = [
  { id: 'TR-1042', paciente: 'MARIO ALBERTO MONTERROZA MURILLO', documento: 'CC 1045678231', esperaMin: 1699, edad: '34 años, 6 meses y 23 días', sexo: 'Masculino', tipoIngreso: 'Espontáneo', banderas: [], observacion: '' },
  { id: 'TR-1051', paciente: 'LUZ MARINA CASTRO PÉREZ', documento: 'CC 32654120', esperaMin: 47, edad: '71 años, 2 meses y 4 días', sexo: 'Femenino', tipoIngreso: 'Ambulancia', banderas: ['Adulto mayor'], observacion: 'Dolor torácico de 2 horas de evolución' },
  { id: 'TR-1053', paciente: 'VALENTINA OSPINA RUIZ', documento: 'TI 1098765432', esperaMin: 22, edad: '15 años, 9 meses y 11 días', sexo: 'Femenino', tipoIngreso: 'Espontáneo', banderas: [], observacion: 'Fiebre y vómito' },
  { id: 'TR-1054', paciente: 'KAREN DAYANA MEJÍA SOTO', documento: 'CC 1143987650', esperaMin: 18, edad: '27 años, 4 meses y 2 días', sexo: 'Femenino', tipoIngreso: 'Remitido', banderas: ['Gestante'], observacion: 'Remitida de primer nivel, 32 semanas' },
  { id: 'TR-1056', paciente: 'JOSÉ DAVID HERRERA LÓPEZ', documento: 'CC 72198345', esperaMin: 9, edad: '52 años, 0 meses y 17 días', sexo: 'Masculino', tipoIngreso: 'Espontáneo', banderas: [], observacion: '' },
  { id: 'TR-1057', paciente: 'SAMUEL ANDRÉS PATIÑO GIL', documento: 'RC 1101234567', esperaMin: 4, edad: '3 años, 1 mes y 8 días', sexo: 'Masculino', tipoIngreso: 'Espontáneo', banderas: ['Menor de 5 años'], observacion: 'Dificultad respiratoria' },
];

export const CLASIFICADOS = [
  { id: 'TR-1038', paciente: 'CARLOS EDUARDO BARRIOS NIETO', documento: 'CC 8765432', esperaMin: 12, edad: '63 años, 5 meses y 1 día', sexo: 'Masculino', tipoIngreso: 'Ambulancia', nivel: 2, hora: '06:42', clasificadoPor: 'Enf. Paola Rincón' },
  { id: 'TR-1039', paciente: 'ANA MILENA GUTIÉRREZ ROA', documento: 'CC 1047321654', esperaMin: 25, edad: '29 años, 8 meses y 14 días', sexo: 'Femenino', tipoIngreso: 'Espontáneo', nivel: 4, hora: '07:15', clasificadoPor: 'Enf. Paola Rincón' },
  { id: 'TR-1040', paciente: 'PEDRO PABLO ACOSTA VEGA', documento: 'CC 9123456', esperaMin: 8, edad: '80 años, 3 meses y 9 días', sexo: 'Masculino', tipoIngreso: 'Remitido', nivel: 1, hora: '07:48', clasificadoPor: 'Dr. Andrés Salgado' },
  { id: 'TR-1044', paciente: 'MARÍA FERNANDA LOZANO DÍAZ', documento: 'CC 1140876543', esperaMin: 34, edad: '41 años, 0 meses y 26 días', sexo: 'Femenino', tipoIngreso: 'Espontáneo', nivel: 3, hora: '08:20', clasificadoPor: 'Enf. Paola Rincón' },
  { id: 'TR-1047', paciente: 'LUIS ÁNGEL MARTÍNEZ ORTIZ', documento: 'CC 1002345678', esperaMin: 51, edad: '22 años, 7 meses y 3 días', sexo: 'Masculino', tipoIngreso: 'Espontáneo', nivel: 5, hora: '09:05', clasificadoPor: 'Enf. Julián Cortés' },
];

// Paso 1 de la valoración ("Criterios de atención inmediata"): si el paciente
// cumple alguno, es prioridad 1 sin más preguntas; "ninguno" sigue la
// valoración completa. Selección única — `ninguno` va aparte porque ocupa
// todo el ancho de la grilla.
export const CRITERIOS_INMEDIATOS = [
  { value: 'sin-signos-vitales', label: 'Ausencia de signos vitales' },
  { value: 'dificultad-respiratoria', label: 'Dificultad respiratoria severa' },
  { value: 'inconsciencia', label: 'Inconsciencia' },
  { value: 'trauma-mayor', label: 'Trauma mayor' },
  { value: 'cardiorrespiratorios', label: 'Problemas cardiorrespiratorios' },
  { value: 'neurologicos', label: 'Problemas neurológicos' },
];
export const CRITERIO_NINGUNO = { value: 'ninguno', label: 'Ninguno de los anteriores' };

// Nivel que se sugiere al marcar cualquier criterio de atención inmediata
// (texto tal cual la referencia legacy).
export const NIVEL_INMEDIATO = { nivel: 1, label: 'TRIAGE I (Emergencia vital)' };

// Paso 2 ("Ninguno de los anteriores"): condición especial del usuario —
// selección única, "N/A" por defecto salvo que el paciente ya llegue con la
// bandera correspondiente (ver condicionInicial).
export const CONDICIONES_ESPECIALES = [
  { value: 'na', label: 'N/A' },
  { value: 'gestante', label: 'Gestante', bandera: 'Gestante' },
  { value: 'menor-5', label: 'Menor de 5 años', bandera: 'Menor de 5 años' },
  { value: 'evento-salud-publica', label: 'Evento de interés en salud pública' },
];

export function condicionInicial(banderas = []) {
  return CONDICIONES_ESPECIALES.find((c) => c.bandera && banderas.includes(c.bandera))?.value ?? 'na';
}

// Signos vitales del paso 2, en dos filas (4 + 5 campos, como la referencia).
// FR va en rpm (respiraciones por minuto): la referencia legacy decía "lpm",
// que es la unidad de la FC.
export const SIGNOS_VITALES = [
  [
    { key: 'sistolica', label: 'Sistólica', unidad: 'mmHg' },
    { key: 'diastolica', label: 'Diastólica', unidad: 'mmHg' },
    { key: 'fc', label: 'FC', unidad: 'lpm', title: 'Frecuencia cardíaca' },
    { key: 'fr', label: 'FR', unidad: 'rpm', title: 'Frecuencia respiratoria' },
  ],
  [
    { key: 'temperatura', label: 'Temperatura', unidad: '°C', decimal: true },
    { key: 'saturacion', label: 'Sat. Oxígeno', unidad: '%' },
    { key: 'peso', label: 'Peso', unidad: 'kg', decimal: true },
    { key: 'talla', label: 'Talla', unidad: 'cm' },
    { key: 'glucometria', label: 'Glucometría', unidad: 'mg/dl' },
  ],
];

// Iniciales para <PatientAvatar> ("MARIO ALBERTO MONTERROZA MURILLO" → "MM":
// primer nombre + primer apellido, asumiendo 2 nombres + 2 apellidos).
export function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);
  const apellido = partes.length >= 4 ? partes[2] : partes[partes.length - 1];
  return `${partes[0][0]}${partes.length > 1 ? apellido[0] : ''}`.toUpperCase();
}

// "28h 19m" / "47m" — mismo formato que la referencia legacy.
export function formatearEspera(min) {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// Tono de <Badge> del tiempo en espera: verde hasta 15 min, ámbar hasta el
// umbral, rojo por encima (el paciente ya debería estar clasificado).
export function toneEspera(min) {
  if (min > UMBRAL_ESPERA_MIN) return 'danger';
  if (min > 15) return 'warn';
  return 'success';
}

export function promedioMin(lista) {
  if (lista.length === 0) return 0;
  return lista.reduce((acc, p) => acc + p.esperaMin, 0) / lista.length;
}
