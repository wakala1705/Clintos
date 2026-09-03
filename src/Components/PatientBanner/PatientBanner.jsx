'use client';

import { useEffect, useRef, useState } from 'react';
import './PatientBanner.css';
import Badge from '@/Components/Badge/Badge';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import PatientDetailModal from './PatientDetailModal/PatientDetailModal';
import { LuCircleAlert, LuSearch, LuUserPlus, LuX } from 'react-icons/lu';

// Banner de identidad del paciente, compartido por /asignacion-citas y
// /gestion-enfermeria (antes duplicado: uno como componente React estático en
// GestionEnfermeria, el otro como HTML armado a mano por legacy-app.js — ver
// AGENTS.md, mismo criterio que Sidebar/UserMenu/Topbar). La fila principal
// (avatar, nombre, CC/EDAD/SEXO/EPS, "Ver más datos", alergias) es igual en
// todas las rutas; lo que varía por página se pasa como props: `secondRow`
// (fila de chips tipo admisión — en Enfermería admisión/contrato/cama, en
// Asignación de Citas ciudad/teléfono/citas futuras), `statusBadge` y
// `onClose` (Asignación de Citas permite quitar el paciente seleccionado),
// y `empty` (Asignación de Citas arranca sin paciente hasta que se busca uno;
// Enfermería siempre entra con un paciente ya admitido). `compact` (usado por
// PlantillaCrecimt2 al maximizar, ver ViewSettingsMenu.jsx) reduce el banner
// a una sola línea con solo nombre/sexo/edad — ignora secondRow/statusBadge/
// onClose/alergias para dejar sitio real a la card que crece por encima.
// `leadingSelect` (un <select> nativo antes del primer chip de secondRow —
// hoy solo lo usa Asignación de Citas para "Régimen", ver
// asignacion-citas/page.jsx; estilo tipo .pc-select-wrap/.pc-picker-trigger
// de ProgramarCita/AgendaToolbar.css, reimplementado acá con clases propias
// .pb-* porque este componente es global y no puede depender de tokens de
// una sola feature): { label, value, options: [{value,label}], onChange }.
// `secondRowButton` (botón al final de esa misma fila — hoy solo lo usa
// Asignación de Citas para "Historial de citas", ver asignacion-citas/
// page.jsx): { label, icon: Icon, onClick }.
export default function PatientBanner({ patient, secondRow, leadingSelect, secondRowButton, statusBadge, onClose, empty, compact }) {
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const allergyRef = useRef(null);

  useEffect(() => {
    if (!allergyOpen) return;
    function handleClickOutside(e) {
      if (allergyRef.current && !allergyRef.current.contains(e.target)) setAllergyOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setAllergyOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [allergyOpen]);

  if (!patient) {
    return (
      <div className="patient-banner-empty" onClick={empty?.onAction} role={empty?.onAction ? 'button' : undefined} tabIndex={empty?.onAction ? 0 : undefined}>
        <div className="pbe-icon">
          <LuUserPlus className="icon" aria-hidden="true" />
        </div>
        <div className="pbe-text">
          <div className="pbe-title">{empty?.title ?? 'Ningún paciente seleccionado'}</div>
          <div className="pbe-sub">{empty?.subtitle ?? 'Busca por nombre o documento para iniciar la atención'}</div>
        </div>
        {empty?.actionLabel && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => { e.stopPropagation(); empty.onAction?.(); }}
          >
            <LuSearch className="icon" />
            {empty.actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="patient-banner patient-banner-compact">
        <PatientAvatar iniciales={patient.iniciales} className="patient-avatar" />
        <div className="patient-name-block"><div className="pname">{patient.nombre}</div></div>
        <div className="patient-meta">
          <div className="pm-item"><span className="lbl">SEXO</span> <b>{patient.sexo}</b></div>
          <div className="pm-item"><span className="lbl">EDAD</span> <b>{patient.edad}</b></div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-banner">
      <PatientAvatar iniciales={patient.iniciales} className="patient-avatar" />
      <div className="patient-name-block"><div className="pname">{patient.nombre}</div></div>
      <div className="patient-meta">
        <div className="pm-item"><span className="lbl">CC</span> <b>{patient.documento}</b></div>
        <div className="pm-item"><span className="lbl">EDAD</span> <b>{patient.edad}</b></div>
        <div className="pm-item"><span className="lbl">SEXO</span> <b>{patient.sexo}</b></div>
        <div className="pm-item"><b>{patient.eps}</b></div>
        <button type="button" className="pm-item-more" onClick={() => setDetailOpen(true)}>Ver más</button>
      </div>
      <div className="patient-banner-right">
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="pb-popover-wrap" ref={allergyRef}>
            <button
              type="button"
              className="allergy-chip"
              aria-haspopup="true"
              aria-expanded={allergyOpen}
              onClick={() => setAllergyOpen((v) => !v)}
            >
              <LuCircleAlert className="icon" aria-hidden="true" />
              Alergias
            </button>
            {allergyOpen && (
              <div className="pb-popover" role="dialog" aria-label="Detalle de alergias del paciente">
                <div className="pb-popover-title">Alergias registradas</div>
                {patient.allergies.map((a) => (
                  <div className="pb-popover-row" key={a.name}>
                    <span className="k">{a.name}</span>
                    <span className="v">{a.reaction}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {statusBadge && (
          <Badge tone={statusBadge.tone} dot>{statusBadge.label}</Badge>
        )}
        {onClose && (
          <button type="button" className="close-x" onClick={onClose} aria-label="Quitar paciente" title="Quitar paciente">
            <LuX className="icon" />
          </button>
        )}
      </div>
      {((secondRow && secondRow.length > 0) || leadingSelect || secondRowButton) && (
        <div className="admission-row">
          {leadingSelect && (
            <div className="pb-select-wrap">
              <label htmlFor="pb-leading-select">{leadingSelect.label}</label>
              <select
                id="pb-leading-select"
                className="pb-select"
                value={leadingSelect.value}
                onChange={(e) => leadingSelect.onChange?.(e.target.value)}
              >
                {leadingSelect.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          {secondRow?.map((item) => (
            <div className="ar-item" key={item.label}>
              <span className="lbl">{item.label}</span> <b>{item.value}</b>
            </div>
          ))}
          {secondRowButton && (
            <button type="button" className="pb-row-btn" onClick={secondRowButton.onClick}>
              {secondRowButton.icon && <secondRowButton.icon className="icon" aria-hidden="true" />}
              {secondRowButton.label}
            </button>
          )}
        </div>
      )}
      {detailOpen && (
        <PatientDetailModal patient={patient} secondRow={secondRow} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}
