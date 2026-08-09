// Dataset mock + simulación de un endpoint paginado en servidor. No existe
// backend real para esta pantalla todavía — fetchPatients() se escribió con
// la forma (query/filtros/orden/página → { items, total }) que tendría una
// llamada real, para que conectar el endpoint real más adelante sea solo
// cambiar el cuerpo de esta función, no el resto de la pantalla.
// TODO: reemplazar por la llamada real al backend (debe seguir filtrando por
// sede server-side salvo para admin_global — ver permissions.js).

const NOMBRES = ['Laura Sofía', 'Andrés Felipe', 'María Isabel', 'Jorge Luis', 'Valentina', 'Carlos Eduardo', 'Sandra Milena', 'Camila', 'Santiago', 'Daniela', 'Julián', 'Paula Andrea', 'Esteban', 'Mariana', 'Diego Alejandro', 'Isabella', 'Nicolás', 'Gabriela', 'Sebastián', 'Natalia', 'Felipe', 'Alejandra', 'Ricardo', 'Catalina', 'David', 'Juliana', 'Miguel Ángel', 'Sofía', 'Óscar', 'Adriana', 'Fernando', 'Lorena', 'Iván', 'Melissa'];
const APELLIDOS = ['Martínez Gómez', 'Herrera Rincón', 'Correa Patiño', 'Pedraza Mora', 'Ospina Castaño', 'Ramírez Torres', 'Vargas Díaz', 'Torres Mesa', 'Cárdenas Ruiz', 'Rodríguez Paternina', 'Zuluaga Restrepo', 'Gómez Villa', 'Bermúdez Cano', 'Salazar Ochoa', 'Quintero Arango', 'Peña Duque', 'Londoño Vélez', 'Castro Higuita', 'Muñoz Sepúlveda', 'Aguirre Botero'];
const CIUDADES_SEDE = [
  { sede: 'Sede Norte', ciudad: 'Bogotá D.C.' },
  { sede: 'Sede Sur', ciudad: 'Bogotá D.C.' },
  { sede: 'Sede Centro', ciudad: 'Medellín' },
];
const EPS_LIST = ['Sura', 'Nueva EPS', 'Compensar', 'Salud Total', 'Colsanitas', 'Famisanar', 'Coomeva'];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function buildDocumento(rand) {
  const digits = 7 + Math.floor(rand() * 3);
  let n = '';
  for (let i = 0; i < digits; i++) n += Math.floor(rand() * 10);
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function buildFechaNacimiento(rand) {
  const year = 1945 + Math.floor(rand() * 78);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildFechaRegistro(rand) {
  const year = 2023 + Math.floor(rand() * 3);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const rand = seededRandom(42);

export const PATIENTS = Array.from({ length: 46 }, (_, i) => {
  const nombre = pick(NOMBRES, rand);
  const apellidos = pick(APELLIDOS, rand);
  const [primerApellido] = apellidos.split(' ');
  const sexo = rand() > 0.5 ? 'Femenino' : 'Masculino';
  const { sede, ciudad } = pick(CIUDADES_SEDE, rand);
  const estado = rand() > 0.18 ? 'activo' : 'inactivo';
  const fechaNacimiento = buildFechaNacimiento(rand);

  return {
    id: `pac-${i + 1}`,
    nombre: `${nombre} ${apellidos}`,
    primerApellido,
    iniciales: `${nombre[0]}${apellidos[0]}`.toUpperCase(),
    tipoDocumento: rand() > 0.08 ? 'CC' : 'TI',
    documento: buildDocumento(rand),
    fechaNacimiento,
    sexo,
    ciudad,
    sede,
    eps: pick(EPS_LIST, rand),
    estado,
    celular: `3${Math.floor(rand() * 90 + 10)} ${Math.floor(rand() * 900 + 100)} ${Math.floor(rand() * 9000 + 1000)}`,
    fechaRegistro: buildFechaRegistro(rand),
    citasFuturas: Math.floor(rand() * 4),
  };
});

export const EPS_OPTIONS = EPS_LIST;
export const SEDE_OPTIONS = CIUDADES_SEDE.map((c) => c.sede);

// Un paciente nunca se borra del sistema por trazabilidad clínica/legal —
// "Inactivar" solo cambia el estado. TODO: reemplazar por el PATCH real al
// backend; de momento muta el dataset mock in-memory para que la UI se
// sienta real entre una búsqueda y otra dentro de la misma sesión.
export function updatePatientEstado(id, estado) {
  const patient = PATIENTS.find((p) => p.id === id);
  if (patient) patient.estado = estado;
  return patient;
}

export function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple = hoy.getMonth() < nacimiento.getMonth()
    || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad--;
  return edad;
}

export const RANGO_EDAD_OPTIONS = [
  { id: '0-17', label: '0 a 17 años', min: 0, max: 17 },
  { id: '18-39', label: '18 a 39 años', min: 18, max: 39 },
  { id: '40-59', label: '40 a 59 años', min: 40, max: 59 },
  { id: '60+', label: '60 años o más', min: 60, max: Infinity },
];

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const PAGE_DELAY_MS = 350;

// Simula un endpoint server-side: filtra, ordena, pagina y solo "devuelve"
// el slice pedido — pensado para no cargar la base completa en el cliente
// cuando haya un backend real detrás.
export function fetchPatients({
  query = '',
  filters = {},
  sortBy = 'apellido',
  page = 1,
  pageSize = 10,
  sedeRestriction = null,
} = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = normalize(query.trim());
      const qDigits = q.replace(/\D/g, '');

      let list = PATIENTS.filter((p) => {
        if (sedeRestriction && p.sede !== sedeRestriction) return false;
        if (filters.estado && p.estado !== filters.estado) return false;
        if (filters.eps && p.eps !== filters.eps) return false;
        if (filters.sexo && p.sexo !== filters.sexo) return false;
        if (filters.sede && p.sede !== filters.sede) return false;
        if (filters.rangoEdad) {
          const rango = RANGO_EDAD_OPTIONS.find((r) => r.id === filters.rangoEdad);
          const edad = calcularEdad(p.fechaNacimiento);
          if (rango && (edad < rango.min || edad > rango.max)) return false;
        }
        if (q) {
          const matchNombre = normalize(p.nombre).includes(q);
          const matchDoc = qDigits && p.documento.replace(/\D/g, '').includes(qDigits);
          if (!matchNombre && !matchDoc) return false;
        }
        return true;
      });

      list = [...list].sort((a, b) => {
        if (sortBy === 'registro') {
          return b.fechaRegistro.localeCompare(a.fechaRegistro);
        }
        return a.primerApellido.localeCompare(b.primerApellido, 'es');
      });

      const total = list.length;
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      resolve({ items, total });
    }, PAGE_DELAY_MS);
  });
}
