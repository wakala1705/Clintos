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
// Tabla única (no una card+mini-tabla por ítem): un ítem con >1 lote genera
// una fila por lote, repitiendo código/descripción/estado en cada una.
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
          <div className="mig-confirmar-table-wrap">
            <table className="mig-confirmar-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Ubicación</th>
                  <th>Lote Serie</th>
                  <th>Vence</th>
                  <th className="mig-num">Cantidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resumenItems.map((it) => (
                  it.lotes.length > 0 ? (
                    it.lotes.map((l) => (
                      <tr key={`${it.item}-${l.loteSerie}`}>
                        <td className="mig-confirmar-codigo">{it.codigo}</td>
                        <td className="mig-ellipsis" title={it.descripcion}>{it.descripcion}</td>
                        <td className="mig-ellipsis" title={l.ubicacion}>{l.ubicacion}</td>
                        <td>{l.loteSerie}</td>
                        <td>{l.vence.replaceAll('-', '/')}</td>
                        <td className="mig-num">{l.cantidad}</td>
                        <td className="mig-confirmar-estado">
                          <LuCheck className="icon" aria-hidden="true" />
                          {it.alistada} / {it.esperada}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={it.item}>
                      <td className="mig-confirmar-codigo">{it.codigo}</td>
                      <td className="mig-ellipsis" title={it.descripcion}>{it.descripcion}</td>
                      <td className="mig-confirmar-sin-lotes" colSpan={3}>Sin lotes asignados.</td>
                      <td className="mig-num">—</td>
                      <td className="mig-confirmar-estado">
                        <LuCheck className="icon" aria-hidden="true" />
                        {it.alistada} / {it.esperada}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <span className="mig-confirmar-total">
            {resumenItems.length} {resumenItems.length === 1 ? 'ítem' : 'ítems'} · {totalUnidades} unidades alistadas
          </span>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon={LuThumbsUp} onClick={onConfirmar}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
