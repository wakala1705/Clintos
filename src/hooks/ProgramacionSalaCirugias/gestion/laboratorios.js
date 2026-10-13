// Lógica pura de "Vincular resultados" del paso Laboratorios del chequeo de
// Gestión de cirugías (simulado): los resultados no se cargan a mano, se toman
// de los que ya están registrados en la sección Laboratorios de una EVAPRE del
// paciente. Sin React ni fecha del sistema.
import { fechaCorta, fechaISODeRegistro } from './valoracion.js';

// Resultados con valor de un registro EVAPRE. `campos` es la lista
// [{ key, label }] de los campos de laboratorio de la plantilla (ver
// CAMPOS_LABORATORIO_EVAPRE); se omiten los vacíos.
export function resultadosDeEvapre(registro, campos) {
  const valores = registro.contenido?.valores ?? {};
  return campos
    .filter((c) => typeof valores[c.key] === 'string' && valores[c.key].trim())
    .map((c) => ({ key: c.key, label: c.label, valor: valores[c.key].trim() }));
}

// Datos a adjuntar desde una EVAPRE, o null si no trae ningún resultado.
export function datosLaboratorioDesdeEvapre(registro, campos) {
  const resultados = resultadosDeEvapre(registro, campos);
  if (resultados.length === 0) return null;
  return {
    fecha: fechaISODeRegistro(registro.fecha),
    evapre: { id: registro.id, numero: registro.numero },
    resultados,
  };
}

// Devuelve una solicitud nueva con el paso `clave` ('laboratorios' | 'imagenes')
// completo. `registro` guarda lo vinculado para "Ver resultados".
export function aplicarResultados(solicitud, clave, datos) {
  const unidad = clave === 'imagenes' ? 'estudios de imágenes' : 'registros de laboratorio';
  return {
    ...solicitud,
    checklist: {
      ...solicitud.checklist,
      [clave]: {
        ...solicitud.checklist[clave],
        estado: 'ok',
        detalle: `Resultados vinculados de la EVAPRE N° ${datos.evapre.numero} (${fechaCorta(datos.fecha)}): ${datos.resultados.length} ${unidad}.`,
        registro: { ...datos },
      },
    },
  };
}

export function aplicarLaboratorios(solicitud, datos) {
  return aplicarResultados(solicitud, 'laboratorios', datos);
}
