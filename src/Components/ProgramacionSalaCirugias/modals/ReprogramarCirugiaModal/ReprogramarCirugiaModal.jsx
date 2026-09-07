'use client';

import { useState } from 'react';
import './ReprogramarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import CatalogoSalasModal from '../CatalogoSalasModal/CatalogoSalasModal';
import CatalogoMedicosModal from '../CatalogoMedicosModal/CatalogoMedicosModal';
import CatalogoCausalesModal from '../CatalogoCausalesModal/CatalogoCausalesModal';
import {
  SALAS, CAUSALES_REPROGRAMACION_CIRUGIA, fechaLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuCalendarClock, LuChevronDown, LuSearch } from 'react-icons/lu';

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
export default function ReprogramarCirugiaModal({ cirugia, onClose, onSubmit }) {
  const [fecha, setFecha] = useState(cirugia.fecha);
  const [horaInicio, setHoraInicio] = useState(cirugia.horaInicio);
  const [horaFin, setHoraFin] = useState(cirugia.horaFin);
  const [salaId, setSalaId] = useState(cirugia.salaId);
  const [cirujano, setCirujano] = useState(cirugia.cirujano ?? '');
  const [causal, setCausal] = useState('');
  const [duracionEstimadaMin, setDuracionEstimadaMin] = useState(
    cirugia.duracionEstimadaMin ?? cirugia.procedimientos?.[0]?.duracionMin ?? '',
  );
  const [duracionPostquirurgicaMin, setDuracionPostquirurgicaMin] = useState(cirugia.duracionPostquirurgicaMin ?? '');
  const [duracionRecuperacionMin, setDuracionRecuperacionMin] = useState(cirugia.duracionRecuperacionMin ?? '');
  const [catalogoAbierto, setCatalogoAbierto] = useState(null);

  const salaActual = SALAS.find((s) => s.value === cirugia.salaId);
  const salaSeleccionada = SALAS.find((s) => s.value === salaId);
  const causalSeleccionada = CAUSALES_REPROGRAMACION_CIRUGIA.find((c) => c.idCausal === causal);

  const puedeEnviar = causal !== '' && salaId !== '' && cirujano.trim() !== ''
    && fecha !== '' && horaInicio !== '' && horaFin !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    onSubmit({
      fecha,
      horaInicio,
      horaFin,
      salaId,
      cirujano: cirujano.trim(),
      causal,
      duracionEstimadaMin: duracionEstimadaMin === '' ? '' : Number(duracionEstimadaMin),
      duracionPostquirurgicaMin: duracionPostquirurgicaMin === '' ? '' : Number(duracionPostquirurgicaMin),
      duracionRecuperacionMin: duracionRecuperacionMin === '' ? '' : Number(duracionRecuperacionMin),
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
                <span className="rcm-info-value">{cirugia.paciente.nombre}</span>
              </div>
              <div className="rcm-info-item">
                <span className="rcm-info-label">Nro. cirugía</span>
                <span className="rcm-info-value">{cirugia.id}</span>
              </div>
              <div className="rcm-info-item">
                <span className="rcm-info-label">Servicio</span>
                <span className="rcm-info-value">{cirugia.servicio || '—'}</span>
              </div>
              <div className="rcm-info-item">
                <span className="rcm-info-label">Cirujano actual</span>
                <span className="rcm-info-value">{cirugia.cirujano || '—'}</span>
              </div>
              <div className="rcm-info-item">
                <span className="rcm-info-label">Sala actual</span>
                <span className="rcm-info-value">{salaActual?.label ?? '—'}</span>
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
                <div className="form-select">
                  <button
                    type="button"
                    id="rcm-causal"
                    className="form-select-trigger"
                    onClick={() => setCatalogoAbierto('causal')}
                    aria-haspopup="dialog"
                    data-required-empty={!causal ? 'true' : undefined}
                  >
                    <span className={causalSeleccionada ? 'form-select-value' : 'form-select-placeholder'}>
                      {causalSeleccionada ? `${causalSeleccionada.idCausal} - ${causalSeleccionada.descripcion}` : 'Selecciona una causal'}
                    </span>
                    <LuChevronDown className="icon form-select-chev" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="rcm-sala">Nueva sala</label>
                <div className="form-select">
                  <button
                    type="button"
                    id="rcm-sala"
                    className="form-select-trigger"
                    onClick={() => setCatalogoAbierto('sala')}
                    aria-haspopup="dialog"
                  >
                    <span className={salaSeleccionada ? 'form-select-value' : 'form-select-placeholder'}>
                      {salaSeleccionada ? salaSeleccionada.label : 'Selecciona una sala'}
                    </span>
                    <LuChevronDown className="icon form-select-chev" aria-hidden="true" />
                  </button>
                </div>
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
              <div className="form-field">
                <label htmlFor="rcm-fecha">Nueva fecha</label>
                <input id="rcm-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-inicio">Nueva hora inicio</label>
                <input id="rcm-hora-inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-fin">Nueva hora fin</label>
                <input id="rcm-hora-fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-dur-estimada">Dur. estimada (min)</label>
                <input
                  id="rcm-dur-estimada"
                  type="number"
                  min="0"
                  value={duracionEstimadaMin}
                  onChange={(e) => setDuracionEstimadaMin(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-dur-postquirurgica">Dur. postquirúrgica (min)</label>
                <input
                  id="rcm-dur-postquirurgica"
                  type="number"
                  min="0"
                  value={duracionPostquirurgicaMin}
                  onChange={(e) => setDuracionPostquirurgicaMin(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-dur-recuperacion">Dur. recuperación (min)</label>
                <input
                  id="rcm-dur-recuperacion"
                  type="number"
                  min="0"
                  value={duracionRecuperacionMin}
                  onChange={(e) => setDuracionRecuperacionMin(e.target.value)}
                />
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
