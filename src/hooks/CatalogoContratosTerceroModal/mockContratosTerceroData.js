// Catálogo de contratos de un tercero (aseguradora/EPS) que alimenta
// @/Components/CatalogoContratosTerceroModal ("Catálogo de contratos").
// Fechas ISO (YYYY-MM-DD); la UI las muestra como DD/MM/AAAA.
export const CONTRATOS_TERCERO_CATALOGO = [
  {
    id: 340,
    noContrato: 'PRUEBA123458',
    vigenciaDesde: '2024-05-01',
    vigenciaHasta: '2030-12-31',
    tipo: 'EPS',
    tipoDescripcion: 'Empresa Promotora de Salud Contributiva',
    regimen: 'Contributivo',
    descripcion: 'NUEVA EPS CONT (VIG 01.05.2024 - 31.12.2030)',
  },
  {
    id: 518,
    noContrato: '23',
    vigenciaDesde: '2025-01-01',
    vigenciaHasta: '2026-12-31',
    tipo: 'EPSS',
    tipoDescripcion: 'Empresa Promotora de Salud Subsidiada',
    regimen: 'Subsidiado',
    descripcion: 'NUEVA EPS UNICIA PRUEBA (VIG 01.01.2025 - 31.12.2026)',
  },
];
