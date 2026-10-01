import { LuPill } from 'react-icons/lu';
import './MedicamentosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const esManual = (r) => r.manual === true;

const COLUMNS = [
  { key: 'nombre', label: 'Medicamento', placeholder: 'Medicamento', editable: esManual },
  { key: 'dosis', label: 'Dosis / vía', placeholder: 'Dosis / vía' },
  { key: 'cantidad', label: 'Cantidad', type: 'stepper', align: 'right' },
];

export default function MedicamentosSection({ rows, onChange, readOnly }) {
  return (
    <SeccionHoja id="hgq-medicamentos" icon={LuPill} titulo="Medicamentos y anestésicos">
      <HojaTabla
        ariaLabel="Medicamentos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('med'), manual: true, nombre: '', dosis: '', cantidad: 1 }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar medicamento"
      />
    </SeccionHoja>
  );
}
