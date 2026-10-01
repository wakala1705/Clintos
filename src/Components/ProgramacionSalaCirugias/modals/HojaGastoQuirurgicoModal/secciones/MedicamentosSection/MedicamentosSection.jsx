import { LuPill } from 'react-icons/lu';
import './MedicamentosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  actualizarFila, formatoCOP, nuevoId, quitarFila, valorMedicamento,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Medicamento' },
  { key: 'dosis', label: 'Dosis / vía' },
  { key: 'cantidad', label: 'Cantidad', type: 'number', align: 'right' },
  { key: 'valorUnitario', label: 'Valor unitario', type: 'number', align: 'right' },
  { key: 'total', label: 'Total', type: 'calc', align: 'right', render: (r) => formatoCOP(valorMedicamento(r)) },
];

export default function MedicamentosSection({ rows, onChange, readOnly }) {
  const total = rows.reduce((t, r) => t + valorMedicamento(r), 0);
  return (
    <SeccionHoja id="hgq-medicamentos" icon={LuPill} titulo="Medicamentos y anestésicos" total={total}>
      <HojaTabla
        ariaLabel="Medicamentos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('med'), nombre: '', dosis: '', cantidad: 1, valorUnitario: 0 }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar medicamento"
      />
    </SeccionHoja>
  );
}
