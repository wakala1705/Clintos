'use client';

import { useEffect, useRef, useState } from 'react';
import './PatientBanner.css';
import Badge from '@/Components/Badge/Badge';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import PatientDetailModal from './PatientDetailModal/PatientDetailModal';
import {
  LuChevronDown, LuCircleAlert, LuEye, LuEyeOff, LuSearch, LuUserPlus, LuX,
} from 'react-icons/lu';

// Enmascara un valor manteniendo su longitud/espacios (mismo criterio que un
// campo de contraseña) — mismo patrón que CargosModal.jsx (Admisiones), acá
// reimplementado porque este componente es global y no puede importar de una
// feature. El botón de ojo de patient-banner-right alterna esto sobre
// nombre/documento en vez de navegar a ningún lado.
function maskText(value) {
  return String(value).replace(/\S/g, '•');
}

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
// a una sola línea con nombre/CC/edad/sexo/aseguradora — ignora secondRow/
// statusBadge/onClose/alergias para dejar sitio real a la card que crece
// por encima.
// `leadingSelect` (un <select> nativo antes del primer chip de secondRow —
// hoy solo lo usa Asignación de Citas para "Régimen", ver
// asignacion-citas/page.jsx; estilo tipo .pc-select-wrap/.pc-picker-trigger
// de ProgramarCita/AgendaToolbar.css, reimplementado acá con clases propias
// .pb-* porque este componente es global y no puede depender de tokens de
// una sola feature): { label, value, options: [{value,label}], onChange }.
// `secondRowButton` (botón al final de esa misma fila — hoy solo lo usa
// Asignación de Citas para "Historial de citas", ver asignacion-citas/
// page.jsx): { label, icon: Icon, onClick }.
// El chevron al extremo derecho de admission-row es un toggle interno
// (`collapsed`, no un prop): al accionarlo el banner se re-renderiza con el
// mismo markup/clases que la variante `compact` de arriba (name/sexo/edad,
// clase `patient-banner-compact`), con el chevron reaparece dentro de ese
// bloque para volver a expandir. Es independiente del prop `compact` — este
// último sigue siendo la variante fija sin admission-row/chevron que usa
// PlantillaCrecimt2.
// Nombre + documento van agrupados en una sola columna (`patient-name-block`
// con `pname`/`pdoc`, encargo explícito replicado desde CargosModal —
// Admisiones/Cargos) en vez de nombre en su propio bloque y CC como chip
// suelto de `patient-meta`. El botón de ojo de `patient-banner-right`
// enmascara/revela ambos (`dataHidden`, ver maskText arriba) — mismo patrón
// que el toggle de un campo de contraseña, no navega a ningún lado.
// `statusBadge` ahora se renderiza dentro de `admission-row` (fila 2, junto
// al resto de chips) en vez de en `patient-banner-right` (encargo explícito,
// mismo criterio que "Activo" bajó a la fila 2 en CargosModal) — Enfermería
// ya pasaba su estado como parte de `secondRow` directamente, así que solo
// afecta a Asignación de Citas (único consumidor de `statusBadge`).
//
// Estructura de 2 filas homologada con CargosModal.jsx (Admisiones/Cargos,
// encargo explícito: "que sea el mismo componente global, con esa misma
// estructura y los mismos datos") — fila 1 agrega FECHA NAC./ASEGURADOR
// junto a SEXO (antes solo EDAD/SEXO/Aseg.); fila 2 agrega un set fijo de
// campos de admisión (`patient.numeroAdmision/fechaIngreso/cama/idAfiliado/
// regimen/numeroContrato/idContrato`, ver abajo) delante de `secondRow`.
// Cada campo fijo es opcional y solo se renderiza si la pantalla que monta
// el banner lo pasa en `patient` — así una pantalla sin admisión/contrato
// (Asignación de Citas, Historia Clínica) no muestra nada de más, y una que
// sí tiene esos datos (Enfermería) los consume directo en vez de armarlos a
// mano en su propio `secondRow`. `secondRow` sigue existiendo como
// extensión libre para datos propios de una pantalla que no encajan en este
// set fijo (ciudad/teléfono/citas futuras en Asignación de Citas; cita/
// servicio/tipo de cita en Historia Clínica).
export default function PatientBanner({ patient, secondRow, leadingSelect, secondRowButton, statusBadge, onClose, empty, compact }) {
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dataHidden, setDataHidden] = useState(false);
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

  const nombreMostrado = patient && dataHidden ? maskText(patient.nombre) : patient?.nombre;
  const documentoMostrado = patient && dataHidden ? maskText(patient.documento) : patient?.documento;

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
        <div className="patient-name-block"><div className="pname">{nombreMostrado}</div></div>
        <div className="patient-meta">
          <div className="pm-item"><span className="lbl">CC</span> <b>{documentoMostrado}</b></div>
          <div className="pm-item"><span className="lbl">EDAD</span> <b>{patient.edad}</b></div>
          <div className="pm-item"><span className="lbl">SEXO</span> <b>{patient.sexo}</b></div>
          <div className="pm-item"><span className="lbl">Aseg.</span> <b>{patient.eps}</b></div>
        </div>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="patient-banner patient-banner-compact">
        <PatientAvatar iniciales={patient.iniciales} className="patient-avatar" />
        <div className="patient-name-block"><div className="pname">{nombreMostrado}</div></div>
        <div className="patient-meta">
          <div className="pm-item"><span className="lbl">CC</span> <b>{documentoMostrado}</b></div>
          <div className="pm-item"><span className="lbl">EDAD</span> <b>{patient.edad}</b></div>
          <div className="pm-item"><span className="lbl">SEXO</span> <b>{patient.sexo}</b></div>
          <div className="pm-item"><span className="lbl">Aseg.</span> <b>{patient.eps}</b></div>
        </div>
        <button
          type="button"
          className="ar-toggle collapsed"
          onClick={() => setCollapsed(false)}
          aria-expanded="false"
          aria-label="Expandir banner"
          title="Expandir banner"
        >
          <LuChevronDown className="icon" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="patient-banner">
      <PatientAvatar iniciales={patient.iniciales} className="patient-avatar" />
      {/* Nombre + documento agrupados en una columna (encargo explícito,
          replicado desde CargosModal) en vez de nombre solo + CC como chip
          suelto de patient-meta. */}
      <div className="patient-name-block">
        <div className="pname">{nombreMostrado}</div>
        <div className="pdoc">CC {documentoMostrado}</div>
      </div>
      <div className="patient-meta">
        {patient.sexo && <div className="pm-item"><span className="lbl">SEXO</span> <b>{patient.sexo}</b></div>}
        {/* FECHA NAC. (encargo explícito, homologado con CargosModal) — si la
            pantalla no tiene fecha de nacimiento real, sigue mostrando EDAD
            (dato que sí existe hoy en los 3 mocks) en vez de perderlo. */}
        {patient.fechaNacimiento ? (
          <div className="pm-item"><span className="lbl">FECHA NAC.</span> <b>{patient.fechaNacimiento}</b></div>
        ) : patient.edad && (
          <div className="pm-item"><span className="lbl">EDAD</span> <b>{patient.edad}</b></div>
        )}
        {patient.eps && <div className="pm-item"><span className="lbl">ASEGURADOR</span> <b>{patient.eps}</b></div>}
        <button type="button" className="pm-item-more" onClick={() => setDetailOpen(true)}>Ver más</button>
      </div>
      <div className="patient-banner-right">
        {/* No navega (encargo explícito, replicado desde CargosModal):
            enmascara/revela nombre y documento (dataHidden, ver maskText),
            mismo patrón que el toggle de un campo de contraseña. */}
        <button
          type="button"
          className="pb-icon-btn"
          onClick={() => setDataHidden((v) => !v)}
          aria-pressed={dataHidden}
          aria-label={dataHidden ? 'Mostrar datos sensibles' : 'Ocultar datos sensibles'}
        >
          {dataHidden ? <LuEyeOff className="icon" aria-hidden="true" /> : <LuEye className="icon" aria-hidden="true" />}
        </button>
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
        {onClose && (
          <button type="button" className="close-x" onClick={onClose} aria-label="Quitar paciente" title="Quitar paciente">
            <LuX className="icon" />
          </button>
        )}
      </div>
      {((secondRow && secondRow.length > 0) || leadingSelect || secondRowButton || statusBadge
        || patient.numeroAdmision || patient.fechaIngreso || patient.cama || patient.idAfiliado
        || patient.regimen || patient.numeroContrato || patient.idContrato) && (
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
          {/* Set fijo de campos de admisión (encargo explícito, homologado
              con CargosModal) — cada uno opcional, se omite si la pantalla
              no lo pasa en `patient`. */}
          {patient.numeroAdmision && (
            <div className="ar-item"><span className="lbl">N° Admisión</span> <b>{patient.numeroAdmision}</b></div>
          )}
          {patient.fechaIngreso && (
            <div className="ar-item"><span className="lbl">Fecha de ingreso</span> <b>{patient.fechaIngreso}</b></div>
          )}
          {patient.cama && (
            <div className="ar-item"><span className="lbl">Cama</span> <b>{patient.cama}</b></div>
          )}
          {patient.idAfiliado && (
            <div className="ar-item"><span className="lbl">Id. Afiliado</span> <b>{dataHidden ? maskText(patient.idAfiliado) : patient.idAfiliado}</b></div>
          )}
          {patient.regimen && (
            <div className="ar-item"><span className="lbl">Régimen</span> <b>{patient.regimen}</b></div>
          )}
          {patient.numeroContrato && (
            <div className="ar-item"><span className="lbl">N° Contrato</span> <b>{patient.numeroContrato}</b></div>
          )}
          {patient.idContrato && (
            <div className="ar-item"><span className="lbl">ID Contrato</span> <b>{patient.idContrato}</b></div>
          )}
          {secondRow?.map((item) => (
            <div className="ar-item" key={item.label}>
              <span className="lbl">{item.label}</span> <b>{item.value}</b>
            </div>
          ))}
          {/* Encargo explícito (replicado desde CargosModal): el badge de
              estado vive en la fila de admisión, no en patient-banner-right. */}
          {statusBadge && (
            <Badge tone={statusBadge.tone} dot>{statusBadge.label}</Badge>
          )}
          {secondRowButton && (
            <button type="button" className="pb-row-btn" onClick={secondRowButton.onClick}>
              {secondRowButton.icon && <secondRowButton.icon className="icon" aria-hidden="true" />}
              {secondRowButton.label}
            </button>
          )}
          <button
            type="button"
            className="ar-toggle"
            onClick={() => setCollapsed(true)}
            aria-expanded="true"
            aria-label="Contraer banner"
            title="Contraer banner"
          >
            <LuChevronDown className="icon" aria-hidden="true" />
          </button>
        </div>
      )}
      {detailOpen && (
        <PatientDetailModal patient={patient} secondRow={secondRow} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}
