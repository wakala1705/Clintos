import { LuPackage } from 'react-icons/lu';
import './InsumosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  actualizarFila, devueltoInsumo, formatoCOP, nuevoId, quitarFila, valorInsumo,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Los insumos que vienen de la canasta no se renombran ni cambian su cantidad
// entregada (eso lo fijó farmacia): solo se concilia lo usado. Los agregados
// a mano (`manual`) sí son totalmente editables.
const esManual = (r) => r.manual;
const COLUMNS = [
  { key: 'nombre', label: 'Insumo', editable: esManual },
  { key: 'entregado', label: 'Entregado', type: 'number', align: 'right', editable: esManual },
  { key: 'usado', label: 'Usado', type: 'number', align: 'right' },
  { key: 'devuelto', label: 'Devuelto', type: 'calc', align: 'right', render: (r) => devueltoInsumo(r) },
  { key: 'valorUnitario', label: 'Valor unitario', type: 'number', align: 'right', editable: esManual },
  { key: 'total', label: 'Total', type: 'calc', align: 'right', render: (r) => formatoCOP(valorInsumo(r)) },
];

export default function InsumosSection({ rows, onChange, readOnly, error }) {
  const total = rows.reduce((t, r) => t + valorInsumo(r), 0);
  return (
    <SeccionHoja id="hgq-insumos" icon={LuPackage} titulo="Insumos y materiales" total={total} error={error}>
      <HojaTabla
        ariaLabel="Insumos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        emptyLabel="Aún no hay insumos entregados por farmacia. Agrega los que se usaron."
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('ins'), nombre: '', entregado: 0, usado: 1, valorUnitario: 0, manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar insumo no contemplado"
      />
    </SeccionHoja>
  );
}
