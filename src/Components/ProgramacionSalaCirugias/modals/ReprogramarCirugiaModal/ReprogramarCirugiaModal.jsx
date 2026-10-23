'use client';

import { useState } from 'react';
import './ReprogramarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import CatalogPickerTrigger from '../../CatalogPickerTrigger/CatalogPickerTrigger';
import CatalogoSalasModal from '../CatalogoSalasModal/CatalogoSalasModal';
import CatalogoMedicosModal from '../CatalogoMedicosModal/CatalogoMedicosModal';
import CatalogoCausalesModal from '../CatalogoCausalesModal/CatalogoCausalesModal';
import {
  SALAS, CAUSALES_REPROGRAMACION_CIRUGIA, fechaLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuCalendarClock, LuSearch } from 'react-icons/lu';

// Redisñado a partir de un formulario legacy de referencia ("Reprogramación
// de cirugía", captura adjunta) -- adaptado al design system del proyecto en
// vez de calcado 1:1: se suman Causal/Sala/Cirujano/Duraciones (editables,
// ausentes en la versión anterior de este modal) y un bloque de contexto de
// solo lectura, pero se descartan Nro. Programación/Id. Servicio como código
// separado y "Fecha finalización" calculada -- ninguno tiene respaldo real
// en el modelo de datos de CIRUGIAS hoy (ver mockCirugiaData.js) y no hay
// motivo para inventar campos nuevos solo para calcar la captura.
//
// Bloque de contexto (Paciente/Nro. cirugía/Servicio/Cirujano/Sala/Fecha-
// Hora actuales): texto plano dentro de una caja con fondo, no
// .form-field/.tf-readonly-value -- mismo criterio que .apm-patient-info en
// AgregarProcedimientoModal.css ("a diferencia de .tf-readonly-value no es
// un campo editable, así que no necesita look de input"). Reemplaza al
// subtítulo del ModalHeader (que solo mostraba el paciente) para que toda la
// info de solo-lectura viva en un único lugar.
//
// Nueva sala reusa el mismo patrón de trigger + CatalogoSalasModal que
// FiltrosBar.jsx (picker de catálogo, no FormSelect: ya es el picker
// establecido para "sala" en esta feature). Nuevo cirujano reusa el patrón
// de input+lupa (.field-with-search) + CatalogoMedicosModal que
// AgregarProcedimientoModal.jsx ya usa para "Id. Cirujano". Causal de
// reprogramación reusa el mismo trigger que Nueva sala + CatalogoCausalesModal
// (encargo explícito, ver capturas de "Causales de anulación (CAU)") -- ya
// no un FormSelect con un recorte inventado de motivos: la referencia trae
// un catálogo cerrado real con id+descripción que hay que calcar.
// Hora fin = nueva hora de inicio + la duración que ya tenía la cirugía.
function horaFinDesde(horaInicio, cirugia) {
  const aMin = (h) => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
  const total = aMin(horaInicio) + (aMin(cirugia.horaFin) - aMin(cirugia.horaInicio));
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export default function ReprogramarCirugiaModal({
  cirugia, onClose, onSubmit, fechaMinima,
}) {
  // `fechaMinima` (opcional, lo pasa la revisión de vencidas): la fecha
  // actual de una programación vencida ya es pasada, así que arranca vacía
  // en vez de precargada con un valor que no se puede enviar.
  const [fecha, setFecha] = useState(
    fechaMinima && cirugia.fecha < fechaMinima ? '' : cirugia.fecha,
  );
  const [horaInicio, setHoraInicio] = useState(cirugia.horaInicio);
  const [salaId, setSalaId] = useState(cirugia.salaId);
  const [cirujano, setCirujano] = useState(cirugia.cirujano ?? '');
  const [causal, setCausal] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(null);

  const salaSeleccionada = SALAS.find((s) => s.value === salaId);
  const causalSeleccionada = CAUSALES_REPROGRAMACION_CIRUGIA.find((c) => c.idCausal === causal);

  const fechaInvalida = Boolean(fechaMinima) && fecha !== '' && fecha < fechaMinima;
  const puedeEnviar = causal !== '' && salaId !== '' && cirujano.trim() !== ''
    && fecha !== '' && horaInicio !== '' && !fechaInvalida;

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    onSubmit({
      fecha,
      horaInicio,
      horaFin: horaFinDesde(horaInicio, cirugia),
      salaId,
      cirujano: cirujano.trim(),
      causal,
      // Las duraciones ya no se editan aquí: se conservan y la hora fin se recalcula
      // desde la nueva hora de inicio.
      duracionEstimadaMin: cirugia.duracionEstimadaMin ?? '',
      duracionPostquirurgicaMin: cirugia.duracionPostquirurgicaMin ?? '',
      duracionRecuperacionMin: cirugia.duracionRecuperacionMin ?? '',
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card rcm-modal-card" role="dialog" aria-modal="true" aria-labelledby="rcm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Reprogramar cirugía"
            titleId="rcm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rcm-info-box">
              <div className="rcm-info-item">
                <span className="rcm-info-label">Paciente</span>
                <span className="rcm-info-value">{cirugia.paciente.nombre.toUpperCase()}</span>
              </div>
              <div className="rcm-info-item">
                <span className="rcm-info-label">Fecha y hora actual</span>
                <span className="rcm-info-value">{fechaLabel(cirugia.fecha)} · {cirugia.horaInicio} – {cirugia.horaFin}</span>
              </div>
            </div>

            <div className="rcm-divider" />
            <h4 className="ncw-section-title">Nueva programación</h4>

            <div className="rcm-grid">
              <div className="form-field full">
                <label htmlFor="rcm-causal">Causal de reprogramación</label>
                <CatalogPickerTrigger
                  id="rcm-causal"
                  label={causalSeleccionada ? `${causalSeleccionada.idCausal} - ${causalSeleccionada.descripcion}` : undefined}
                  placeholder="Selecciona una causal"
                  open={catalogoAbierto === 'causal'}
                  onClick={() => setCatalogoAbierto('causal')}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-fecha">Nueva fecha</label>
                <input
                  id="rcm-fecha"
                  type="date"
                  value={fecha}
                  min={fechaMinima}
                  onChange={(e) => setFecha(e.target.value)}
                  aria-invalid={fechaInvalida || undefined}
                  aria-describedby={fechaInvalida ? 'rcm-fecha-error' : undefined}
                  required
                />
                {fechaInvalida && (
                  <span id="rcm-fecha-error" className="rcm-field-error">La nueva fecha debe ser posterior a hoy.</span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-inicio">Nueva hora inicio</label>
                <input id="rcm-hora-inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-sala">Nueva sala</label>
                <CatalogPickerTrigger
                  id="rcm-sala"
                  label={salaSeleccionada?.label}
                  placeholder="Selecciona una sala"
                  open={catalogoAbierto === 'sala'}
                  onClick={() => setCatalogoAbierto('sala')}
                />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-cirujano">Nuevo cirujano</label>
                <div className="field-with-search">
                  <input
                    id="rcm-cirujano"
                    type="text"
                    required
                    value={cirujano}
                    onChange={(e) => setCirujano(e.target.value)}
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => setCatalogoAbierto('cirujano')}
                    aria-label="Buscar cirujano"
                    title="Buscar cirujano"
                  >
                    <LuSearch className="icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!puedeEnviar}>Reprogramar</Button>
          </div>
        </form>
      </div>

      {catalogoAbierto === 'causal' && (
        <CatalogoCausalesModal
          causales={CAUSALES_REPROGRAMACION_CIRUGIA}
          value={causal}
          onSelect={setCausal}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
      {catalogoAbierto === 'sala' && (
        <CatalogoSalasModal
          salas={SALAS.filter((s) => s.sedeId === cirugia.sedeId)}
          value={salaId}
          onSelect={setSalaId}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
      {catalogoAbierto === 'cirujano' && (
        <CatalogoMedicosModal
          tipo="Cirujano"
          onSelect={setCirujano}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
    </div>
  );
}
