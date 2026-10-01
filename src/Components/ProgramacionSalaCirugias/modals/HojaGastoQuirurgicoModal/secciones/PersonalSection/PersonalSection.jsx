import { LuUsers } from 'react-icons/lu';
import './PersonalSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  ROLES_PERSONAL, actualizarFila, nuevoId, quitarFila,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'rol', label: 'Rol', type: 'select', options: ROLES_PERSONAL.map((r) => ({ value: r, label: r })) },
  { key: 'nombre', label: 'Profesional' },
  { key: 'registro', label: 'Registro profesional' },
];

export default function PersonalSection({ rows, onChange, readOnly, error }) {
  return (
    <SeccionHoja id="hgq-personal" icon={LuUsers} titulo="Equipo quirúrgico" error={error}>
      <HojaTabla
        ariaLabel="Equipo quirúrgico"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('per'), rol: 'Ayudante', nombre: '', registro: '' }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar profesional"
      />
    </SeccionHoja>
  );
}
