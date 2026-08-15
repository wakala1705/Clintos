'use client';

import './AplicacionStep.css';
import { MOTIVOS_FUERA_ESQUEMA, SITIO_APLICACION_OPTIONS, VIA_ADMINISTRACION_OPTIONS } from '@/hooks/Vacunacion/mockVacunacionData';

// Paso 3 — resuelve el nombre/dosis a mostrar según el origen de la
// selección del paso anterior (esquema vs. fuera de esquema, ver
// VacunaStep.jsx) para no repetir esa lógica en ConfirmacionStep/ExitoStep:
// exportada para que los pasos siguientes la reutilicen.
export function resolveVacunaLabel(vacunaSel) {
  if (!vacunaSel) return { nombre: '', dosis: '' };
  if (vacunaSel.origen === 'esquema') return { nombre: vacunaSel.dosis.vacuna, dosis: vacunaSel.dosis.dosis };
  const motivo = MOTIVOS_FUERA_ESQUEMA.find((m) => m.value === vacunaSel.motivo);
  return { nombre: vacunaSel.vacuna, dosis: motivo ? motivo.label : 'Fuera del esquema' };
}

export default function AplicacionStep({ paciente, vacunaSel, value, onChange, errors }) {
  const { nombre, dosis } = resolveVacunaLabel(vacunaSel);
  const fueraEsquema = vacunaSel.origen === 'fuera-esquema';

  return (
    <div className="rv-aplicacion-step">
      <div className="rv-vacuna-context">
        <h4>{nombre} · {dosis}</h4>
        <div className="rv-vacuna-context-meta">
          <span><strong>Paciente:</strong> {paciente.nombre}</span>
          {fueraEsquema
            ? <span><strong>Motivo:</strong> {dosis}</span>
            : <span><strong>Programada:</strong> {vacunaSel.dosis.fechaProgramadaLabel}</span>}
        </div>
      </div>

      <div className="rv-section">
        <h4 className="rv-section-title">Datos de aplicación</h4>
        <div className="rv-grid-2">
          <div className={`rv-field${errors.fecha ? ' has-error' : ''}`}>
            <label htmlFor="rv-ap-fecha">Fecha de aplicación<span className="rv-required">*</span></label>
            <input id="rv-ap-fecha" type="date" value={value.fecha} onChange={(e) => onChange({ fecha: e.target.value })} />
            {errors.fecha && <span className="rv-error-text">{errors.fecha}</span>}
          </div>
          <div className={`rv-field${errors.hora ? ' has-error' : ''}`}>
            <label htmlFor="rv-ap-hora">Hora<span className="rv-required">*</span></label>
            <input id="rv-ap-hora" type="time" value={value.hora} onChange={(e) => onChange({ hora: e.target.value })} />
            {errors.hora && <span className="rv-error-text">{errors.hora}</span>}
          </div>
          <div className={`rv-field${errors.lote ? ' has-error' : ''}`}>
            <label htmlFor="rv-ap-lote">Lote<span className="rv-required">*</span></label>
            <input id="rv-ap-lote" type="text" placeholder="Ej. ABC12345" value={value.lote} onChange={(e) => onChange({ lote: e.target.value })} />
            {errors.lote && <span className="rv-error-text">{errors.lote}</span>}
          </div>
          <div className="rv-field">
            <label htmlFor="rv-ap-vencimiento">Fecha de vencimiento</label>
            <input id="rv-ap-vencimiento" type="date" value={value.fechaVencimiento} onChange={(e) => onChange({ fechaVencimiento: e.target.value })} />
          </div>
          <div className="rv-field">
            <label htmlFor="rv-ap-fabricante">Fabricante</label>
            <input id="rv-ap-fabricante" type="text" placeholder="Ej. Sanofi Pasteur" value={value.fabricante} onChange={(e) => onChange({ fabricante: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="rv-section">
        <h4 className="rv-section-title">Administración</h4>
        <div className="rv-grid-2">
          <div className={`rv-field${errors.via ? ' has-error' : ''}`}>
            <label htmlFor="rv-ap-via">Vía de administración<span className="rv-required">*</span></label>
            <select id="rv-ap-via" value={value.via} onChange={(e) => onChange({ via: e.target.value })}>
              <option value="">Selecciona una vía</option>
              {VIA_ADMINISTRACION_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            {errors.via && <span className="rv-error-text">{errors.via}</span>}
          </div>
          <div className={`rv-field${errors.sitio ? ' has-error' : ''}`}>
            <label htmlFor="rv-ap-sitio">Sitio de aplicación<span className="rv-required">*</span></label>
            <select id="rv-ap-sitio" value={value.sitio} onChange={(e) => onChange({ sitio: e.target.value })}>
              <option value="">Selecciona un sitio</option>
              {SITIO_APLICACION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.sitio && <span className="rv-error-text">{errors.sitio}</span>}
          </div>
        </div>
      </div>

      <div className="rv-section">
        <h4 className="rv-section-title">Observaciones</h4>
        <div className="rv-field">
          <label htmlFor="rv-ap-obs" className="sr-only">Observaciones</label>
          <textarea
            id="rv-ap-obs"
            placeholder="Observaciones sobre la aplicación…"
            value={value.observaciones}
            onChange={(e) => onChange({ observaciones: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
