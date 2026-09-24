// Variantes de PatientBanner (@/Components/PatientBanner/PatientBanner) —
// cada una fija qué campos lleva la fila 2 (admission-row), en qué orden, y
// si el banner arranca contraído. Así cada pantalla solo pasa sus datos
// (`patient` + `context`) en vez de armar su fila 2 a mano, y dos pantallas
// con la misma variante se ven idénticas (ej. HC Hospitalización y Atención
// de enfermería). Ver AGENTS.md "Banner de paciente".
//
// `fields`: [{ key, label, mask? }] — cada `key` se busca primero en
// `context` y después en `patient`; un campo sin valor se omite. `mask:
// true` lo enmascara junto con nombre/documento cuando se activa el ojo.
// Los extras interactivos (select de Régimen, "Historial de citas", quitar
// paciente, badge de estado, estado vacío) no son parte de la variante:
// dependen de callbacks de la pantalla y se siguen pasando como props.

export const PATIENT_BANNER_VARIANTS = {
  // HC Hospitalización + Atención de enfermería.
  hospitalizacion: {
    defaultCollapsed: true,
    fields: [
      { key: 'numeroAdmision', label: 'N° Admisión' },
      { key: 'fechaIngreso', label: 'Fecha de ingreso' },
      { key: 'cama', label: 'Cama' },
      { key: 'medicoTratante', label: 'Médico tratante' },
      { key: 'diagnostico', label: 'Diagnóstico' },
    ],
  },
  // HC Consulta externa (atención de una cita de la agenda).
  'consulta-externa': {
    defaultCollapsed: true,
    fields: [
      { key: 'cita', label: 'Cita' },
      { key: 'servicio', label: 'Servicio' },
      { key: 'tipoCita', label: 'Tipo cita' },
    ],
  },
  // Asignación de citas.
  citas: {
    defaultCollapsed: false,
    fields: [
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'citasFuturas', label: 'Citas futuras' },
    ],
  },
  // Cargos de una admisión (CargosModal, Admisiones).
  cargos: {
    defaultCollapsed: false,
    fields: [
      { key: 'numeroAdmision', label: 'N° Admisión' },
      { key: 'fechaIngreso', label: 'Fecha de ingreso' },
      { key: 'cama', label: 'Cama' },
      { key: 'idAfiliado', label: 'Id. Afiliado', mask: true },
      { key: 'regimen', label: 'Régimen' },
      { key: 'numeroContrato', label: 'N° Contrato' },
      { key: 'idContrato', label: 'ID Contrato' },
    ],
  },
};

// Sin variante (banner base, ej. Historial quirúrgico): el set fijo de
// campos de admisión de siempre, cada uno solo si la pantalla lo pasa.
export const BASE_FIELDS = PATIENT_BANNER_VARIANTS.cargos.fields;
