'use client';

import { useEffect, useState } from 'react';
import './IntervencionDetalleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import IntervencionResumen from '../../IntervencionResumen/IntervencionResumen';
import ProcedimientosList from '../../ProcedimientosList/ProcedimientosList';
import ProcedimientoDetalle from '../../ProcedimientoDetalle/ProcedimientoDetalle';
import EmptyState from '../../EmptyState/EmptyState';
import { LuListX, LuStethoscope } from 'react-icons/lu';

// Agrupa los 3 bloques que antes vivían siempre visibles en la página
// principal (Detalle de la intervención/Procedimientos realizados/Detalle
// del procedimiento) -- encargo explícito: se trasladan a un modal extra
// grande (90vw x 90vh, mismo criterio que .bb-modal-card en
// GestionEnfermeria/PanelGeneral/BedBoardModal.css) que se abre desde "Ver
// detalle" en IntervencionesTable, en vez de ocupar espacio permanente en
// la pantalla mientras no hay ninguna intervención bajo consulta.
//
// Procedimientos + Detalle del procedimiento van lado a lado en un split de
// 2 columnas (.hqd-split, ver .css) en vez de apiladas -- encargo explícito
// con una captura de referencia de un formulario legacy (panel de
// "Procedimientos" a la izquierda, tabs "Canasta de Insumos/Pedido a
// Farmacia/Personal Clínico/Equipos" a la derecha). El ancho extra del
// modal (90vw) existe justo para que este split quepa cómodo. El label
// "Procedimientos" de la izquierda reusa las clases .hq-tabs-bar/.hq-tab
// (activo, no clickeable) para alinear su altura con la barra de tabs real
// de la derecha (ProcedimientoDetalle.jsx) -- ver .hqd-split-left en el
// .css para el cursor:default que le quita el afán de botón a ese span.
//
// Vida corta (se monta/desmonta con cada apertura, ver modalIntervencionId
// en HistorialQuirurgico.jsx) -- por eso `selectedProcedimientoId` arranca
// siempre en el primer procedimiento sin necesitar el truco "ajustar estado
// durante el render" que sí hacía falta cuando este contenido vivía
// permanentemente en la página y podía cambiar de intervención sin
// desmontarse.
export default function IntervencionDetalleModal({ intervencion, onClose }) {
  const [selectedProcedimientoId, setSelectedProcedimientoId] = useState(
    intervencion.procedimientos[0]?.id ?? null,
  );

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const procedimientoSeleccionado = intervencion.procedimientos.find((p) => p.id === selectedProcedimientoId) ?? null;

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="modal-card hqd-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hqd-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuStethoscope}
          tone="primary"
          title="Detalle de cirugía"
          titleId="hqd-modal-title"
          onClose={onClose}
        />

        <div className="modal-body hqd-modal-body">
          <section className="hq-card hqd-resumen-card">
            <IntervencionResumen intervencion={intervencion} />
          </section>

          <section className="hq-card hqd-split-card">
            <div className="hqd-split">
              <div className="hqd-split-left">
                <div className="hq-tabs-bar">
                  <span className="hq-tab active">Procedimientos</span>
                </div>
                <ProcedimientosList
                  procedimientos={intervencion.procedimientos}
                  selectedId={selectedProcedimientoId}
                  onSelect={setSelectedProcedimientoId}
                />
              </div>

              <div className="hqd-split-right">
                {procedimientoSeleccionado ? (
                  <ProcedimientoDetalle procedimiento={procedimientoSeleccionado} />
                ) : (
                  <EmptyState icon={LuListX} title="Selecciona un procedimiento para ver su detalle." />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
