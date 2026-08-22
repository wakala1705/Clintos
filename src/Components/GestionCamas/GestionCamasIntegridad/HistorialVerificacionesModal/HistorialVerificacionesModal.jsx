'use client';

import './HistorialVerificacionesModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { formatFechaHora } from '@/hooks/GestionCamas/mockIntegridadData';
import { LuHistory } from 'react-icons/lu';

// CTA "Ver historial de verificaciones" del header (encargo, sección 13) —
// cada corrida de "Verificar ahora" queda acá (ver handleVerificar en
// GestionCamasIntegridad.jsx), complementando la auditoría general del
// módulo sin duplicar la tabla de Auditoría/Historial del sidebar.
export default function HistorialVerificacionesModal({ historial, onClose }) {
  return (
    <div className="modal-overlay open">
      <div className="modal-card cbi-hv-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbi-hv-title">
        <ModalHeader
          icon={LuHistory}
          tone="primary"
          title="Historial de verificaciones"
          titleId="cbi-hv-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ejecutada por</th>
                  <th>Encontradas</th>
                  <th>Corregidas</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((v) => (
                  <tr key={v.id}>
                    <td className="cell-muted">{formatFechaHora(v.fecha)}</td>
                    <td className="cell-primary">{v.usuario}</td>
                    <td className="cell-muted">{v.encontradas}</td>
                    <td className="cell-muted">{v.corregidas}</td>
                    <td className="cell-muted">{v.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
