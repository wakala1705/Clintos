// Detalle extendido de un paciente para "Ver ficha completa" (Lista de
// Pacientes → /pacientes/:id). No hay backend real todavía: getPatientDetail()
// parte del mismo PATIENTS de mockPatientsData.js (la fuente de la tabla) y
// completa determinísticamente (random con semilla = id) el resto de los ~40
// campos de las 6 secciones del prompt, para que la ficha se vea real sin
// inventar un segundo dataset desconectado del de la lista.
// TODO: reemplazar por el endpoint real (GET /pacientes/:id) cuando exista.

import { PATIENTS, calcularEdad } from '@/hooks/ListaPacientes/mockPatientsData';

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function seedFromId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return h + 1;
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const TIPO_DOC_LABEL = { CC: 'Cédula de Ciudadanía', TI: 'Tarjeta de Identidad' };
const PAISES = ['Colombia', 'Venezuela', 'Ecuador'];
const GENERO_OPTS = ['Masculino', 'Femenino', 'Transgénero', 'No binario'];
const ESTADO_CIVIL_OPTS = ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)'];
const GRUPO_SANGUINEO_OPTS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const TIPO_AFILIADO_OPTS = ['Cotizante', 'Beneficiario', 'Adicional'];
const ZONA_OPTS = ['Urbana', 'Rural'];
const LOCALIDADES = ['Chapinero', 'Suba', 'Kennedy', 'Poblado', 'Laureles', 'Belén'];
const GRUPO_POBLACIONAL_OPTS = ['Población general', 'Desplazado', 'Indígena', 'ROM / Gitano', 'Migrante'];
const TIPO_DISCAPACIDAD_OPTS = ['Ninguna', 'Física', 'Visual', 'Auditiva', 'Cognitiva'];
const NIVEL_SOCIOECONOMICO_OPTS = ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 4', 'Estrato 5', 'Estrato 6'];
const GRUPO_ETNICO_OPTS = ['Ninguno', 'Indígena', 'Afrocolombiano', 'Raizal', 'Palenquero'];
const NIVEL_EDUCATIVO_OPTS = ['Ninguno', 'Primaria', 'Secundaria', 'Técnico', 'Tecnólogo', 'Universitario', 'Posgrado'];
const OCUPACIONES = ['Empleado(a)', 'Independiente', 'Estudiante', 'Hogar', 'Pensionado(a)', 'Desempleado(a)'];
const RELIGION_OPTS = ['Católica', 'Cristiana / Evangélica', 'Ninguna', 'Otra'];
const RAZA_OPTS = ['Mestizo', 'Blanco', 'Afrodescendiente', 'Indígena', 'Otro'];
const SI_NO_OPTS = ['Sí', 'No'];

const DOC_ADMIN_TIPOS = [
  'Documento de identidad',
  'Consentimiento informado (Habeas Data)',
  'Autorización EPS',
];

const AUDITORIA_USUARIOS = ['Camilo Grondona', 'Recepción — Sede Norte', 'Sistema'];

