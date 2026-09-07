'use client';

import { useState } from 'react';
import './InsumosStep.css';
import CatalogoInsumosModal from '../../CatalogoInsumosModal/CatalogoInsumosModal';
import { agregarInsumosPrecargados } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuCheck, LuPencil, LuPlus, LuPrinter, LuTrash2, LuX,
} from 'react-icons/lu';

// Paso 3 del wizard "Nueva cirugía" -- arranca con la canasta consolidada de
// los procedimientos agregados en el Paso 2 (mismo cálculo que el preview
// por card de ProcedimientosStep, ver agregarInsumosPrecargados en
// mockCirugiaData.js), pero de acá en más pasa a ser editable (editar
// cantidad inline, eliminar fila, agregar un insumo nuevo desde
// CatalogoInsumosModal). `datos.insumos` vive en el wizard (no local a este
// componente, ver datosIniciales en NuevaCirugiaWizard.jsx) para que
// ConfirmacionStep (Paso 4) pueda mostrar la canasta ya editada -- mientras
// sea `null` (todavía no se inicializó) se muestra el cálculo derivado de
// agregarInsumosPrecargados sin escribirlo; recién la primera edición real
// (editar/eliminar/agregar) lo vuelve estado propio vía onChange.
export default function InsumosStep({ datos, onChange }) {
  const insumos = datos.insumos ?? agregarInsumosPrecargados(datos.procedimientos);
  const [editandoCodigo, setEditandoCodigo] = useState(null);
  const [cantidadEdit, setCantidadEdit] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);

  function handleEliminar(codigo) {
    onChange('insumos', insumos.filter((i) => i.codigo !== codigo));
    if (editandoCodigo === codigo) setEditandoCodigo(null);
  }

  function handleEmpezarEdicion(item) {
    setEditandoCodigo(item.codigo);
    setCantidadEdit(String(item.cantidad));
  }

  function handleGuardarEdicion(codigo) {
    const cantidad = Number(cantidadEdit);
    if (Number.isFinite(cantidad) && cantidad > 0) {
      onChange('insumos', insumos.map((i) => (i.codigo === codigo ? { ...i, cantidad } : i)));
    }
    setEditandoCodigo(null);
  }

  // Si el insumo elegido ya está en la canasta, suma 1 en vez de duplicar la
  // fila -- mismo criterio que agregarInsumosPrecargados (una fila por
  // código).
  function handleAgregarInsumo(insumo) {
    const existente = insumos.find((i) => i.codigo === insumo.codigo);
    if (existente) {
      onChange('insumos', insumos.map((i) => (i.codigo === insumo.codigo ? { ...i, cantidad: i.cantidad + 1 } : i)));
    } else {
      onChange('insumos', [...insumos, { ...insumo, cantidad: 1 }]);
    }
  }

  return (
    <div className="is-step">
      <div className="is-header">
        <h4 className="ncw-section-title">Canasta de insumos</h4>
        <div className="is-header-actions">
          <button
            type="button"
            className="ncw-icon-btn"
            onClick={() => window.print()}
            aria-label="Imprimir canasta de insumos"
            title="Imprimir"
          >
            <LuPrinter className="icon" />
          </button>
          <button
            type="button"
            className="ncw-icon-btn ncw-icon-btn-primary"
            onClick={() => setCatalogoAbierto(true)}
            aria-label="Agregar insumo"
            title="Agregar insumo"
          >
            <LuPlus className="icon" />
          </button>
        </div>
      </div>

      {insumos.length === 0 ? (
        <div className="ncw-step-empty">Aún no hay insumos precargados.</div>
      ) : (
        <div className="ncw-insumos-table-wrap">
          <table className="ncw-insumos-table">
            <thead>
              <tr>
                <th>Id. Servicio</th>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th className="ncw-th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((i) => {
                const editando = editandoCodigo === i.codigo;
                return (
                  <tr key={i.codigo}>
                    <td className="cell-muted">{i.codigo}</td>
                    <td className="cell-primary">{i.nombre}</td>
                    <td className="cell-muted">
                      {editando ? (
                        <input
                          type="number"
                          min="1"
                          className="is-cantidad-input"
                          value={cantidadEdit}
                          onChange={(e) => setCantidadEdit(e.target.value)}
                          aria-label={`Cantidad de ${i.nombre}`}
                          autoFocus
                        />
                      ) : i.cantidad}
                    </td>
                    <td>
                      <div className="ncw-insumos-actions">
                        {editando ? (
                          <>
                            <button
                              type="button"
                              className="ncw-icon-btn"
                              onClick={() => handleGuardarEdicion(i.codigo)}
                              aria-label="Guardar cantidad"
                              title="Guardar"
                            >
                              <LuCheck className="icon" />
                            </button>
                            <button
                              type="button"
                              className="ncw-icon-btn"
                              onClick={() => setEditandoCodigo(null)}
                              aria-label="Cancelar edición"
                              title="Cancelar"
                            >
                              <LuX className="icon" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="ncw-icon-btn ncw-icon-btn-primary"
                              onClick={() => handleEmpezarEdicion(i)}
                              aria-label={`Editar cantidad de ${i.nombre}`}
                              title="Editar cantidad"
                            >
                              <LuPencil className="icon" />
                            </button>
                            <button
                              type="button"
                              className="ncw-icon-btn ncw-icon-btn-danger"
                              onClick={() => handleEliminar(i.codigo)}
                              aria-label={`Eliminar ${i.nombre}`}
                              title="Eliminar insumo"
                            >
                              <LuTrash2 className="icon" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {catalogoAbierto && (
        <CatalogoInsumosModal
          onSelect={handleAgregarInsumo}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}
    </div>
  );
}
