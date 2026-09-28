'use client';

import { useState } from 'react';
import './IniciarTurnoModal.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { UNIDADES_DISPONIBLES, TURNOS_DISPONIBLES } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { useSedeSeleccionada } from '@/hooks/Sede/sede';
import { useAreaFuncionalSeleccionada } from '@/hooks/AreaFuncional/areaFuncional';
import { LuBedDouble, LuClock, LuInfo, LuPlay } from 'react-icons/lu';

// Puerta de entrada al contexto operativo de un turno de enfermería — aparece
// sobre Panel General al entrar al módulo. Deliberadamente sin ModalHeader:
// no es un formulario con fila título+cerrar, es un diálogo centrado tipo
// "confirmación" (ver AGENTS.md "Modales" → fuera de ModalHeader), con ícono
// hero + título + descripción. Sede/Área funcional se muestran de solo
// lectura, leídas de la misma sesión que ya usa el Topbar (SedePickerButton/
// AreaFuncionalPickerButton) — no un valor propio del modal, así que quedan
// sincronizadas con lo elegido en el login/picker; Unidad/Turno sí son
// editables acá.
export default function IniciarTurnoModal({ onClose, onConfirm }) {
  const sede = useSedeSeleccionada();
  const area = useAreaFuncionalSeleccionada();
  const [unidad, setUnidad] = useState(UNIDADES_DISPONIBLES[0].value);
  const [turno, setTurno] = useState(TURNOS_DISPONIBLES[0].value);

  const unidadSel = UNIDADES_DISPONIBLES.find((u) => u.value === unidad);
  const turnoSel = TURNOS_DISPONIBLES.find((t) => t.value === turno);

  function handleConfirm() {
    onConfirm({ unidad, turno });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card itm-modal-card" role="dialog" aria-modal="true" aria-labelledby="itm-title">
        <div className="modal-body itm-body">
          <div className="itm-hero-icon">
            <LuBedDouble className="icon" aria-hidden="true" />
            <span className="itm-hero-badge">
              <LuClock aria-hidden="true" />
            </span>
          </div>

          <h3 id="itm-title" className="itm-title">Comienza tu jornada de enfermería</h3>
          <p className="itm-desc">Selecciona la unidad y el turno con los que trabajarás.</p>

          <div className="itm-context-card">
            <div className="itm-context-item">
              <span className="itm-context-label">Sede</span>
              <span className="itm-context-value">{sede.descripcion}</span>
            </div>
            <div className="itm-context-sep" />
            <div className="itm-context-item">
              <span className="itm-context-label">Área funcional</span>
              <span className="itm-context-value">{area?.descripcion ?? '—'}</span>
            </div>
          </div>

          <div className="form-field itm-field">
            <label htmlFor="itm-unidad">Unidad / Sector *</label>
            <div className="itm-select-icon-wrap">
              <LuBedDouble className="icon itm-select-icon" aria-hidden="true" />
              <FormSelect
                id="itm-unidad"
                value={unidad}
                onChange={setUnidad}
                options={UNIDADES_DISPONIBLES}
              />
            </div>
            {unidadSel && (
              <p className="itm-field-meta">{unidadSel.camas} camas · {unidadSel.pacientes} pacientes</p>
            )}
          </div>

          <div className="form-field itm-field">
            <label htmlFor="itm-turno">Turno *</label>
            <div className="itm-select-icon-wrap">
              <LuClock className="icon itm-select-icon" aria-hidden="true" />
              <FormSelect
                id="itm-turno"
                value={turno}
                onChange={setTurno}
                options={TURNOS_DISPONIBLES}
              />
            </div>
            {turnoSel && <p className="itm-field-meta">{turnoSel.rango}</p>}
          </div>

          <div className="itm-info-banner">
            <LuInfo className="icon" aria-hidden="true" />
            <p>Al abrir el turno, todas tus actividades y registros quedarán asociados a esta unidad y turno.</p>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon={LuPlay} onClick={handleConfirm}>Abrir turno</Button>
        </div>
      </div>
    </div>
  );
}
