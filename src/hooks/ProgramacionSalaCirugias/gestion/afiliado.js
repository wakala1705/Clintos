import { PACIENTES_DIRECTORIO } from './catalogos';

const digitos = (s) => String(s).replace(/\D/g, '');

// Convierte el afiliado elegido en el buscador compartido (#ps-overlay de
// NuevaCitaFlow: `{ nombre, documento, edad, sexo, eps, ... }`) al paciente que
// usa "Registrar orden externa". Si el documento está en el directorio de
// ejemplo se toma de ahí lo que el buscador no trae (régimen, contrato,
// historia clínica); si no, queda con valores por defecto (sin estudios en la
// historia, así que el chequeo los marca pendientes).
export function pacienteDesdeAfiliado(afiliado) {
  if (!afiliado) return null;
  const doc = digitos(afiliado.documento);
  const enDirectorio = PACIENTES_DIRECTORIO.find((p) => digitos(p.numeroDocumento) === doc);
  return {
    tipoDocumento: 'CC',
    regimen: 'Contributivo',
    contrato: '[N° contrato]',
    ordenesActivas: 0,
    historia: {},
    ...enDirectorio,
    nombre: afiliado.nombre,
    numeroDocumento: afiliado.documento,
    edad: afiliado.edad,
    sexo: afiliado.sexo,
    eps: afiliado.eps,
  };
}
