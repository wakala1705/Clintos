// Datos administrativos ficticios de una admisión (médico de ingreso,
// acompañante, usuario que ingresa, régimen, área funcional) para el modal
// @/Components/DetalleAdmisionModal — compartidos por HC Hospitalización
// (getDetalleAdmision en mockHospitalizadosData.js) y Admisiones
// (detalleDesdeAdmision en mockAdmisionesData.js), así ambas pantallas
// generan el mismo tipo de dato con las mismas listas. Estables por
// admisión: se eligen con un número semilla (id/N° de admisión), no con un
// random. TODO: con backend real, estos campos vienen de la admisión.
const MEDICOS_INGRESO = [
  { documento: '1067968580', nombre: 'Juan Esteban Pastrana' },
  { documento: '1045872314', nombre: 'Natalia Restrepo Gil' },
  { documento: '71894562', nombre: 'Hernán Darío Mejía' },
  { documento: '1128456791', nombre: 'Valentina Ochoa Ruiz' },
];
const USUARIOS_ADMISION = ['José Martínez', 'Liliana Cárdenas', 'Mauricio Quintero'];
const ACOMPANANTES = [
  { nombre: 'Felipe Ramírez', vinculo: 'Hijo(a)', telefono: '3154152635', direccion: 'Calle 34 # 12-45' },
  { nombre: 'Gloria Patiño', vinculo: 'Cónyuge', telefono: '3006148823', direccion: 'Carrera 70 # 45-10, apto 302' },
  { nombre: 'Andrea Suárez', vinculo: 'Hermano(a)', telefono: '3127795410', direccion: 'Diagonal 25 # 8-31' },
  { nombre: 'Julián Castaño', vinculo: 'Padre/Madre', telefono: '3208834172', direccion: 'Calle 10 Sur # 43-22' },
  { nombre: 'Marcela Ríos', vinculo: 'Hijo(a)', telefono: '3176620981', direccion: 'Transversal 39 # 72-15' },
];
const REGIMENES = ['Contributivo', 'Subsidiado'];

export const AREAS_FUNCIONALES = {
  urgencias: { codigo: '01', nombre: 'Urgencias adultos' },
  ambulatorio: { codigo: '03', nombre: 'Consulta externa' },
  hospitalizacion: { codigo: '07', nombre: 'Hospitalización general P4 T1' },
};

export function datosAdministrativos(semilla) {
  const n = Math.abs(Math.trunc(semilla));
  return {
    medicoIngreso: MEDICOS_INGRESO[n % MEDICOS_INGRESO.length],
    acompanante: ACOMPANANTES[n % ACOMPANANTES.length],
    usuarioIngresa: USUARIOS_ADMISION[n % USUARIOS_ADMISION.length],
    // Usuario que registraría el alta (solo se muestra si hay alta).
    usuarioAlta: USUARIOS_ADMISION[(n + 1) % USUARIOS_ADMISION.length],
    regimen: REGIMENES[n % REGIMENES.length],
  };
}
