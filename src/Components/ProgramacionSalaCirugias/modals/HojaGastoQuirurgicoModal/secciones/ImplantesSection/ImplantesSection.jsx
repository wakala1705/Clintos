import { LuBone } from 'react-icons/lu';
import './ImplantesSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Implante / material' },
  { key: 'invima', label: 'Registro INVIMA' },
  { key: 'lote', label: 'Lote' },
  { key: 'serie', label: 'Serie' },
  { key: 'proveedor', label: 'Proveedor' },
  { key: 'valor', label: 'Valor', type: 'number', align: 'right' },
];

export default function ImplantesSection({ rows, onChange, readOnly, error }) {
  const total = rows.reduce((t, r) => t + (Number(r.valor) || 0), 0);
  return (
    <SeccionHoja id="hgq-implantes" icon={LuBone} titulo="Implantes y material especial" total={total} error={error}>
      <HojaTabla
        ariaLabel="Implantes"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        emptyLabel="Sin implantes ni material especial."
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('imp'), nombre: '', invima: '', lote: '', serie: '', proveedor: '', valor: 0,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar implante"
      />
    </SeccionHoja>
  );
}
