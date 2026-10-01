import { LuMonitorCog } from 'react-icons/lu';
import './EquiposSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Equipo' },
  { key: 'identificacion', label: 'Identificación' },
  { key: 'minutos', label: 'Tiempo de uso (min)', type: 'stepper', align: 'right' },
];

export default function EquiposSection({ rows, onChange, readOnly }) {
  return (
    <SeccionHoja id="hgq-equipos" icon={LuMonitorCog} titulo="Equipos usados">
      <HojaTabla
        ariaLabel="Equipos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        emptyLabel="Sin equipos registrados."
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('eq'), nombre: '', identificacion: '', minutos: 0,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar equipo"
      />
    </SeccionHoja>
  );
}
