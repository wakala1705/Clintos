import { LuReceipt } from 'react-icons/lu';
import './ResumenSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import Badge from '@/Components/Badge/Badge';
import { duracionTexto, resumenRegistro } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const CONTEO = {
  pendiente: { tone: 'neutral', label: 'Pendiente' },
  correcto: { tone: 'success', label: 'Correcto' },
  discrepancia: { tone: 'danger', label: 'Discrepancia' },
};

const COLUMNS = [
  { key: 'concepto', label: 'Concepto' },
  { key: 'detalle', label: 'Registro', type: 'calc', render: (r) => r.detalle },
];

export default function ResumenSection({ hoja }) {
  const r = resumenRegistro(hoja);
  const c = CONTEO[r.conteo];
  const rows = [
    {
      id: 'insumos',
      concepto: 'Insumos',
      detalle: `${r.insumosItems} ítems · ${r.insumosUnidadesUsadas} unidades usadas · ${r.insumosUnidadesDevueltas} devueltas`,
    },
    { id: 'medicamentos', concepto: 'Medicamentos', detalle: `${r.medicamentos} registrados` },
    { id: 'implantes', concepto: 'Implantes', detalle: `${r.implantes} registrados` },
    { id: 'equipos', concepto: 'Equipos usados', detalle: `${r.equipos} registrados` },
    { id: 'conteo', concepto: 'Conteo quirúrgico', detalle: <Badge tone={c.tone}>{c.label}</Badge> },
    { id: 'cirugia', concepto: 'Duración de cirugía', detalle: duracionTexto(r.duraciones.cirugia) },
    { id: 'sala', concepto: 'Ocupación de sala', detalle: duracionTexto(r.duraciones.sala) },
  ];
  return (
    <SeccionHoja id="hgq-resumen" icon={LuReceipt} titulo="Resumen del registro">
      <HojaTabla ariaLabel="Resumen del registro" columns={COLUMNS} rows={rows} readOnly onChangeRow={() => {}} />
    </SeccionHoja>
  );
}
