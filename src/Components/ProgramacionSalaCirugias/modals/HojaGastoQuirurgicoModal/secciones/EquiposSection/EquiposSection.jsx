import { LuMonitorCog } from 'react-icons/lu';
import './EquiposSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const esManual = (r) => r.manual === true;

const COLUMNS = [
  { key: 'nombre', label: 'Equipo', placeholder: 'Nombre del equipo', editable: esManual },
  { key: 'tipo', label: 'Tipo', type: 'calc' }, // solo lectura: viene del detalle de la cirugía
  { key: 'identificacion', label: 'Identificación', placeholder: 'Identificación', editable: esManual },
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
          id: nuevoId('eq'), manual: true, nombre: '', tipo: '', identificacion: '', minutos: 0,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar equipo"
      />
    </SeccionHoja>
  );
}
