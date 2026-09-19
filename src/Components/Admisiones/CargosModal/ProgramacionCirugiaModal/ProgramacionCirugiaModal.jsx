'use client';

import { useState } from 'react';
import './ProgramacionCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';

const COMPLEJIDAD_OPTIONS = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];
const NIVEL_ATENCION_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];
const CLASE_OPTIONS = [
  { value: 'quirofano', label: 'Quirófano' },
  { value: 'ambulatorio', label: 'Ambulatorio' },
  { value: 'sala-procedimientos', label: 'Sala de procedimientos' },
];

function initialDraft() {
  const now = new Date();
  return {
    idSala: '',
    hojaGastosUnica: true,
    complejidad: 'media',
    fecha: now.toISOString().slice(0, 10),
    hora: now.toTimeString().slice(0, 5),
    duracionMinutos: '0',
    nivelEsterilizacion: '',
    tipoAnestesia: '',
    duracionRecuperacion: '0.00',
    nivelAtencion: '1',
    areaHosp: '',
    areaFuncional: '',
    centroCosto: '',
    subCentroCosto: '',
    clase: 'quirofano',
  };
}

// Modal "Agregando un Registro" disparado por el botón "Nuevo" del panel
// "Programación Sala Cirugía" (ver CirugiaPanel en CargosModal.jsx) — mismos
// campos/agrupación de 2 columnas que la referencia legacy. Consecutivo/No.
// Admisión son de solo lectura (mock estático, como el resto del modal
// padre); los campos "buscador" (Id. Sala/Tipo Anestesia/Area Hosp./Area
// Funcional/Centro Costo) usan el patrón .field-with-search + .search-btn ya
// establecido en ProgramacionSalaCirugias/shared/shared.css (Dx.
// ingreso/Id. aseguradora) en vez del ícono de ojo de la referencia — mismo
// concepto (abrir un catálogo), y así no se introduce un ícono/patrón nuevo
// solo para este modal. Sin handler real todavía (sin catálogo conectado):
// "Aceptar" solo cierra, igual que el resto de botones mock de CargosModal.
export default function ProgramacionCirugiaModal({ admision, onClose }) {
  const [draft, setDraft] = useState(initialDraft);

  function set(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  if (!admision) return null;

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal pcm-modal" role="dialog" aria-modal="true" aria-labelledby="pcm-modal-title">
        <ModalHeader
          tone="warning"
          title="Agregando un Registro"
          titleId="pcm-modal-title"
          onClose={onClose}
        />

        <div className="adm-modal-body pcm-body">
          <div className="pcm-grid">
            <div className="form-field">
              <label htmlFor="pcm-consecutivo">Consecutivo</label>
              <div className="tf-readonly-value" id="pcm-consecutivo">0200016449</div>
            </div>
            <label className="pcm-checkbox">
              <input
                type="checkbox"
                checked={draft.hojaGastosUnica}
                onChange={(e) => set('hojaGastosUnica', e.target.checked)}
              />
              Hoja de Gastos Única?
            </label>

            <div className="form-field">
              <label htmlFor="pcm-no-admision">No. Admisión</label>
              <div className="tf-readonly-value" id="pcm-no-admision">{admision.numeroAdmision}</div>
            </div>
            <div />

            <div className="form-field">
              <label htmlFor="pcm-id-sala">Id. Sala</label>
              <div className="field-with-search">
                <input
                  id="pcm-id-sala"
                  type="text"
                  required
                  placeholder="Ej. Q-01"
                  value={draft.idSala}
                  onChange={(e) => set('idSala', e.target.value)}
                />
                <button type="button" className="search-btn" aria-label="Buscar sala" title="Buscar sala">
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="pcm-complejidad">Complejidad</label>
              <FormSelect
                id="pcm-complejidad"
                value={draft.complejidad}
                onChange={(v) => set('complejidad', v)}
                options={COMPLEJIDAD_OPTIONS}
              />
            </div>

            <div className="form-field">
              <label htmlFor="pcm-fecha">Fecha</label>
              <input
                id="pcm-fecha"
                type="date"
                value={draft.fecha}
                onChange={(e) => set('fecha', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="pcm-hora">Hora</label>
              <input
                id="pcm-hora"
                type="time"
                value={draft.hora}
                onChange={(e) => set('hora', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="pcm-duracion">Duración (Minutos)</label>
              <input
                id="pcm-duracion"
                type="number"
                min="0"
                value={draft.duracionMinutos}
                onChange={(e) => set('duracionMinutos', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="pcm-nivel-esterilizacion">Nivel de esterilización</label>
              <input
                id="pcm-nivel-esterilizacion"
                type="text"
                value={draft.nivelEsterilizacion}
                onChange={(e) => set('nivelEsterilizacion', e.target.value)}
              />
            </div>

            <div className="form-field full">
              <label htmlFor="pcm-tipo-anestesia">Tipo Anestesia</label>
              <div className="field-with-search">
                <input
                  id="pcm-tipo-anestesia"
                  type="text"
                  required
                  placeholder="Ej. General"
                  value={draft.tipoAnestesia}
                  onChange={(e) => set('tipoAnestesia', e.target.value)}
                />
                <button type="button" className="search-btn" aria-label="Buscar tipo de anestesia" title="Buscar tipo de anestesia">
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="pcm-duracion-recuperacion">Duración Recuperación (Minutos)</label>
              <input
                id="pcm-duracion-recuperacion"
                type="number"
                min="0"
                step="0.01"
                value={draft.duracionRecuperacion}
                onChange={(e) => set('duracionRecuperacion', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="pcm-nivel-atencion">Nivel de atención</label>
              <FormSelect
                id="pcm-nivel-atencion"
                value={draft.nivelAtencion}
                onChange={(v) => set('nivelAtencion', v)}
                options={NIVEL_ATENCION_OPTIONS}
              />
            </div>

            <div className="form-field">
              <label htmlFor="pcm-area-hosp">Area Hosp.</label>
              <div className="field-with-search">
                <input
                  id="pcm-area-hosp"
                  type="text"
                  required
                  placeholder="Ej. 10"
                  value={draft.areaHosp}
                  onChange={(e) => set('areaHosp', e.target.value)}
                />
                <button type="button" className="search-btn" aria-label="Buscar área hospitalaria" title="Buscar área hospitalaria">
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="pcm-area-funcional">Area Funcional</label>
              <div className="field-with-search">
                <input
                  id="pcm-area-funcional"
                  type="text"
                  required
                  placeholder="Ej. 01"
                  value={draft.areaFuncional}
                  onChange={(e) => set('areaFuncional', e.target.value)}
                />
                <button type="button" className="search-btn" aria-label="Buscar área funcional" title="Buscar área funcional">
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="pcm-centro-costo">Centro Costo</label>
              <div className="field-with-search">
                <input
                  id="pcm-centro-costo"
                  type="text"
                  required
                  placeholder="Ej. 01"
                  value={draft.centroCosto}
                  onChange={(e) => set('centroCosto', e.target.value)}
                />
                <button type="button" className="search-btn" aria-label="Buscar centro de costo" title="Buscar centro de costo">
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="pcm-sub-centro-costo">Sub Centro de Costo</label>
              <input
                id="pcm-sub-centro-costo"
                type="text"
                value={draft.subCentroCosto}
                onChange={(e) => set('subCentroCosto', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="pcm-clase">Clase</label>
              <FormSelect
                id="pcm-clase"
                value={draft.clase}
                onChange={(v) => set('clase', v)}
                options={CLASE_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
