import { LuUsers } from 'react-icons/lu';
import './HonorariosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  ROLES_HONORARIOS, actualizarFila, formatoCOP, nuevoId, quitarFila, valorPorTiempo,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'rol', label: 'Rol', type: 'select', options: ROLES_HONORARIOS.map((r) => ({ value: r, label: r })) },
  { key: 'nombre', label: 'Profesional' },
  { key: 'registro', label: 'Registro profesional' },
  { key: 'minutos', label: 'Minutos', type: 'number', align: 'right' },
  { key: 'tarifaHora', label: 'Tarifa por hora', type: 'number', align: 'right' },
  { key: 'valor', label: 'Valor', type: 'calc', align: 'right', render: (r) => formatoCOP(valorPorTiempo(r)) },
];

export default function HonorariosSection({ rows, onChange, readOnly, error }) {
  const total = rows.reduce((t, r) => t + valorPorTiempo(r), 0);
  return (
    <SeccionHoja id="hgq-honorarios" icon={LuUsers} titulo="Equipo quirúrgico y honorarios" total={total} error={error}>
      <HojaTabla
        ariaLabel="Honorarios"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('hon'), rol: 'Ayudante', nombre: '', registro: '', minutos: 0, tarifaHora: 180000 }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar profesional"
      />
    </SeccionHoja>
  );
}
