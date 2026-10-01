'use client';

import { useState } from 'react';
import { LuCheckCheck, LuPackage } from 'react-icons/lu';
import './InsumosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import {
  conciliarTodos, devueltoInsumo, insumosPorConciliar, marcarInsumo, nuevoId, quitarFila,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Los insumos que vienen de la canasta no se renombran ni cambian su cantidad
// entregada (eso lo fijó farmacia): solo se concilia lo usado. Los agregados
// a mano (`manual`) sí son totalmente editables.
const esManual = (r) => r.manual;

const COLUMNS = [
  { key: 'nombre', label: 'Insumo', editable: esManual },
  { key: 'entregado', label: 'Entregado', type: 'stepper', align: 'right', editable: esManual },
  // Editar la cantidad a mano concilia la fila en el mismo parche.
  { key: 'usado', label: 'Usado', type: 'stepper', align: 'right', toPatch: (valor) => ({ usado: valor, conciliado: true }) },
  { key: 'devuelto', label: 'Devuelto', type: 'calc', align: 'right', render: (r) => devueltoInsumo(r) },
  { key: 'lote', label: 'Lote', placeholder: 'Opcional' },
  {
    key: 'estado',
    label: 'Estado',
    type: 'calc',
    render: (r) => (r.conciliado === false
      ? <Badge tone="warn">Por conciliar</Badge>
      : <Badge tone="success">Conciliado</Badge>),
  },
  {
    key: 'atajos',
    label: 'Atajos',
    type: 'calc',
    render: (r, { patch }) => {
      if (r.manual || !patch) return null;
      return (
        <div className="hgq-atajos">
          <Button
            variant="outline"
            size="sm"
            className="hgq-atajo"
            aria-label={`Marcar todo usado: ${r.nombre}`}
            onClick={() => patch(marcarInsumo(r, 'todo'))}
          >
            Todo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hgq-atajo"
            aria-label={`Marcar nada usado: ${r.nombre}`}
            onClick={() => patch(marcarInsumo(r, 'nada'))}
          >
            Nada
          </Button>
        </div>
      );
    },
  },
];

export default function InsumosSection({ rows, onChange, readOnly, error }) {
  const [filtro, setFiltro] = useState('todos');
  const pendientes = insumosPorConciliar(rows);
  const visibles = filtro === 'pendientes' ? rows.filter((r) => r.conciliado === false) : rows;
  const vacioPorFiltro = filtro === 'pendientes' && visibles.length === 0 && rows.length > 0;

  return (
    <SeccionHoja
      id="hgq-insumos"
      icon={LuPackage}
      titulo="Insumos y materiales"
      error={error}
      aviso={pendientes > 0 ? `${pendientes} por conciliar` : null}
    >
      <div className="hgq-insumos-bar">
        <SegmentedFilterBar
          ariaLabel="Filtrar insumos"
          value={filtro}
          onChange={setFiltro}
          options={[
            { value: 'todos', label: 'Todos', count: rows.length },
            { value: 'pendientes', label: 'Por conciliar', count: pendientes },
          ]}
        />
        <Button
          variant="secondary"
          icon={LuCheckCheck}
          className="hgq-bar-confirmar"
          disabled={readOnly || pendientes === 0}
          onClick={() => onChange(conciliarTodos(rows))}
        >
          Confirmar todos como usados
        </Button>
      </div>
      <HojaTabla
        ariaLabel="Insumos"
        columns={COLUMNS}
        rows={visibles}
        readOnly={readOnly}
        emptyLabel={vacioPorFiltro ? 'Todo conciliado.' : 'Aún no hay insumos entregados por farmacia. Agrega los que se usaron.'}
        onChangeRow={(id, campo, valor) => onChange(rows.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)))}
        onPatchRow={(id, cambios) => onChange(rows.map((r) => (r.id === id ? { ...r, ...cambios } : r)))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('ins'), nombre: '', entregado: 0, usado: 1, lote: '', conciliado: true, manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar insumo no contemplado"
      />
    </SeccionHoja>
  );
}
