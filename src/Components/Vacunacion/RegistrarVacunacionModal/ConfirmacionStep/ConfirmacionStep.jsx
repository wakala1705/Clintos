'use client';

import './ConfirmacionStep.css';
import { resolveVacunaLabel } from '../AplicacionStep/AplicacionStep';

// yyyy-mm-dd -> dd/mm/aaaa (sin librería de fechas, mismo criterio ad hoc
// que el resto del mock de Vacunación — ver mockVacunacionData.js).
function formatFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// HH:MM (24h, valor nativo de <input type="time">) -> "10:35 AM".
function formatHora(hhmm) {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const periodo = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${periodo}`;
}

export default function ConfirmacionStep({ paciente, vacunaSel, aplicacion }) {
  const { nombre, dosis } = resolveVacunaLabel(vacunaSel);

  return (
    <div className="rv-confirmacion-step">
      <div className="rv-resumen-grid">
        <div className="rv-resumen-block">
          <h4 className="rv-section-title">Paciente</h4>
          <p className="rv-resumen-primary">{paciente.nombre}</p>
          <p className="rv-resumen-secondary">{paciente.documento} · {paciente.edadLabel}</p>
        </div>

        <div className="rv-resumen-block">
          <h4 className="rv-section-title">Vacuna</h4>
          <p className="rv-resumen-primary">{nombre}</p>
          <p className="rv-resumen-secondary">{dosis}</p>
        </div>

        <div className="rv-resumen-block">
          <h4 className="rv-section-title">Aplicación</h4>
          <p className="rv-resumen-primary">{formatFecha(aplicacion.fecha)} · {formatHora(aplicacion.hora)}</p>
        </div>

        <div className="rv-resumen-block">
          <h4 className="rv-section-title">Administración</h4>
          <p className="rv-resumen-primary">{aplicacion.via} · {aplicacion.sitio}</p>
        </div>

        <div className="rv-resumen-block">
          <h4 className="rv-section-title">Lote</h4>
          <p className="rv-resumen-primary">{aplicacion.lote || '—'}</p>
        </div>
      </div>

      <p className="rv-safety-text">
        Al registrar esta aplicación, la dosis pasará a estado <strong>Aplicada</strong> y se actualizará el
        progreso del esquema del paciente.
      </p>
    </div>
  );
}
