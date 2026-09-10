'use client';

import { useEffect } from 'react';
import './MovimientoDetalleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import MovimientoItemsTable from './MovimientoItemsTable/MovimientoItemsTable';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuArrowRightLeft, LuEye, LuRepeat } from 'react-icons/lu';

// Mismo label que ESTADO_BADGE en MovimientosGrid.jsx, duplicado a propósito
// (texto plano acá, sin tono/Badge -- encargo explícito del resumen de
// abajo) -- mismo criterio que TIPO_LABEL/CLASE_LABEL en
// FacturaDetalleModalClasico.jsx.
const ESTADO_LABEL = {
  confirmado: 'Confirmado',
  'sin-confirmar': 'Sin Confirmar',
  anulado: 'Anulado',
};

function Field({ label, value }) {
  return (
    <div className="mig-field">
      <span className="mig-field-label">{label}</span>
      <span className="mig-field-value">{value}</span>
    </div>
  );
}

// Modal grande de detalle (encargo explícito), disparado por "Ver detalle"
// en MovimientoRowMenu (columna Acciones de MovimientosGrid) -- antes vivía
// siempre visible debajo de la grilla como MovimientoDetalle. Mismo patrón
// .modal-overlay/.modal extragrande que FacturaDetalleModalClasico (ver
// Solicitudes/shared/shared.css), `movimiento` null = cerrado. El bloque
// "mig-tabs-bar" (Detalle/Línea/Prefijos) se eliminó (encargo explícito):
// "Línea"/"Prefijos" eran placeholders sin contenido propio, así que en su
// lugar va un resumen en texto plano de los mismos datos que ya muestra la
// tabla maestra (MovimientosGrid) -- mismo patrón Field/fvcd-compact-fields
// que FacturaDetalleModalClasico.jsx.
export default function MovimientoDetalleModal({ movimiento, onClose }) {
  useEffect(() => {
    if (!movimiento) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [movimiento, onClose]);

  if (!movimiento) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-detalle-modal" role="dialog" aria-modal="true" aria-labelledby="mig-detalle-title">
        <ModalHeader
          title={`Detalle del movimiento ${movimiento.consecutivo}`}
          titleId="mig-detalle-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="mig-resumen">
            <Field label="Estado" value={ESTADO_LABEL[movimiento.estado] ?? movimiento.estado} />
            <Field label="Consecutivo" value={movimiento.consecutivo} />
            <Field label="No. Admisión" value={movimiento.noAdmision} />
            <Field label="No. Prestación" value={movimiento.noPrestacion} />
            <Field label="Fecha" value={formatFecha(movimiento.fecha)} />
            <Field label="Hora" value={movimiento.hora} />
            <Field label="Procedencia" value={movimiento.procedencia} />
            <Field label="Movimiento" value={movimiento.movimiento} />
            <Field label="Paciente" value={movimiento.paciente} />
            <Field label="Solicitante" value={movimiento.solicitante} />
            <Field label="Ubicación" value={movimiento.ubicacion} />
            <Field label="Id. Contrato" value={movimiento.idContrato} />
          </div>

          <div className="mig-items-card">
            <MovimientoItemsTable key={movimiento.id} articulos={movimiento.articulos} />
          </div>

          <div className="mig-meta-bar">
            <div className="mig-meta-item">
              <span className="lbl">Fecha Contable:</span>
              <span className="val mig-meta-link">{formatFecha(movimiento.fechaContable)}</span>
            </div>
            <div className="mig-meta-item">
              <span className="lbl">Confirmó:</span>
              <span className="val">{movimiento.confirmo || '—'}</span>
            </div>
            <div className="mig-meta-item">
              <span className="lbl">Fecha:</span>
              <span className="val">{formatFecha(movimiento.fecha)}</span>
            </div>
            <label className="mig-meta-checkbox">
              <input type="checkbox" defaultChecked={movimiento.permitirEditarCostos} />
              Permitir editar costos?
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary-accent" icon={LuRepeat}>Cambiar</Button>
          <Button variant="secondary-accent" icon={LuEye}>Ver detalle</Button>
          <Button variant="secondary-accent" icon={LuArrowRightLeft}>Movimiento</Button>
        </div>
      </div>
    </div>
  );
}
