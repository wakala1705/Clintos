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

// Agrupa filas consecutivas con el mismo `group` (solo lo usa layout="rail"). Las filas
// sin `group` quedan en un bloque sin título.
function groupRows(rows) {
  const out = [];
  rows.forEach((r) => {
    const title = r.group ?? null;
    const last = out[out.length - 1];
    if (last && last.title === title) last.items.push(r);
    else out.push({ title, items: [r] });
  });
  return out;
}

// Banner de identidad del paciente — único en el proyecto (ver AGENTS.md
// "Banner de paciente"). Fila 1 (avatar, nombre + CC, sexo, fecha nac./edad,
// asegurador, "Ver más", ojo, alergias) igual en todas las pantallas; fila 2
// (admission-row) según la variante.
//
// - `variant` (hospitalizacion | consulta-externa | citas | cargos | cirugia, ver
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
//   `empty` (estado sin paciente). Props opt-in de UI (sin ellas el banner
//   queda igual): `ocultarVerMas` (bool, no renderiza "Ver más" ni
//   PatientDetailModal), `toggleLabel` (string, el chevron de expandir pasa a
//   botón "texto + chevron" y el de contraer dice "Ocultar <texto>"; táctil
//   ≥44px) y `privacyLabel` (string, el ojo usa ese texto como aria-label/
//   title —"Mostrar datos del paciente" al estar oculto— y suma la etiqueta
//   "Ocultar nombre"/"Mostrar nombre" solo en ≥1025px; no dice solo "Ocultar"
//   para no confundirse con "Ocultar <toggleLabel>"). Con alguna de las dos últimas el
//   banner suma la clase `pb-labeled` (fila 1 envuelve a 768px).
//   `layout="rail"` (columna lateral): filas label/valor compactas agrupadas por `group`
//   (en variantes y en `secondRow`), con título plegable; `groupOptions`
//   { [título]: { collapsed, hint } } fija qué bloques arrancan plegados y su leyenda;
//   `strong: true` en una fila la apila (valor completo en su propia línea) y la resalta.
//   `secondRow` [{ label, value }] sigue como
//   extensión libre al final de la fila 2 (solo lectura, también va al modal
//   "Ver más"); `secondRowExtra` (ReactNode) para contenido interactivo.
// - Colapsado (chevron, arranca en `defaultCollapsed` ?? el de la variante):
//   oculta la fila 2, quita ASEGURADOR y suma Cama/Diagnóstico/Médico
//   tratante a la fila 1. `compact` es otra cosa: una sola línea fija
//   (nombre/edad/cama/diagnóstico) para plantillas maximizadas.
// - El ojo enmascara nombre, documento y los campos `mask` de la variante;
//   el valor real queda en data-patient-name/doc para legacy-app.js.
export default function PatientBanner({
  patient, variant, context, secondRow, secondRowExtra, leadingSelect, secondRowButton, statusBadge, onClose, empty, compact, defaultCollapsed,
  ocultarVerMas, toggleLabel, privacyLabel, layout, groupOptions,
}) {
  const variantCfg = variant ? PATIENT_BANNER_VARIANTS[variant] : null;
  // `layout="rail"`: columna vertical para un rail lateral — todos los datos apilados,
  // siempre expandido (sin chevron de contraer/expandir).
  const rail = layout === 'rail';
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(rail ? false : (defaultCollapsed ?? variantCfg?.defaultCollapsed ?? false));
  const [dataHidden, setDataHidden] = useState(false);
  // Bloques del rail plegados: arrancan los `groupOptions[título].collapsed`.
  const [closedGroups, setClosedGroups] = useState(() => Object.fromEntries(
    Object.entries(groupOptions ?? {}).filter(([, o]) => o.collapsed).map(([t]) => [t, true]),
  ));
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
    ...(secondRow ?? []).map((item) => ({ key: `extra-${item.label}`, label: item.label, value: item.value, group: item.group, strong: item.strong })),
  ];

  const mostrarSegundaFila = !collapsed && Boolean(
    rows.length > 0 || leadingSelect || secondRowButton || statusBadge || secondRowExtra,
  );

  const eyeLabel = privacyLabel
    ? (dataHidden ? 'Mostrar datos del paciente' : privacyLabel)
    : (dataHidden ? 'Mostrar datos sensibles' : 'Ocultar datos sensibles');
  const hideLabel = toggleLabel ? `Ocultar ${toggleLabel.toLowerCase()}` : null;
  const bannerClass = `patient-banner${toggleLabel || privacyLabel ? ' pb-labeled' : ''}${rail ? ' patient-banner-rail' : ''}`;

  return (
    <div className={bannerClass} {...dataAttrs}>
      <PatientAvatar iniciales={patient.iniciales} className="patient-avatar" />
      {/* Nombre + documento agrupados en una columna (encargo explícito,
          replicado desde CargosModal) en vez de nombre solo + CC como chip
          suelto de patient-meta. */}
      <div className="patient-name-block">
        <div className="pname">{nombreMostrado}</div>
        <div className="pdoc">CC {documentoMostrado}</div>
      </div>
      <div className="patient-meta">
        {patient.hcl && <div className="pm-item"><span className="lbl">N° HCL</span> <b>{dataHidden ? maskText(patient.hcl) : patient.hcl}</b></div>}
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
        {!ocultarVerMas && (
          <button type="button" className="pm-item-more" onClick={() => setDetailOpen(true)}>Ver más</button>
        )}
      </div>
      <div className="patient-banner-right">
        {/* No navega (encargo explícito, replicado desde CargosModal):
            enmascara/revela nombre y documento (dataHidden, ver maskText),
            mismo patrón que el toggle de un campo de contraseña. */}
        <button
          type="button"
          className={`pb-icon-btn${privacyLabel ? ' pb-icon-btn-labeled' : ''}`}
          onClick={() => setDataHidden((v) => !v)}
          aria-pressed={dataHidden}
          aria-label={eyeLabel}
          title={eyeLabel}
        >
          {dataHidden ? <LuEyeOff className="icon" aria-hidden="true" /> : <LuEye className="icon" aria-hidden="true" />}
          {privacyLabel && <span className="pb-icon-btn-text" aria-hidden="true">{dataHidden ? 'Mostrar nombre' : 'Ocultar nombre'}</span>}
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
            className={`ar-toggle${toggleLabel ? ' ar-toggle-labeled' : ''}`}
            onClick={() => setCollapsed(false)}
            aria-expanded="false"
            aria-label={toggleLabel ?? 'Expandir banner'}
            title={toggleLabel ?? 'Expandir banner'}
          >
            {toggleLabel && <span>{toggleLabel}</span>}
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
          {(() => {
            const renderRow = (f) => (
              <div className={`ar-item${f.strong ? ' is-strong' : ''}`} key={f.key}>
                <span className="lbl">{f.label}</span> <b>{f.mask && dataHidden ? maskText(f.value) : f.value}</b>
              </div>
            );
            if (!rail) return rows.map(renderRow);
            return groupRows(rows).map((g) => {
              const closed = g.title ? Boolean(closedGroups[g.title]) : false;
              const hint = g.title ? groupOptions?.[g.title]?.hint : null;
              return (
                <div className="ar-group" key={g.title ?? 'sin-titulo'}>
                  {g.title && (
                    <h4 className="ar-group-head">
                      <button
                        type="button"
                        className="ar-group-toggle"
                        aria-expanded={!closed}
                        onClick={() => setClosedGroups((c) => ({ ...c, [g.title]: !c[g.title] }))}
                      >
                        <span className="ar-group-title">{g.title}</span>
                        {hint && <span className="ar-group-hint">{hint}</span>}
                        <LuChevronDown className={`icon ar-group-chev${closed ? '' : ' is-open'}`} aria-hidden="true" />
                      </button>
                    </h4>
                  )}
                  {!closed && <div className="ar-group-rows">{g.items.map(renderRow)}</div>}
                </div>
              );
            });
          })()}
          {/* `secondRowExtra`: contenido interactivo libre de la pantalla (ej. un
              input) — no entra al modal "Ver más" como sí lo hace secondRow. */}
          {secondRowExtra}
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
          {!rail && (
            <button
              type="button"
              className={`ar-toggle${toggleLabel ? ' ar-toggle-labeled' : ''}`}
              onClick={() => setCollapsed(true)}
              aria-expanded="true"
              aria-label={hideLabel ?? 'Contraer banner'}
              title={hideLabel ?? 'Contraer banner'}
            >
              {hideLabel && <span>{hideLabel}</span>}
              <LuChevronUp className="icon" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {detailOpen && !ocultarVerMas && (
        <PatientDetailModal patient={patient} secondRow={rows} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}
