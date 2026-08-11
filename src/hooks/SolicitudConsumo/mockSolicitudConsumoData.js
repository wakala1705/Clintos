// Datos mock de Solicitud de consumo (sin backend, igual que el resto del
// aplicativo). REPOSICIONES son las reposiciones de bodega que se listan en
// la card maestra; CATALOGO_ARTICULOS es lo que se busca/agrega en el paso 2
// de "Nueva solicitud" (ArticulosModal). tipoArticulo solo queda persistido
// en reposiciones creadas desde el flujo nuevo — las que ya "existían" en el
// mock no lo tienen (ver ArticulosModal, modo edición).

export const TIPOS_ARTICULO = [
  '02 · Materiales e insumos',
  '01 · Dispositivos médicos',
  '03 · Medicamentos',
];

export const CATALOGO_ARTICULOS = [
  { id: 'CT002381', desc: 'Cancellous Crushed/Chips 5 cc (4-10 mm) RE', disp: 0, porVencer: 0, tipo: '01 · Dispositivos médicos' },
  { id: 'CT002382', desc: 'TOOL MR8-10BA50 REF MR8-10BA50 REF.', disp: 0, porVencer: 0, tipo: '01 · Dispositivos médicos' },
  { id: 'CT002383', desc: 'TORNILLO BLOQ CORTICAL CANULADO AU', disp: 0, porVencer: 0, tipo: '01 · Dispositivos médicos' },
  { id: 'CT002384', desc: 'TORNILLO CORTICAL 3.5 X 34 REF. I20313', disp: 0, porVencer: 0, tipo: '01 · Dispositivos médicos' },
  { id: 'CT002385', desc: 'TORNILLO CORTICAL 3.5 X 36 REF. I20315', disp: 0, porVencer: 0, tipo: '01 · Dispositivos médicos' },
  { id: 'DM000009', desc: 'Aguja desechable hipodérmica 18G x 1 1/2', disp: 186, porVencer: 4, tipo: '01 · Dispositivos médicos' },
  { id: 'DM000114', desc: 'Jeringa desechable 10 ml con aguja', disp: 84, porVencer: 2, tipo: '01 · Dispositivos médicos' },
  { id: 'DM000221', desc: 'Sutura absorbible 3-0', disp: 52, porVencer: 0, tipo: '01 · Dispositivos médicos' },
  { id: 'IN000241', desc: 'Guantes de examen nitrilo talla M', disp: 420, porVencer: 0, tipo: '02 · Materiales e insumos' },
  { id: 'IN000318', desc: 'Gasa estéril 10x10 cm paquete x 5', disp: 96, porVencer: 12, tipo: '02 · Materiales e insumos' },
  { id: 'IN000402', desc: 'Esparadrapo hipoalergénico 5 cm', disp: 38, porVencer: 0, tipo: '02 · Materiales e insumos' },
  { id: 'MED000045', desc: 'Acetaminofén 500 mg tableta', disp: 240, porVencer: 10, tipo: '03 · Medicamentos' },
  { id: 'MED000102', desc: 'Solución salina 0.9% 500 ml', disp: 75, porVencer: 5, tipo: '03 · Medicamentos' },
];