// Reconstruye el "formData" con las mismas claves que espera el wizard de 4
// pasos de NuevaCita (ap*) — así apOpenEditExternal() puede precargarlo tal
// cual, sin una segunda traducción de campos. Ver AP_STEPS/apContent* en
// legacy-nueva-cita.js.
function buildFormData(patient, rand) {
  const partes = patient.nombre.split(' ').filter(Boolean);
  const nombreEsCorto = partes.length <= 3;

  return {
    tipoDocumento: `${patient.tipoDocumento} - ${TIPO_DOC_LABEL[patient.tipoDocumento] || 'Cédula de Ciudadanía'}`,
    idAfiliado: patient.documento,
    primerApellido: nombreEsCorto ? (partes[1] || partes[0]) : partes[2],
    segundoApellido: nombreEsCorto ? '' : (partes[3] || ''),
    primerNombre: partes[0],
    segundoNombre: nombreEsCorto ? '' : partes[1],
    fechaNacimiento: patient.fechaNacimiento,
    paisOrigen: `COL - ${pick(PAISES, rand)}`,
    ciudadNacimiento: patient.ciudad,
    documentoId: '',
    ciudadExpedicion: patient.ciudad,
    sexo: patient.sexo,
    genero: pick(GENERO_OPTS, rand),
    estadoCivil: pick(ESTADO_CIVIL_OPTS, rand),
    grupoSanguineo: pick(GRUPO_SANGUINEO_OPTS, rand),

    idSede: '02',
    tipoAfiliado: pick(TIPO_AFILIADO_OPTS, rand),
    fechaAfiliacion: addDays(patient.fechaRegistro, -Math.floor(rand() * 200)),
    asegurador: patient.eps,
    estadoAfiliacion: patient.estado === 'activo' ? 'Activo' : 'Inactivo',
    fechaEstado: patient.fechaRegistro,
    ciudadProcedencia: patient.ciudad,

    paisResidencia: 'COL - Colombia',
    ciudadResidencia: patient.ciudad,
    localidad: pick(LOCALIDADES, rand),
    direccionResidencia: `Calle ${10 + Math.floor(rand() * 80)} # ${10 + Math.floor(rand() * 80)}-${10 + Math.floor(rand() * 90)}`,
    zona: pick(ZONA_OPTS, rand),
    zonaPostal: String(100000 + Math.floor(rand() * 800000)),
    celular: patient.celular,
    telefonoResidencia: rand() > 0.4 ? `601 ${Math.floor(rand() * 900 + 100)} ${Math.floor(rand() * 9000 + 1000)}` : '',
    telefonoLaboral: '',
    correoElectronico: `${partes[0].toLowerCase()}.${(partes[partes.length - 1] || '').toLowerCase()}@correo.com`,

    grupoPoblacional: pick(GRUPO_POBLACIONAL_OPTS, rand),
    tipoDiscapacidad: pick(TIPO_DISCAPACIDAD_OPTS, rand),
    nivelSocioeconomico: pick(NIVEL_SOCIOECONOMICO_OPTS, rand),
    grupoEtnico: pick(GRUPO_ETNICO_OPTS, rand),
    nivelEducativo: pick(NIVEL_EDUCATIVO_OPTS, rand),
    incapacidad: 'No',
    idOcupacion: pick(OCUPACIONES, rand),
    religion: pick(RELIGION_OPTS, rand),
    raza: pick(RAZA_OPTS, rand),
    victimaConflicto: rand() > 0.85 ? 'Sí' : 'No',
    situacionDesplazamiento: rand() > 0.9 ? 'Sí' : 'No',
  };
}

function buildAfiliacionesAnteriores(patient, rand, actual) {
  const cantidad = Math.floor(rand() * 3); // 0 a 2 periodos previos
  const otrasEps = ['Sura', 'Nueva EPS', 'Compensar', 'Salud Total', 'Colsanitas', 'Famisanar', 'Coomeva']
    .filter((e) => e !== actual.eps);
  let fin = addDays(actual.fechaInicio, -1);
  const periodos = [];
  for (let i = 0; i < cantidad; i++) {
    const inicio = addDays(fin, -(180 + Math.floor(rand() * 400)));
    periodos.push({
      eps: pick(otrasEps, rand),
      tipoAfiliado: pick(TIPO_AFILIADO_OPTS, rand),
      estado: 'Retirado',
      fechaInicio: inicio,
      fechaFin: fin,
    });
    fin = addDays(inicio, -1);
  }
  return periodos;
}

function buildDocumentosAdministrativos(patient, rand) {
  return DOC_ADMIN_TIPOS.map((tipo, i) => {
    const cargado = rand() > 0.25;
    return {
      id: `${patient.id}-doc-${i}`,
      tipo,
      nombreArchivo: cargado ? `${tipo.split(' ')[0].toLowerCase()}_${patient.id}.pdf` : null,
      fecha: cargado ? addDays(patient.fechaRegistro, Math.floor(rand() * 10)) : null,
      estado: cargado ? 'cargado' : 'pendiente',
    };
  });
}

