'use client';

import { useEffect, useRef, useState } from 'react';
import './VincularCanastaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { CANASTAS_GENERICAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuCheck, LuPackage } from 'react-icons/lu';

// Tono de <Badge> por complejidad de la canasta.
const COMPLEJIDAD_TONE = { Baja: 'success', Media: 'warn', Alta: 'danger' };

// "Vincular canastas" (Paso 3 del wizard "Nueva cirugía" y tab Insumos del
// detalle): elige una de las canastas genéricas (ver CANASTAS_GENERICAS en
// mockCirugiaData.js) y muestra sus insumos antes de confirmar. `onSelect`
// recibe una copia `{ id, nombre, items }` -- la cirugía queda con sus propios
// insumos, editables, sin alterar la canasta genérica. Una cirugía lleva una
// sola canasta (aunque tenga varios procedimientos): vincular otra reemplaza
// la actual (`canastaActualId`, solo para marcarla).
export default function VincularCanastaModal({ canastaActualId = null, onSelect, onClose }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);
  const [seleccionId, setSeleccionId] = useState(canastaActualId);
  const seleccion = CANASTAS_GENERICAS.find((c) => c.id === seleccionId) ?? null;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleVincular() {
    if (!seleccion) return;
    onSelect({
      id: seleccion.id,
      nombre: seleccion.nombre,
      items: seleccion.items.map((i) => ({ ...i })),
    });
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div ref={modalRef} className="modal-card vcm-modal-card" role="dialog" aria-modal="true" aria-labelledby="vcm-title">
        <ModalHeader
          icon={LuPackage}
          tone="primary"
          title="Vincular canasta"
          titleId="vcm-title"
          subtitle="Elige una canasta genérica; podrás ajustar sus insumos después."
          onClose={onClose}
          closeLabel="Cerrar vinculación de canasta"
        />
        <div className="modal-body vcm-body">
          <div className="vcm-options" role="radiogroup" aria-label="Canastas disponibles">
            {CANASTAS_GENERICAS.map((c) => {
              const activa = c.id === seleccionId;
              return (
                <button
                  type="button"
                  key={c.id}
                  role="radio"
                  aria-checked={activa}
                  className={`vcm-option${activa ? ' active' : ''}`}
                  onClick={() => setSeleccionId(c.id)}
                >
                  <span className="vcm-option-top">
                    <Badge tone={COMPLEJIDAD_TONE[c.complejidad]}>{`Complejidad ${c.complejidad.toLowerCase()}`}</Badge>
                    {activa && <LuCheck className="icon vcm-option-check" aria-hidden="true" />}
                  </span>
                  <span className="vcm-option-nombre">{c.nombre}</span>
                  <span className="vcm-option-desc">{c.descripcion}</span>
                  <span className="vcm-option-count">{c.items.length} insumos</span>
                </button>
              );
            })}
          </div>

          <div className="vcm-preview">
            {seleccion ? (
              <>
                <h4 className="vcm-preview-title">Insumos de {seleccion.nombre.toLowerCase()}</h4>
                <div className="vcm-table-wrap">
                  <table className="vcm-table">
                    <thead>
                      <tr><th>Id. Servicio</th><th>Insumo</th><th className="vcm-num">Cantidad</th></tr>
                    </thead>
                    <tbody>
                      {seleccion.items.map((i) => (
                        <tr key={i.codigo}>
                          <td className="vcm-muted">{i.codigo}</td>
                          <td>{i.nombre}</td>
                          <td className="vcm-muted vcm-num">{i.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="vcm-empty">Selecciona una canasta para ver sus insumos.</div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleVincular} disabled={!seleccion}>Vincular canasta</Button>
        </div>
      </div>
    </div>
  );
}
