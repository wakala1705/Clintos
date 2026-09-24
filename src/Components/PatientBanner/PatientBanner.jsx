'use client';

import { useEffect, useRef, useState } from 'react';
import './PatientBanner.css';
import Badge from '@/Components/Badge/Badge';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import PatientDetailModal from './PatientDetailModal/PatientDetailModal';
import { BASE_FIELDS, PATIENT_BANNER_VARIANTS } from '@/hooks/PatientBanner/variants';
import {
  LuChevronDown, LuChevronUp, LuCircleAlert, LuEye, LuEyeOff, LuSearch, LuUserPlus, LuX,
} from 'react-icons/lu';

// Enmascara un valor manteniendo su longitud/espacios (mismo criterio que un
// campo de contraseña). El botón de ojo de patient-banner-right alterna esto
// sobre nombre/documento en vez de navegar a ningún lado.
function maskText(value) {
  return String(value).replace(/\S/g, '•');
}

// Banner de identidad del paciente — único en el proyecto (ver AGENTS.md
// "Banner de paciente"). Fila 1 (avatar, nombre + CC, sexo, fecha nac./edad,
// asegurador, "Ver más", ojo, alergias) igual en todas las pantallas; fila 2
// (admission-row) según la variante.
//
// - `variant` (hospitalizacion | consulta-externa | citas | cargos, ver
//   @/hooks/PatientBanner/variants.js): campos de la fila 2, en orden, y si
//   abre contraído. `context` trae los valores de esa fila que no son del
//   paciente (la cita, citas futuras...); cada campo se busca primero en
//   `context` y después en `patient`, y se omite si no tiene valor. Sin
//   `variant` = banner base (set de campos de admisión de Cargos, cada uno
//   solo si viene en `patient`).
// - Extras que dependen de callbacks de la pantalla (no son de la variante):
//   `leadingSelect` { label, value, options, onChange } y `secondRowButton`
//   { label, icon, onClick } al inicio/final de la fila 2, `statusBadge`
//   { label, tone } dentro de la fila 2, `onClose` (quitar paciente) y
//   `empty` (estado sin paciente). `secondRow` [{ label, value }] sigue como
//   extensión libre al final de la fila 2.
// - Colapsado (chevron, arranca en `defaultCollapsed` ?? el de la variante):
//   oculta la fila 2, quita ASEGURADOR y suma Cama/Diagnóstico/Médico
//   tratante a la fila 1. `compact` es otra cosa: una sola línea fija
//   (nombre/edad/cama/diagnóstico) para plantillas maximizadas.
// - El ojo enmascara nombre, documento y los campos `mask` de la variante;
//   el valor real queda en data-patient-name/doc para legacy-app.js.
export default function PatientBanner({
  patient, variant, context, secondRow, leadingSelect, secondRowButton, statusBadge, onClose, empty, compact, defaultCollapsed,
}) {
  const variantCfg = variant ? PATIENT_BANNER_VARIANTS[variant] : null;
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? variantCfg?.defaultCollapsed ?? false);
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

  // Valor real (nunca enmascarado) para los módulos imperativos que necesitan
  // el paciente del banner (legacy-app.js de Enfermería lo copia a sus
  // modales) — leer el texto visible rompe con el ojo activado o al mover
  // un campo de lugar.
  const dataAttrs = { 'data-patient-name': patient.nombre, 'data-patient-doc': patient.documento };

  if (compact) {
    return (
      <div className="patient-banner patient-banner-compact" {...dataAttrs}>
        <PatientAvatar iniciales={patient.iniciales} className="patient-avatar" />
        <div className="patient-name-block"><div className="pname">{nombreMostrado}</div></div>
        <div className="patient-meta">
          <div className="pm-item"><span className="lbl">EDAD</span> <b>{patient.edad}</b></div>
          {patient.cama && <div className="pm-item"><span className="lbl">CAMA</span> <b>{patient.cama}</b></div>}
          {patient.diagnostico && <div className="pm-item"><span className="lbl">DIAGNÓSTICO</span> <b>{patient.diagnostico}</b></div>}
        </div>
      </div>
    );
  }

  // Colapsado = la misma fila 1 del banner expandido con la fila 2
  // (admission-row) oculta: sin ASEGURADOR y con Cama/Diagnóstico
  // (`patient.cama`/`diagnostico`/`medicoTratante`, opcionales) en columnas label
  // arriba/valor abajo, igual que el resto de pm-item.
  // Campos de la fila 2: los de la variante (o el set base) con valor, más
  // `secondRow` como extensión libre al final.
  const fieldRows = (variantCfg?.fields ?? BASE_FIELDS)
    .map((f) => ({ ...f, value: context?.[f.key] ?? patient[f.key] }))
    .filter((f) => f.value !== undefined && f.value !== null && f.value !== '');
  const rows = [
    ...fieldRows,
    ...(secondRow ?? []).map((item) => ({ key: `extra-${item.label}`, label: item.label, value: item.value })),
  ];

  const mostrarSegundaFila = !collapsed && Boolean(
    rows.length > 0 || leadingSelect || secondRowButton || statusBadge,
  );

  return (
    <div className="patient-banner" {...dataAttrs}>
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
        {!collapsed && patient.eps && <div className="pm-item"><span className="lbl">ASEGURADOR</span> <b>{patient.eps}</b></div>}
        {collapsed && patient.cama && <div className="pm-item"><span className="lbl">CAMA</span> <b>{patient.cama}</b></div>}
        {collapsed && patient.diagnostico && <div className="pm-item"><span className="lbl">DIAGNÓSTICO</span> <b>{patient.diagnostico}</b></div>}
        {collapsed && patient.medicoTratante && <div className="pm-item"><span className="lbl">MÉDICO TRATANTE</span> <b>{patient.medicoTratante}</b></div>}
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
        {collapsed && (
          <button
            type="button"
            className="ar-toggle"
            onClick={() => setCollapsed(false)}
            aria-expanded="false"
            aria-label="Expandir banner"
            title="Expandir banner"
          >
            <LuChevronDown className="icon" aria-hidden="true" />
          </button>
        )}
        {onClose && (
          <button type="button" className="close-x" onClick={onClose} aria-label="Quitar paciente" title="Quitar paciente">
            <LuX className="icon" />
          </button>
        )}
      </div>
      {mostrarSegundaFila && (
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
          {/* Campos de la variante (ver @/hooks/PatientBanner/variants.js)
              + secondRow — cada uno se omite si no tiene valor. */}
          {rows.map((f) => (
            <div className="ar-item" key={f.key}>
              <span className="lbl">{f.label}</span> <b>{f.mask && dataHidden ? maskText(f.value) : f.value}</b>
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
            <LuChevronUp className="icon" aria-hidden="true" />
          </button>
        </div>
      )}
      {detailOpen && (
        <PatientDetailModal patient={patient} secondRow={rows} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}