export const INITIAL_REPOSICIONES = [
  {
    id: 'REP-000481',
    bodega: 'Consulta externa · Piso 2',
    bodegaDespacha: 'Bodega 03 · Consumo',
    cns: 'CNS-77291', procedencia: 'Manual', usuario: 'M. Hernández',
    fecha: '15/07/2026 · 09:12',
    estado: { text: 'Confirmado', cls: 'green' },
    articulos: [
      { id: 'DM000009', desc: 'Aguja desechable hipodérmica 18G x 1 1/2', cantidad: 30 },
      { id: 'IN000241', desc: 'Guantes de examen nitrilo talla M', cantidad: 80 },
    ],
  },
  {
    id: 'REP-000482',
    bodega: 'Hospitalización · Piso 4',
    bodegaDespacha: 'Bodega 01 · Central',
    cns: 'CNS-77304', procedencia: 'Automática', usuario: 'C. Restrepo',
    fecha: '16/07/2026 · 11:47',
    estado: { text: 'Pendiente por confirmar', cls: 'amber' },
    articulos: [
      { id: 'DM000009', desc: 'Aguja desechable hipodérmica 18G x 1 1/2', cantidad: 40 },
      { id: 'DM000114', desc: 'Jeringa desechable 10 ml con aguja', cantidad: 25 },
      { id: 'IN000241', desc: 'Guantes de examen nitrilo talla M', cantidad: 100 },
      { id: 'IN000318', desc: 'Gasa estéril 10x10 cm paquete x 5', cantidad: 60 },
    ],
  },
  {
    id: 'REP-000483',
    bodega: 'Urgencias',
    bodegaDespacha: 'Bodega 04 · Insumos',
    cns: 'CNS-77310', procedencia: 'Manual', usuario: 'J. Pardo',
    fecha: '16/07/2026 · 14:05',
    estado: { text: 'Pendiente por confirmar', cls: 'amber' },
    articulos: [
      { id: 'DM000114', desc: 'Jeringa desechable 10 ml con aguja', cantidad: 50 },
      { id: 'IN000318', desc: 'Gasa estéril 10x10 cm paquete x 5', cantidad: 120 },
      { id: 'IN000402', desc: 'Esparadrapo hipoalergénico 5 cm', cantidad: 30 },
    ],
  },
  {
    id: 'REP-000484',
    bodega: 'Quirófanos',
    bodegaDespacha: 'Bodega 02 · Farmacia',
    cns: 'CNS-77318', procedencia: 'Automática', usuario: 'M. Hernández',
    fecha: '16/07/2026 · 16:22',
    estado: { text: 'Pendiente por confirmar', cls: 'amber' },
    articulos: [
      { id: 'DM000221', desc: 'Sutura absorbible 3-0', cantidad: 20 },
      { id: 'IN000241', desc: 'Guantes de examen nitrilo talla M', cantidad: 200 },
      { id: 'DM000009', desc: 'Aguja desechable hipodérmica 18G x 1 1/2', cantidad: 60 },
    ],
  },
  {
    id: 'REP-000485',
    bodega: 'UCI Adultos',
    bodegaDespacha: 'Bodega 03 · Consumo',
    cns: 'CNS-77325', procedencia: 'Manual', usuario: 'A. Villegas',
    fecha: '17/07/2026 · 08:03',
    estado: { text: 'Pendiente por confirmar', cls: 'amber' },
    articulos: [
      { id: 'DM000114', desc: 'Jeringa desechable 10 ml con aguja', cantidad: 35 },
      { id: 'IN000318', desc: 'Gasa estéril 10x10 cm paquete x 5', cantidad: 45 },
    ],
  },
  {
    id: 'REP-000486',
    bodega: 'Consulta externa · Piso 1',
    bodegaDespacha: 'Bodega 01 · Central',
    cns: 'CNS-77330', procedencia: 'Automática', usuario: 'C. Restrepo',
    fecha: '17/07/2026 · 08:41',
    estado: { text: 'Confirmado', cls: 'green' },
    articulos: [
      { id: 'IN000241', desc: 'Guantes de examen nitrilo talla M', cantidad: 90 },
      { id: 'DM000009', desc: 'Aguja desechable hipodérmica 18G x 1 1/2', cantidad: 25 },
    ],
  },
  {
    id: 'REP-000487',
    bodega: 'Oncología',
    bodegaDespacha: 'Bodega 03 · Consumo',
    cns: 'CNS-77338', procedencia: 'Manual', usuario: 'J. Pardo',
    fecha: '17/07/2026 · 09:15',
    estado: { text: 'Confirmado', cls: 'green' },
    articulos: [
      { id: 'DM000221', desc: 'Sutura absorbible 3-0', cantidad: 10 },
      { id: 'IN000402', desc: 'Esparadrapo hipoalergénico 5 cm', cantidad: 40 },
      { id: 'IN000318', desc: 'Gasa estéril 10x10 cm paquete x 5', cantidad: 70 },
    ],
  },
];
