import { LuUsers } from 'react-icons/lu';
import './PersonalSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  ROLES_PERSONAL, actualizarFila, nuevoId, quitarFila,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Las filas del detalle de la cirugía (sin `manual`) muestran rol y profesional como texto.
const esManual = (r) => r.manual === true;

const COLUMNS = [
  { key: 'rol', label: 'Rol', type: 'select', editable: esManual, options: ROLES_PERSONAL.map((r) => ({ value: r, label: r })) },
  { key: 'nombre', label: 'Profesional', placeholder: 'Nombre', editable: esManual },
  { key: 'registro', label: 'Registro profesional', placeholder: 'N° de registro' },
];

export default function PersonalSection({ rows, onChange, readOnly }) {
  return (
    <SeccionHoja flush id="hgq-personal" icon={LuUsers} titulo="Equipo quirúrgico">
      <HojaTabla
        ariaLabel="Equipo quirúrgico"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('per'), manual: true, rol: 'Ayudante', nombre: '', registro: '' }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar profesional"
      />
    </SeccionHoja>
  );
}
