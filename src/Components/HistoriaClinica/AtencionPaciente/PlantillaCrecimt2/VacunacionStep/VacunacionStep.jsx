'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './VacunacionStep.css';
import { LuChevronDown, LuCircle, LuCircleCheck, LuExpand, LuPlus, LuSyringe, LuTrash2, LuX } from 'react-icons/lu';

// Los 8 momentos del esquema legacy, en orden — "sub" es la línea secundaria
// que algunos momentos llevan (dosis/refuerzo) para no apretar todo en una
// sola línea dentro de una columna angosta de la matriz.
const MOMENTOS = [
  { key: 'rn', label: 'Recién nacido' },
  { key: 'm2', label: '2 meses', sub: '1ra dosis' },
  { key: 'm4', label: '4 meses', sub: '2da dosis' },
  { key: 'm6', label: '6 meses', sub: '3ra dosis' },
  { key: 'm7', label: '7 meses' },
  { key: 'a1', label: 'Un año' },
  { key: 'ref1', label: 'Refuerzo al año', sub: 'de las 3 dosis' },
  { key: 'ref5', label: '2do refuerzo', sub: 'a los 5 años' },
];

// `aplica` es la regla clínica que distingue una combinación biológico×momento
// pendiente (aplica, sin fecha) de una que no aplica en absoluto (esquema no
// contempla esa dosis en ese momento) — ver 2. SECCIÓN: ANTECEDENTES
// VACUNALES del encargo. Los biológicos con dosis únicas (BCG) o de 2 tomas
// (Antirotavirus) simplemente traen menos momentos en su lista.
const BIOLOGICOS = [
  { key: 'bcg', label: 'B.C.G.', aplica: ['rn'] },
  { key: 'polio', label: 'Polio', aplica: ['m2', 'm4', 'm6', 'ref1', 'ref5'] },
  { key: 'hepB', label: 'Antihepatitis B', aplica: ['rn', 'm2', 'm4', 'm6'] },
  { key: 'hib', label: 'Haemophilus I', aplica: ['m2', 'm4', 'm6'] },
  { key: 'dpt', label: 'D.P.T.', aplica: ['m2', 'm4', 'm6', 'ref1', 'ref5'] },
  { key: 'rota', label: 'Antirotavirus', aplica: ['m2', 'm4'] },
  { key: 'neumo', label: 'Antineumococo', aplica: ['m2', 'm4', 'a1'] },
  { key: 'influenza', label: 'Influenza estacional', aplica: ['m7', 'a1'] },
  { key: 'srp', label: 'S.R.P. (Tripleviral)', aplica: ['a1', 'ref5'] },
  { key: 'fiebreAmarilla', label: 'Fiebre Amarilla', aplica: ['a1'] },
  { key: 'hepA', label: 'Hepatitis A', aplica: ['a1'] },
  { key: 'varicela', label: 'Varicela', aplica: ['a1'] },
];

// Valores de ejemplo del formulario legacy (punto 5 del encargo: "no
// modificar ni eliminar estos valores del ejemplo visual") — asignados al
// primer momento aplicable de cada biológico, en formato ISO porque
// <input type="date"> solo acepta yyyy-mm-dd como value sin importar el
// locale con el que el navegador lo muestre.
function initialFechas() {
  return {
    bcg: { rn: '2026-08-13' },
    polio: { m2: '2026-08-23' },
    hepB: { rn: '2026-08-18' },
    hib: { m2: '2026-08-14' },
  };
}

