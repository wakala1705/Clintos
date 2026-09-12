'use client';

import { useState } from 'react';
import './EditarLoteModal.css';
import { LuCheck, LuPackage } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';

function Field({ label, value, tone }) {
  return (
    <div className={`mig-editar-lote-field${tone ? ` tone-${tone}` : ''}`}>
      <span className="mig-editar-lote-label">{label}</span>
      <span className="mig-editar-lote-value">{value}</span>
    </div>
  );
}

// Modal "Editar lote" -- réplica de la ventana legacy "Record Will Be
// Changed" (edición de un lote de "Artículos disponibles para el código"),
// disparada por el botón lápiz de la columna Acciones y por doble clic en la
// fila (encargo explícito) -- mismo patrón que MovimientosGrid.jsx ->
// AlistarPedidoModal: el clic simple de esa misma secuencia ya deja la fila
// seleccionada antes de que dispare el dblclick, sin lógica extra (ver
// LotesDisponiblesTable.jsx). Todos los campos son de solo lectura salvo
// "Cantidad" (único encargo explícito de campo editable) -- por eso van como
// texto simple (mig-editar-lote-field), no <input disabled>: son datos de
// contexto del lote, no un formulario real. "Cnt. Pendiente" se deriva de
// esperada-cantidad, no es un campo propio del mock. Sin pestañas: la
// referencia legacy solo tenía "1) General" (mismo criterio que
// MovimientoDetalleModal/AlistarPedidoModal: una pestaña única se aplana).
// "Guardar" simula la persistencia (encargo explícito "que se vea reflejado
// en la tabla") -- llama a onSave con la cantidad editada; LotesDisponiblesTable
// la aplica a su copia local del lote (ver ese componente), no hay backend
// real detrás.
export default function EditarLoteModal({ lote, itemLabel, onClose, onSave }) {
  const [cantidad, setCantidad] = useState(lote?.cantidad ?? 0);

  // Reinicia el borrador si se abre un lote distinto sin desmontar el modal
  // -- mismo patrón "ajuste de estado durante el render" que AlistarPedidoModal.jsx.
  const [lastLoteSerie, setLastLoteSerie] = useState(lote?.loteSerie ?? null);
  if ((lote?.loteSerie ?? null) !== lastLoteSerie) {
    setLastLoteSerie(lote?.loteSerie ?? null);
    setCantidad(lote?.cantidad ?? 0);
  }

  if (!lote) return null;

  const pendiente = Math.max(0, lote.esperada - lote.cantidad);

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-editar-lote-modal" role="dialog" aria-modal="true" aria-labelledby="mig-editar-lote-title">
        <ModalHeader
          icon={LuPackage}
          title="Editar lote"
          titleId="mig-editar-lote-title"
          subtitle={`${lote.trans} · ${lote.noDocumento}`}
          onClose={onClose}
          trailing={<span className="mig-editar-lote-item">Item: {itemLabel}</span>}
        />

        <div className="modal-body mig-editar-lote-body">
          <div className="mig-editar-lote-grid">
            <Field label="Id Sede" value={lote.idSede} />
            <Field label="Id.Bdg" value={lote.bdg} />
            <Field label="Ubicación" value={lote.ubicacion} />
            <Field label="Lote / Serie" value={lote.loteSerie} />
            <Field label="Id. Artículo" value={`${lote.generico}-${itemLabel}`} />
            <Field label="Id. Genérico" value={lote.generico} />
            <Field label="Lote" value={lote.lote} />
            <Field label="Vencimiento" value={lote.vence.replaceAll('-', '/')} />
            <Field label="Stock Actual" value={lote.stock.toFixed(2)} tone="stock" />
          </div>

          <div className="mig-editar-lote-descripcion">{lote.descripcion}</div>

          <div className="mig-editar-lote-grid mig-editar-lote-cantidades">
            <Field label="Cnt. Esperada" value={lote.esperada.toFixed(2)} tone="esperada" />
            <Field label="Cnt. Pendiente" value={pendiente.toFixed(2)} tone="pendiente" />
            <div className="mig-editar-lote-field tone-cantidad">
              <label htmlFor="mig-editar-lote-cantidad" className="mig-editar-lote-label">Cantidad</label>
              <input
                id="mig-editar-lote-cantidad"
                type="number"
                className="mig-editar-lote-input"
                value={cantidad}
                min={0}
                step="0.01"
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
            <Field label="Cnt. Comprometida" value={lote.comprometida.toFixed(2)} tone="comprometida" />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon={LuCheck} onClick={() => onSave(Number(cantidad) || 0)}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