function buildAuditoria(patient, rand) {
  const eventos = [{ fecha: patient.fechaRegistro, usuario: pick(AUDITORIA_USUARIOS, rand), accion: 'Creó el registro' }];
  const posibles = ['Editó datos de contacto', 'Actualizó afiliación', 'Editó datos básicos', 'Cargó documento de identidad'];
  const cantidad = Math.floor(rand() * 3);
  for (let i = 0; i < cantidad; i++) {
    eventos.push({
      fecha: addDays(patient.fechaRegistro, 20 + i * 40 + Math.floor(rand() * 15)),
      usuario: pick(AUDITORIA_USUARIOS, rand),
      accion: pick(posibles, rand),
    });
  }
  if (patient.estado === 'inactivo') {
    eventos.push({
      fecha: addDays(patient.fechaRegistro, 200 + Math.floor(rand() * 100)),
      usuario: pick(AUDITORIA_USUARIOS, rand),
      accion: 'Inactivó el registro',
    });
  }
  return eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// Promise para simular latencia de red — misma forma que fetchPatients().
// Resuelve null si el id no existe (paciente no encontrado / link inválido).
export function getPatientDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patient = PATIENTS.find((p) => p.id === id);
      if (!patient) { resolve(null); return; }

      const rand = seededRandom(seedFromId(id));
      const formData = patient.formData || buildFormData(patient, rand);
      const afiliacionActual = {
        eps: patient.eps,
        tipoAfiliado: formData.tipoAfiliado,
        estado: formData.estadoAfiliacion,
        fechaInicio: formData.fechaAfiliacion,
      };

      resolve({
        ...patient,
        edad: calcularEdad(patient.fechaNacimiento),
        formData,
        afiliacionActual,
        afiliacionesAnteriores: buildAfiliacionesAnteriores(patient, rand, afiliacionActual),
        ubicacion: {
          direccion: formData.direccionResidencia,
          zona: formData.zona,
          zonaPostal: formData.zonaPostal,
          ciudad: formData.ciudadResidencia,
          localidad: formData.localidad,
          celular: formData.celular,
          telefonoResidencia: formData.telefonoResidencia,
          telefonoLaboral: formData.telefonoLaboral,
          correo: formData.correoElectronico,
        },
        clasificacion: {
          grupoPoblacional: formData.grupoPoblacional,
          tipoDiscapacidad: formData.tipoDiscapacidad,
          nivelSocioeconomico: formData.nivelSocioeconomico,
          grupoEtnico: formData.grupoEtnico,
          nivelEducativo: formData.nivelEducativo,
          incapacidad: formData.incapacidad,
          ocupacion: formData.idOcupacion,
          religion: formData.religion,
          raza: formData.raza,
          victimaConflicto: formData.victimaConflicto,
          situacionDesplazamiento: formData.situacionDesplazamiento,
        },
        documentos: buildDocumentosAdministrativos(patient, rand),
        auditoria: buildAuditoria(patient, rand),
      });
    }, 350);
  });
}

// Aplica el resultado de apSubmit() (mismo shape que produce el wizard al
// guardar) sobre el registro de PATIENTS que alimenta Lista de Pacientes —
// para que "Editar" desde la ficha completa se refleje también en la tabla.
export function updatePatientFromWizardData(id, datosFormulario) {
  const patient = PATIENTS.find((p) => p.id === id);
  if (!patient) return null;
  patient.nombre = datosFormulario.nombre;
  patient.iniciales = datosFormulario.iniciales;
  patient.sexo = datosFormulario.sexo;
  patient.ciudad = datosFormulario.ciudad;
  patient.eps = datosFormulario.eps;
  patient.celular = datosFormulario.telefono;
  patient.formData = datosFormulario.formData;
  return patient;
}
