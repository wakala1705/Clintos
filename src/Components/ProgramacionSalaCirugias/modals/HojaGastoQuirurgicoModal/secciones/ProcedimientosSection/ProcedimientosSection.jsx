import { LuScissors } from 'react-icons/lu';
import './ProcedimientosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { VIAS_OPTIONS, actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Las filas del detalle de la cirugía (sin `manual`) muestran el nombre como texto.
const esManual = (r) => r.manual === true;

const COLUMNS = [
  { key: 'nombre', label: 'Procedimiento', placeholder: 'Procedimiento', editable: esManual },
  { key: 'cups', label: 'CUPS', placeholder: 'Código' },
  { key: 'via', label: 'Vía', type: 'select', options: VIAS_OPTIONS },
  { key: 'dxPre', label: 'Dx preoperatorio', placeholder: 'CIE-10' },
  { key: 'dxPos', label: 'Dx posoperatorio', placeholder: 'CIE-10' },
];

export default function ProcedimientosSection({ rows, onChange, readOnly }) {
  return (
    <SeccionHoja flush id="hgq-procedimientos" icon={LuScissors} titulo="Procedimientos realizados">
      <HojaTabla
        ariaLabel="Procedimientos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('proc'), manual: true, nombre: '', cups: '', via: 'unica', dxPre: '', dxPos: '' }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar procedimiento"
      />
    </SeccionHoja>
  );
}
