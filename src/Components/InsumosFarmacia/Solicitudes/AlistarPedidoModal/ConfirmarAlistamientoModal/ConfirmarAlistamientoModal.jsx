'use client';

import './ConfirmarAlistamientoModal.css';
import { LuCheck, LuClipboardCheck, LuThumbsUp } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';

// Paso de revisión antes del Confirmar real (encargo explícito) -- se monta
// sobre AlistarPedidoModal (mismo patrón de apilado que EditarLoteModal:
// otro .modal-overlay más, sin z-index propio porque el orden en el DOM ya
// lo pone encima). Solo se llega acá cuando `puedeConfirmar` ya dio true en
// AlistarPedidoModal.jsx, así que todos los ítems que se listan están
// completos por construcción -- por eso el check siempre sale verde, no es
// un semáforo con estado real todavía.
// "Cancelar" no deshace nada: solo cierra este modal y vuelve a
// AlistarPedidoModal tal cual estaba (el reparto sigue en cantidadOverrides,
// ahí arriba). "Confirmar" ejecuta el `onConfirmar` real (ver
// AlistarPedidoModal.jsx) -- este componente no sabe nada de mock/estado
// global, solo pinta `resumenItems` y delega los dos botones hacia arriba.
export default function ConfirmarAlistamientoModal({
  movimiento, resumenItems, onClose, onConfirmar,
}) {
  const totalUnidades = resumenItems.reduce((acc, it) => acc + it.alistada, 0);

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-confirmar-modal" role="dialog" aria-modal="true" aria-labelledby="mig-confirmar-title">
        <ModalHeader
          icon={LuClipboardCheck}
          tone="primary"
          title="Confirmar alistamiento"
          titleId="mig-confirmar-title"
          subtitle={`${movimiento.trns.toUpperCase()} · ${movimiento.consecutivo}`}
          onClose={onClose}
        />

        <div className="modal-body mig-confirmar-body">
          {resumenItems.map((it) => (
            <div className="mig-confirmar-item" key={it.item}>
              <div className="mig-confirmar-item-header">
                <div className="mig-confirmar-item-info">
                  <span className="mig-confirmar-item-codigo">{it.codigo}</span>
                  <span className="mig-confirmar-item-descripcion" title={it.descripcion}>{it.descripcion}</span>
                </div>
                <div className="mig-confirmar-item-cantidades">
                  <LuCheck className="icon" aria-hidden="true" />
                  {it.alistada.toFixed(2)} / {it.esperada.toFixed(2)}
                </div>
              </div>

              {it.lotes.length > 0 ? (
                <table className="mig-confirmar-lotes-table">
                  <thead>
                    <tr>
                      <th>Ubicación</th>
                      <th>Lote Serie</th>
                      <th>Vence</th>
                      <th className="mig-num">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {it.lotes.map((l) => (
                      <tr key={l.loteSerie}>
                        <td className="mig-ellipsis" title={l.ubicacion}>{l.ubicacion}</td>
                        <td>{l.loteSerie}</td>
                        <td>{l.vence.replaceAll('-', '/')}</td>
                        <td className="mig-num">{l.cantidad.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="mig-confirmar-sin-lotes">Sin lotes asignados.</div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <span className="mig-confirmar-total">
            {resumenItems.length} {resumenItems.length === 1 ? 'ítem' : 'ítems'} · {totalUnidades.toFixed(2)} unidades alistadas
          </span>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon={LuThumbsUp} onClick={onConfirmar}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
