'use client';

import './CamaHistorialModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { formatFechaHora, generarHistorial } from '@/hooks/GestionCamas/mockCamasAdminData';
import { LuHistory } from 'react-icons/lu';

// Historial COMPLETO de una cama puntual (encargo, sección 9: "Ver
// historial" del menú "⋯" y CTA "Ver historial completo" del detalle) —
// mismos eventos que el bloque "Historial reciente" de CamaDetailModal,
// sin recortar a 3 acá.
export default function CamaHistorialModal({ cama, onClose }) {
  if (!cama) return null;
  const historial = generarHistorial(cama);

  return (
    <div className="modal-overlay open">
      <div className="modal-card cba-historial-modal-card" role="dialog" aria-modal="true" aria-labelledby="cba-historial-title">
        <ModalHeader
          icon={LuHistory}
          tone="primary"
          title="Historial de cama"
          subtitle={cama.codigo}
          titleId="cba-historial-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <ul className="cba-historial-list">
            {historial.map((ev) => (
              <li key={ev.id} className="cba-historial-item">
                <div className="cba-historial-icon"><LuHistory className="icon" aria-hidden="true" /></div>
                <div className="cba-historial-body">
                  <span className="cba-historial-title">{ev.titulo}</span>
                  <span className="cba-historial-meta">{ev.usuario} · {formatFechaHora(ev.fecha)}</span>
                  {ev.motivo && <span className="cba-historial-motivo">{ev.motivo}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