// Tabla en sí de la matriz — extraída como función local (no exportada, no
// vive en su propio archivo: depende de MOMENTOS/BIOLOGICOS, ambos locales a
// este módulo) porque el punto 6 del encargo la reutiliza 2 veces: la
// versión compacta de siempre (dentro de .vac-matrix-wrap, con scroll
// horizontal en pantallas angostas) y la copia ampliada del modal "Expandir
// esquema" (ver VacunacionStep, más abajo) — mismo estado `fechas`/`setFecha`
// en ambas, así que nunca hay 2 fuentes de verdad para el mismo esquema.
function VacMatrixTable({ fechas, setFecha }) {
  return (
    <table className="vac-matrix">
      <caption className="sr-only">
        Esquema de vacunación: fecha de aplicación por biológico y momento del esquema
      </caption>
      <thead>
        <tr>
          <th scope="col" className="vac-matrix-corner">Biológico</th>
          {MOMENTOS.map((m) => (
            <th key={m.key} scope="col" className="vac-matrix-col-head">
              <span className="vac-momento-label">{m.label}</span>
              {m.sub && <span className="vac-momento-sub">{m.sub}</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {BIOLOGICOS.map((bio) => (
          <tr key={bio.key}>
            <th scope="row" className="vac-matrix-row-head">{bio.label}</th>
            {MOMENTOS.map((m) => {
              const aplica = bio.aplica.includes(m.key);
              if (!aplica) {
                return (
                  <td key={m.key} className="vac-cell vac-cell-na">
                    <span className="sr-only">No aplica</span>
                    <span aria-hidden="true">—</span>
                  </td>
                );
              }
              const valor = fechas[bio.key]?.[m.key] ?? '';
              const aplicada = Boolean(valor);
              return (
                <td key={m.key} className={`vac-cell${aplicada ? ' vac-cell-done' : ' vac-cell-pending'}`}>
                  <div className="vac-cell-inner">
                    <span className="vac-cell-status">
                      {aplicada
                        ? <LuCircleCheck className="icon" aria-hidden="true" />
                        : <LuCircle className="icon" aria-hidden="true" />}
                      <span className="sr-only">{aplicada ? 'Aplicada' : 'Pendiente'}</span>
                    </span>
                    <input
                      type="date"
                      className="vac-date-input"
                      value={valor}
                      aria-label={`${bio.label} — ${m.label}${m.sub ? ` ${m.sub}` : ''}`}
                      onChange={(e) => setFecha(bio.key, m.key, e.target.value)}
                    />
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Paso 5 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — rediseño del
// formulario legacy "Vacunación / Antecedentes vacunales": misma info
// clínica (13 biológicos × 8 momentos), reorganizada en una matriz
// escaneable en vez de la tabla legacy. Se mantiene SIEMPRE montado (el
// padre lo oculta con `hidden`) para no perder lo ya diligenciado al ir y
// volver entre pasos. La matriz de escritorio, las tarjetas de mobile y la
// copia ampliada del modal "Expandir esquema" comparten el mismo estado
// `fechas` (ver VacMatrixTable arriba) — se renderizan según corresponda y
// la CSS decide cuál mostrar en cada breakpoint (mismo patrón que
// AgendaTable, ver AGENTS.md), así que no hay dos fuentes de verdad para el
// mismo esquema.
//
// "Factores de riesgo en el hogar" vivía acá como segunda subsección (punto
// 7 del encargo original), pero se separó a su propio paso (ver
// FactoresRiesgoStep.jsx) — con una sola subsección real ya no hace falta
// scrollspy acá (mismo criterio de simplicidad que RiesgoStep.jsx: una card,
// `scrollToSub` no-op), y evita el salto de scroll que el scrollIntoView
// entre dos bloques tan distintos disparaba al navegar por el panel
// izquierdo.
const VacunacionStep = forwardRef(function VacunacionStep({ hidden }, ref) {
  const [fechas, setFechas] = useState(initialFechas);
  const [otrasVacunas, setOtrasVacunas] = useState([{ nombre: '', fecha: '' }]);
  const [openBio, setOpenBio] = useState(null); // acordeón mobile: un biológico abierto a la vez
  const [expandOpen, setExpandOpen] = useState(false); // modal "Expandir esquema" (punto 6 del encargo)
  const expandCloseRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  // Escape cierra el modal — igual que PlantillaModal.jsx, pero sin su focus
  // trap: acá adentro no hay un flujo secuencial que "elegir" (es una vista
  // de zoom sobre la misma matriz, no un catálogo con Cancelar/Elegir), así
  // que Tab escapándose hacia el resto de la página detrás del overlay no
  // rompe ninguna tarea en curso.
  useEffect(() => {
    if (!expandOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setExpandOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandOpen]);

  function setFecha(bioKey, momentoKey, value) {
    setFechas((prev) => ({ ...prev, [bioKey]: { ...prev[bioKey], [momentoKey]: value } }));
  }

  function updateOtraVacuna(index, patch) {
    setOtrasVacunas((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function addOtraVacuna() {
    setOtrasVacunas((prev) => [...prev, { nombre: '', fecha: '' }]);
  }
  function removeOtraVacuna(index) {
    setOtrasVacunas((prev) => prev.filter((_, i) => i !== index));
  }

  const totalAplicables = BIOLOGICOS.reduce((sum, b) => sum + b.aplica.length, 0);
  const totalAplicadas = BIOLOGICOS.reduce(
    (sum, b) => sum + b.aplica.filter((m) => fechas[b.key]?.[m]).length,
    0,
  );

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <div className="vac-header-row">
        <div className="vac-header-text">
          <div className="vac-title-row">
            <h1 className="pf-section-title">Esquema de vacunación</h1>
            <span className={`vac-progress-pill${totalAplicadas === totalAplicables ? ' complete' : ''}`}>
              {totalAplicadas}/{totalAplicables} dosis aplicadas
            </span>
          </div>
          <p className="pf-section-desc">Registra la fecha de aplicación de cada dosis. Las combinaciones que no hacen parte del esquema
          quedan deshabilitadas.</p>
        </div>
        <div className="vac-header-actions">
          <button type="button" className="btn btn-secondary vac-expand-btn" onClick={() => setExpandOpen(true)}>
            <LuExpand className="icon" aria-hidden="true" />
            Expandir esquema
          </button>
        </div>
      </div>

      <div className="pf-group">
        
        <div className="vac-matrix-wrap">
          <VacMatrixTable fechas={fechas} setFecha={setFecha} />
        </div>

        <div className="vac-cards">
          {BIOLOGICOS.map((bio) => {
            const dosisAplicables = MOMENTOS.filter((m) => bio.aplica.includes(m.key));
            const aplicadas = dosisAplicables.filter((m) => fechas[bio.key]?.[m.key]).length;
            const isOpen = openBio === bio.key;
            return (
              <div className="vac-card" key={bio.key}>
                <button
                  type="button"
                  className="vac-card-header"
                  onClick={() => setOpenBio((prev) => (prev === bio.key ? null : bio.key))}
                  aria-expanded={isOpen}
                >
                  <LuSyringe className="icon vac-card-icon" aria-hidden="true" />
                  <span className="vac-card-title">{bio.label}</span>
                  <span className={`vac-card-progress${aplicadas === dosisAplicables.length ? ' complete' : ''}`}>
                    {aplicadas}/{dosisAplicables.length}
                  </span>
                  <LuChevronDown className={`icon vac-card-chevron${isOpen ? ' open' : ''}`} aria-hidden="true" />
                </button>

                {isOpen && (
                  <div className="vac-card-body">
                    {dosisAplicables.map((m) => {
                      const valor = fechas[bio.key]?.[m.key] ?? '';
                      const aplicada = Boolean(valor);
                      const inputId = `vac-${bio.key}-${m.key}-mobile`;
                      return (
                        <div className="vac-dose-row" key={m.key}>
                          <div className="vac-dose-info">
                            <span className="vac-dose-label">{m.label}{m.sub ? ` — ${m.sub}` : ''}</span>
                            <span className={`vac-dose-state${aplicada ? ' done' : ''}`}>
                              {aplicada
                                ? <LuCircleCheck className="icon" aria-hidden="true" />
                                : <LuCircle className="icon" aria-hidden="true" />}
                              {aplicada ? 'Aplicada' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="form-field vac-dose-date">
                            <label htmlFor={inputId} className="sr-only">
                              Fecha — {bio.label} — {m.label}{m.sub ? ` ${m.sub}` : ''}
                            </label>
                            <input
                              id={inputId}
                              type="date"
                              value={valor}
                              onChange={(e) => setFecha(bio.key, m.key, e.target.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pf-group">
        <h2 className="pf-card-title">Otras vacunas</h2>
        <p className="pf-card-desc">Registra vacunas adicionales no incluidas en el esquema principal.</p>

        <div className="vac-otras-list">
          <div className="vac-otras-col-labels" aria-hidden="true">
            <span>Nombre de la vacuna</span>
            <span>Fecha de aplicación</span>
          </div>
          {otrasVacunas.map((v, i) => (
            <div className="vac-otra-row" key={i}>
              <div className="form-field">
                <label htmlFor={`vac-otra-nombre-${i}`} className="sr-only">Nombre de la vacuna</label>
                <input
                  id={`vac-otra-nombre-${i}`}
                  type="text"
                  placeholder="Nombre de la vacuna"
                  value={v.nombre}
                  onChange={(e) => updateOtraVacuna(i, { nombre: e.target.value })}
                />
              </div>
              <div className="form-field vac-otra-fecha">
                <label htmlFor={`vac-otra-fecha-${i}`} className="sr-only">Fecha de aplicación</label>
                <input
                  id={`vac-otra-fecha-${i}`}
                  type="date"
                  value={v.fecha}
                  onChange={(e) => updateOtraVacuna(i, { fecha: e.target.value })}
                />
              </div>
              {otrasVacunas.length > 1 && (
                <button
                  type="button"
                  className="vac-otra-remove-btn"
                  onClick={() => removeOtraVacuna(i)}
                  aria-label={`Quitar fila de vacuna ${i + 1}`}
                >
                  <LuTrash2 className="icon" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-secondary vac-add-btn" onClick={addOtraVacuna}>
          <LuPlus className="icon" aria-hidden="true" />
          Agregar vacuna
        </button>
      </div>

      {expandOpen && (
        <div className="modal-overlay vac-expand-overlay" role="presentation" onClick={() => setExpandOpen(false)}>
          <div
            className="modal-card vac-expand-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vac-expand-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="vac-expand-title">Esquema de vacunación</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setExpandOpen(false)}
                aria-label="Cerrar vista ampliada"
                ref={expandCloseRef}
                autoFocus
              >
                <LuX className="icon" aria-hidden="true" />
              </button>
            </div>

            <div className="modal-body vac-expand-body">
              <div className="vac-matrix-wrap">
                <VacMatrixTable fechas={fechas} setFecha={setFecha} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default VacunacionStep;
