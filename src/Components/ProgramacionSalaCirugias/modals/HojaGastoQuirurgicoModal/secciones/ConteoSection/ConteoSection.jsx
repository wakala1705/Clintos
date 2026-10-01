import { LuListChecks } from 'react-icons/lu';
import './ConteoSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import Badge from '@/Components/Badge/Badge';
import { actualizarFila, conteoEstado, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const ESTADO = {
  pendiente: { tone: 'neutral', label: 'Pendiente' },
  correcto: { tone: 'success', label: 'Correcto' },
  discrepancia: { tone: 'danger', label: 'Discrepancia' },
};
const esManual = (r) => r.manual;
const COLUMNS = [
  { key: 'item', label: 'Elemento', editable: esManual },
  { key: 'inicial', label: 'Conteo inicial', type: 'number', align: 'right' },
  { key: 'final', label: 'Conteo final', type: 'number', align: 'right' },
  {
    key: 'estado',
    label: 'Estado',
    type: 'calc',
    render: (r) => {
      const e = ESTADO[conteoEstado(r)];
      return <Badge tone={e.tone}>{e.label}</Badge>;
    },
  },
];

export default function ConteoSection({ rows, onChange, readOnly, error }) {
  return (
    <SeccionHoja id="hgq-conteo" icon={LuListChecks} titulo="Conteo quirúrgico" error={error}>
      <HojaTabla
        ariaLabel="Conteo quirúrgico"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('con'), item: '', inicial: '', final: '', manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar elemento"
      />
    </SeccionHoja>
  );
}
