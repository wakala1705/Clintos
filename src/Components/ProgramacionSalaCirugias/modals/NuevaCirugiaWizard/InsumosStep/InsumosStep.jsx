'use client';

import { useState } from 'react';
import './InsumosStep.css';
import CatalogoInsumosModal from '../../CatalogoInsumosModal/CatalogoInsumosModal';
import VincularCanastaModal from '../../VincularCanastaModal/VincularCanastaModal';
import { soloNombre } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuCheck, LuLink, LuPackage, LuPencil, LuPlus, LuPrinter, LuScissors, LuTrash2, LuUnlink, LuX,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Paso 3 del wizard "Nueva cirugía" -- NO bloqueante: la canasta se vincula
// acá o después desde el detalle de la cirugía (tab Insumos). "Vincular
// canastas" abre VincularCanastaModal (3 canastas genéricas oncológicas por
// complejidad); al elegir una, sus insumos se copian a `datos.insumos` y
// `datos.canasta` guarda `{ id, nombre }`. Una cirugía lleva una sola
// canasta aunque tenga varios procedimientos. Desde ahí la canasta es
// editable: cantidad inline, eliminar fila y agregar insumo desde
// CatalogoInsumosModal. Sin canasta vinculada (`datos.canasta` null) la
// cirugía se guarda "sin vincular" y NO se pide nada a farmacia (la solicitud
// es un paso aparte). ConfirmacionStep (Paso 5) lee los mismos datos.
// Imprimir sigue oculto por ahora (encargo explícito).
const MOSTRAR_IMPRIMIR = false;

export default function InsumosStep({ datos, onChange }) {
  const canasta = datos.canasta ?? null;
  const insumos = datos.insumos ?? [];
  const [editandoCodigo, setEditandoCodigo] = useState(null);
  const [cantidadEdit, setCantidadEdit] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [vincularAbierto, setVincularAbierto] = useState(false);

  function handleVincular({ id, nombre, items }) {
    onChange('canasta', { id, nombre });
    onChange('insumos', items);
    setEditandoCodigo(null);
  }

  function handleDesvincular() {
    onChange('canasta', null);
    onChange('insumos', null);
    setEditandoCodigo(null);
  }

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
          {MOSTRAR_IMPRIMIR && canasta && (
            <button
              type="button"
              className="ncw-icon-btn"
              onClick={() => window.print()}
              aria-label="Imprimir canasta de insumos"
              title="Imprimir"
            >
              <LuPrinter className="icon" />
            </button>
          )}
          {canasta && (
            <Button type="button" variant="outline" size="sm" icon={LuPlus} onClick={() => setCatalogoAbierto(true)}>
              Agregar insumo
            </Button>
          )}
          <Button type="button" size="sm" icon={LuLink} onClick={() => setVincularAbierto(true)}>
            {canasta ? 'Cambiar canasta' : 'Vincular canastas'}
          </Button>
        </div>
      </div>

      {datos.procedimientos.length > 0 && (
        <div className="is-procedimiento">
          <span className="is-procedimiento-icon" aria-hidden="true"><LuScissors className="icon" /></span>
          <div className="is-procedimiento-text">
            <span className="is-procedimiento-label">
              {datos.procedimientos.length > 1 ? 'Procedimientos de la cirugía' : 'Procedimiento de la cirugía'}
            </span>
            {datos.procedimientos.map((p, i) => (
              <span className="is-procedimiento-nombre" key={i}>{soloNombre(p.idCirugia)}</span>
            ))}
          </div>
        </div>
      )}

      {canasta && (
        <div className="is-canasta">
          <span className="is-canasta-icon" aria-hidden="true"><LuPackage className="icon" /></span>
          <div className="is-canasta-text">
            <span className="is-procedimiento-label">Canasta vinculada</span>
            <span className="is-canasta-nombre">{canasta.nombre}</span>
          </div>
          <button
            type="button"
            className="ncw-icon-btn ncw-icon-btn-danger"
            onClick={handleDesvincular}
            aria-label="Desvincular canasta"
            title="Desvincular canasta"
          >
            <LuUnlink className="icon" />
          </button>
        </div>
      )}

      {!canasta ? (
        <div className="ncw-step-empty">
          Aún no has vinculado una canasta. Puedes hacerlo ahora o después desde el detalle de la cirugía.
        </div>
      ) : insumos.length === 0 ? (
        <div className="ncw-step-empty">La canasta no tiene insumos. Agrega los que necesites.</div>
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

      {vincularAbierto && (
        <VincularCanastaModal
          canastaActualId={canasta?.id ?? null}
          onSelect={handleVincular}
          onClose={() => setVincularAbierto(false)}
        />
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
