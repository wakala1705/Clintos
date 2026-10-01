import { LuReceipt } from 'react-icons/lu';
import './ResumenSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { formatoCOP } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'categoria', label: 'Categoría' },
  { key: 'valor', label: 'Subtotal', type: 'calc', align: 'right', render: (r) => formatoCOP(r.subtotal) },
];

export default function ResumenSection({ totales }) {
  const rows = [
    { id: 'honorarios', categoria: 'Honorarios', subtotal: totales.honorarios },
    { id: 'insumos', categoria: 'Insumos y materiales', subtotal: totales.insumos },
    { id: 'medicamentos', categoria: 'Medicamentos y anestésicos', subtotal: totales.medicamentos },
    { id: 'implantes', categoria: 'Implantes y material especial', subtotal: totales.implantes },
    { id: 'equipos', categoria: 'Equipos', subtotal: totales.equipos },
    { id: 'derechos', categoria: 'Derechos de sala', subtotal: totales.derechosSala },
    { id: 'total', categoria: 'Total de la hoja', subtotal: totales.total },
  ];
  return (
    <SeccionHoja id="hgq-resumen" icon={LuReceipt} titulo="Resumen">
      <HojaTabla ariaLabel="Resumen de gastos" columns={COLUMNS} rows={rows} readOnly onChangeRow={() => {}} />
    </SeccionHoja>
  );
}
