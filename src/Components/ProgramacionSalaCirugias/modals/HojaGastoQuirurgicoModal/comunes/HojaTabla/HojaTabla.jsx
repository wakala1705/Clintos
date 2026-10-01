'use client';

import { LuPlus, LuTrash2 } from 'react-icons/lu';
import './HojaTabla.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import NumeroStepper from '../NumeroStepper/NumeroStepper';

function Celda({ col, row, editable, base, onChange, patch }) {
  const valor = row[col.key];
  if (col.type === 'calc') {
    return <span className="hgq-static">{col.render ? col.render(row, { patch }) : valor}</span>;
  }
  const esEditable = editable && col.type !== 'calc' && (col.editable ? col.editable(row) : true);
  if (!esEditable) {
    return <span className="hgq-static">{col.render ? col.render(row, { patch }) : (valor === '' || valor === null || valor === undefined ? '—' : valor)}</span>;
  }
  const aria = `${col.label} (${base})`;
  if (col.type === 'select') {
    return (
      <FormSelect
        id={`${base}-${col.key}`}
        value={valor ?? ''}
        onChange={(v) => onChange(col.key, v)}
        options={col.options}
        placeholder={col.placeholder ?? 'Selecciona'}
      />
    );
  }
  if (col.type === 'stepper') {
    return (
      <NumeroStepper
        value={valor}
        min={col.min ?? 0}
        label={aria}
        onChange={(v) => onChange(col.key, v)}
      />
    );
  }
  if (col.type === 'number') {
    return (
      <input
        type="number"
        className="hgq-input hgq-input-num"
        min={col.min ?? 0}
        value={valor ?? ''}
        aria-label={aria}
        onChange={(e) => onChange(col.key, e.target.value === '' ? '' : Number(e.target.value))}
      />
    );
  }
  return (
    <input
      type="text"
      className="hgq-input"
      value={valor ?? ''}
      placeholder={col.placeholder}
      aria-label={aria}
      onChange={(e) => onChange(col.key, e.target.value)}
    />
  );
}

export default function HojaTabla({
  ariaLabel, columns, rows, onChangeRow, onPatchRow, onAddRow, onRemoveRow, canRemove,
  addLabel = 'Agregar fila', emptyLabel = 'Sin registros', readOnly = false,
}) {
  const editable = !readOnly;
  const conAcciones = editable && Boolean(onRemoveRow);
  return (
    <div className="hgq-table-block">
      <div className="hgq-table-wrap">
        <table className="hgq-table" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key} className={c.align === 'right' ? 'hgq-num' : undefined}>{c.label}</th>)}
              {conAcciones && <th className="hgq-col-accion" aria-label="Acciones" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="hgq-empty" colSpan={columns.length + (conAcciones ? 1 : 0)}>{emptyLabel}</td></tr>
            )}
            {rows.map((row, idx) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'hgq-num' : undefined}>
                    <Celda
                      col={c}
                      row={row}
                      editable={editable}
                      base={`${ariaLabel} fila ${idx + 1}`}
                      patch={editable && onPatchRow ? (cambios) => onPatchRow(row.id, cambios) : null}
                      onChange={(campo, valor) => {
                        if (c.toPatch && onPatchRow) onPatchRow(row.id, c.toPatch(valor, row));
                        else onChangeRow(row.id, campo, valor);
                      }}
                    />
                  </td>
                ))}
                {conAcciones && (
                  <td className="hgq-col-accion">
                    {(!canRemove || canRemove(row)) && (
                      <button
                        type="button"
                        className="hgq-row-remove"
                        aria-label={`Quitar fila ${idx + 1} de ${ariaLabel}`}
                        onClick={() => onRemoveRow(row.id)}
                      >
                        <LuTrash2 className="icon" aria-hidden="true" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && onAddRow && (
        <div className="hgq-table-add">
          <Button variant="secondary" size="sm" icon={LuPlus} onClick={onAddRow}>{addLabel}</Button>
        </div>
      )}
    </div>
  );
}
