'use client';

import { useEffect } from 'react';
import './AdmisionDetalleModal.css';
import TriageBadge from '../AdmisionesTable/TriageBadge/TriageBadge';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { ESTADO_LABEL } from '@/hooks/Admisiones/mockAdmisionesData';

// `admision` es la única fuente de verdad de si el modal está abierto —
// mismo patrón que DetalleCitaModal (ProgramarCita): la fila que se
// clickeó (columna "Detalles" o la tarjeta mobile) se guarda en estado en
// Admisiones.jsx y se pasa acá, onClose la vuelve a poner en null.
export default function AdmisionDetalleModal({ admision, onClose }) {
  useEffect(() => {
    if (!admision) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [admision, onClose]);

  if (!admision) return null;

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal">
        <ModalHeader title="Detalle de la admisión" onClose={onClose} />
        <div className="adm-modal-body">
          <div className="adm-detail-top">
            <div>
              <div className="adm-detail-patient">{admision.nombreAfiliado}</div>
              <div className="adm-detail-doc">Documento {admision.documento}</div>
            </div>
            <TriageBadge level={admision.triage} />
          </div>

          <div className="adm-detail-grid">
            <div className="adm-detail-field"><span className="k">N° Admisión</span><span className="v">{admision.numeroAdmision}</span></div>
            <div className="adm-detail-field"><span className="k">Fecha</span><span className="v">{admision.fecha}</span></div>
            <div className="adm-detail-field"><span className="k">Hora</span><span className="v">{admision.hora}</span></div>
            <div className="adm-detail-field"><span className="k">Estado</span><span className="v">{ESTADO_LABEL[admision.estado]}</span></div>
            <div className="adm-detail-field"><span className="k">Atendido</span><span className="v">{admision.atendido ? 'SI' : 'NO'}</span></div>
            <div className="adm-detail-field"><span className="k">Administradora</span><span className="v">{admision.administradora}</span></div>
            <div className="adm-detail-field"><span className="k">Tipo de contrato</span><span className="v">{admision.tipoContrato}</span></div>
            <div className="adm-detail-field"><span className="k">Tipo de admisión</span><span className="v">{admision.tipoAdmision}</span></div>
          </div>
        </div>
        <div className="adm-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
