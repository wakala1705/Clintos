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
const enDiscrepancia = (r) => conteoEstado(r) === 'discrepancia';
const COLUMNS = [
  { key: 'item', label: 'Elemento', placeholder: 'Elemento', editable: esManual },
  { key: 'inicial', label: 'Conteo inicial', type: 'stepper', align: 'right' },
  { key: 'previoCierre', label: 'Previo a cierre (opcional)', type: 'stepper', align: 'right' },
  { key: 'final', label: 'Conteo final', type: 'stepper', align: 'right' },
  {
    key: 'estado',
    label: 'Estado',
    type: 'calc',
    render: (r) => {
      const e = ESTADO[conteoEstado(r)];
      return <Badge tone={e.tone}>{e.label}</Badge>;
    },
  },
  {
    key: 'nota',
    label: 'Nota',
    placeholder: 'Documenta la discrepancia',
    editable: enDiscrepancia,
    render: (r) => (r.nota?.trim() ? r.nota : '—'),
  },
];

export default function ConteoSection({ rows, onChange, readOnly }) {
  const hayDiscrepancia = rows.some(enDiscrepancia);
  return (
    <SeccionHoja id="hgq-conteo" icon={LuListChecks} titulo="Conteo quirúrgico">
      {hayDiscrepancia && (
        <div className="hgq-conteo-alerta" role="alert">
          Discrepancia en el conteo: documenta una nota para poder cerrar la hoja.
        </div>
      )}
      <HojaTabla
        ariaLabel="Conteo quirúrgico"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('con'), item: '', inicial: '', previoCierre: '', final: '', nota: '', manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar elemento"
      />
    </SeccionHoja>
  );
}
