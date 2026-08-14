'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './CrecimientoStep.css';
import { LuChartLine, LuChevronDown, LuHistory, LuRuler, LuWeight } from 'react-icons/lu';
import GrowthIndicatorRow from './GrowthIndicatorRow/GrowthIndicatorRow';
import GrowthChartModal from './GrowthChartModal/GrowthChartModal';
import { calcularZ, parseEdadMeses } from './GrowthChartModal/growthChartData';
import {
  GRUPOS_INDICADORES, COLUMNAS_AREAS, COLUMNAS_CRECIMIENTO, HISTORICO_EVALUACIONES,
  PREGUNTAS_APGAR, OPCIONES_APGAR, calcularApgar, CLASE_APGAR, opcionPorZ,
} from './crecimientoData';

const SCROLL_OFFSET = 32; // px desde el techo del panel de contenido que cuenta como "línea activa"

// '' / null / undefined -> null (nunca 0: Number('') es 0, que leería como
// una medición real de cero en vez de "todavía sin diligenciar").
function toNum(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// Ícono identificador por grupo de "Verificar el crecimiento" (ver
// GRUPOS_INDICADORES en crecimientoData.js) — mapeado por `id` en vez de
// guardar el componente de ícono directamente en la data, para que
// crecimientoData.js siga siendo JSON-friendly (sin imports de JSX).
const GRUPO_ICONOS = { peso: LuWeight, talla: LuRuler };
// Columnas de la grilla de "Verificar el crecimiento" por grupo (encargo
// explícito: Peso en 3 columnas — sus 3 indicadores caben en una sola fila
// —, Talla y composición corporal en 2, una por cada uno de sus 2
// indicadores, ver GRUPOS_INDICADORES en crecimientoData.js).
const GRUPO_COLS = { peso: 3, talla: 2 };

// Paso "10 Crecimiento y APGAR familiar" del wizard (ver SECCIONES en
// PlantillaCrecimt2.jsx) — 2 instrumentos sin relación clínica entre sí que
// comparten la misma pantalla en el formulario legacy: verificación de
// indicadores de crecimiento (con su síntesis histórica) y el cuestionario
// APGAR familiar de Smilkstein (ver crecimientoData.js). Mismo patrón de
// scrollspy de 3 subsecciones que AlimentacionStep.jsx/ExamenFisicoStep.jsx.
// Se mantiene SIEMPRE montado (el padre lo oculta con `hidden`) para no
// perder lo ya diligenciado al ir y volver entre pasos. No bloquea "Guardar
// y continuar" — mismo criterio que EadStep.jsx: exigir el 100% de 5
// indicadores + 5 preguntas no es la única validación dura del formulario
// (esa reserva es de Consulta/Examen físico, ver PlantillaCrecimt2.jsx).
const CrecimientoStep = forwardRef(function CrecimientoStep(
  { hidden, activeSubIndex, onActiveSubIndexChange, scrollContainerRef, patientSexo, patientEdad, patientNombre, examenFisico },
  ref,
) {
  const [sintesisOpen, setSintesisOpen] = useState(false);
  const [selectedHistRow, setSelectedHistRow] = useState(null);
  const [respuestasApgar, setRespuestasApgar] = useState({});
  const [chartModal, setChartModal] = useState({ open: false, indicadorId: null });

  const sectionRefs = useRef([]);
  function setRef(index) {
    return (el) => { sectionRefs.current[index] = el; };
  }

  const apgarResultado = calcularApgar(respuestasApgar);

  const edadMeses = useMemo(() => parseEdadMeses(patientEdad), [patientEdad]);

  // {indicadorKey: opción|null} — "Verificar el crecimiento" ya NO es un
  // formulario manual (encargo explícito: "el usuario no tiene que llenar
  // el paso 10"): cada opción se deriva del z-score real de Peso/Talla/PC/
  // IMC de "09 Examen físico" (`examenFisico`, levantado hasta
  // PlantillaCrecimt2.jsx, ver ExamenFisicoStep.jsx) contra la edad/sexo del
  // paciente (calcularZ en growthChartData.js + opcionPorZ en
  // crecimientoData.js). null mientras falte el dato de origen — nunca una
  // opción por defecto que podría leerse como resultado clínico real.
  // Peso/Talla DE es el único indicador cuyo eje real es la talla (cm), no
  // la edad (ver `usaTalla` en INDICADORES_GRAFICA, growthChartData.js).
  const medicionesActuales = useMemo(() => {
    const peso = toNum(examenFisico?.peso);
    const talla = toNum(examenFisico?.talla);
    const pc = toNum(examenFisico?.pc);
    const imc = toNum(examenFisico?.imc);

    function derivar(key, x, valorReal) {
      return opcionPorZ(key, calcularZ(key, patientSexo, x, valorReal));
    }

    return {
      pesoEdadDE: derivar('pesoEdadDE', edadMeses, peso),
      pesoTallaDE: derivar('pesoTallaDE', talla, peso),
      perimetroCefalico: derivar('perimetroCefalico', edadMeses, pc),
      tallaEdadDE: derivar('tallaEdadDE', edadMeses, talla),
      imc: derivar('imc', edadMeses, imc),
    };
  }, [examenFisico, edadMeses, patientSexo]);

  // Único botón "Ver evolución" para las 5 filas de "Verificar el
  // crecimiento" (antes uno por fila — encargo explícito: las 5 abrían el
  // mismo modal, que ya trae su propio selector de indicador por chips, ver
  // GrowthChartModal.jsx). Abre sobre el primer indicador ya clasificado (lo
  // más útil de ver de entrada); sin ninguno con dato de origen, cae al
  // primero de la lista.
  function handleVerEvolucion() {
    const todos = GRUPOS_INDICADORES.flatMap((g) => g.indicadores);
    const conValor = todos.find((ind) => medicionesActuales[ind.key]);
    setChartModal({ open: true, indicadorId: (conValor ?? todos[0]).key });
  }

  useImperativeHandle(ref, () => ({
    scrollToSub(index) {
      const node = sectionRefs.current[index];
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

  useEffect(() => {
    if (hidden) return; // paso oculto: no recalcular sobre un contenedor con display:none
    const el = scrollContainerRef.current;
    if (!el) return;

    let ticking = false;
    function computeActive() {
      ticking = false;
      const containerTop = el.getBoundingClientRect().top;
      let next = 0;
      sectionRefs.current.forEach((node, i) => {
        if (!node) return;
        const top = node.getBoundingClientRect().top - containerTop;
        if (top <= SCROLL_OFFSET) next = i;
      });
      onActiveSubIndexChange(next);
    }
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(computeActive);
    }
    computeActive();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hidden, scrollContainerRef, onActiveSubIndexChange]);

  // Atajo de teclado "G" para "Ver evolución" (encargo explícito) — solo
  // mientras este paso está visible y no hay un campo de texto enfocado (para
  // no interceptar una "g" que el usuario esté escribiendo en un input), y
  // sin modificadores para no pisar atajos del navegador (Ctrl/Alt/Meta+G).
  useEffect(() => {
    if (hidden) return;
    function handleKeyDown(e) {
      if (e.key.toLowerCase() !== 'g' || e.ctrlKey || e.altKey || e.metaKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      handleVerEvolucion();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hidden, medicionesActuales]);

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <div className="cre-header-row">
        <h1 className="pf-section-title">Crecimiento y APGAR familiar</h1>
        <button
          type="button"
          className="btn btn-secondary gc-evolucion-btn"
          onClick={handleVerEvolucion}
          title="Ver evolución (tecla G)"
        >
          <LuChartLine className="icon" aria-hidden="true" />
          Ver evolución
        </button>
      </div>
      <p className="pf-section-desc">Verifica el crecimiento del niño, consulta su histórico de evaluaciones y registra el cuestionario APGAR familiar.</p>

      <div id="cre-verificar" ref={setRef(0)} className="ac-mega">
        <section className="pf-card">
          {GRUPOS_INDICADORES.map((grupo, gi) => {
            const GrupoIcon = GRUPO_ICONOS[grupo.id];
            return (
              <div key={grupo.id}>
                {gi > 0 && <div className="pf-divider" aria-hidden="true" />}
                <h3 className="pf-subheading gc-group-heading">
                  {GrupoIcon && <GrupoIcon className="icon gc-group-icon" aria-hidden="true" />}
                  {grupo.label}
                </h3>
                <div className={`gc-indicator-list gc-indicator-grid-${GRUPO_COLS[grupo.id]}`}>
                  {grupo.indicadores.map((ind) => (
                    <GrowthIndicatorRow
                      key={ind.key}
                      label={ind.label}
                      opcion={medicionesActuales[ind.key]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <div id="cre-sintesis" ref={setRef(1)} className="ac-mega">
        <section className="pf-card pf-card-split">
          <button
            type="button"
            className="pf-block-header"
            onClick={() => setSintesisOpen((o) => !o)}
            aria-expanded={sintesisOpen}
          >
            <span className="pf-block-heading">
              <span className="pf-block-icon"><LuHistory className="icon" aria-hidden="true" /></span>
              <span className="pf-block-header-title">
                <h2 className="pf-card-title">Síntesis de evaluaciones</h2>
                <p className="pf-card-desc">Histórico de evaluaciones de desarrollo y crecimiento del paciente.</p>
              </span>
            </span>
            <LuChevronDown className={`icon pf-block-chevron${sintesisOpen ? '' : ' collapsed'}`} aria-hidden="true" />
          </button>

          {sintesisOpen && (
            <div className="gc-hist-body">
              <div className="gc-hist-wrap">
                <table className="data-table gc-hist-table">
                  <thead>
                    <tr>
                      <th rowSpan={2}>Fecha evaluación</th>
                      <th rowSpan={2} className="num">Edad (meses)</th>
                      <th colSpan={5} className="gc-group-head">Resultados por áreas</th>
                      <th colSpan={5} className="gc-group-head gc-group-divider">Crecimiento</th>
                    </tr>
                    <tr>
                      {COLUMNAS_AREAS.map((c) => (
                        <th key={c.key} title={c.label}>{c.label}</th>
                      ))}
                      {COLUMNAS_CRECIMIENTO.map((c, ci) => (
                        <th key={c.key} title={c.label} className={ci === 0 ? 'gc-group-divider' : undefined}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORICO_EVALUACIONES.map((r, i) => (
                      <tr
                        key={i}
                        tabIndex={0}
                        className={selectedHistRow === i ? 'selected' : undefined}
                        aria-selected={selectedHistRow === i}
                        onClick={() => setSelectedHistRow((s) => (s === i ? null : i))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedHistRow((s) => (s === i ? null : i));
                          }
                        }}
                      >
                        <td className="cell-primary">{r.fecha}</td>
                        <td className="num cell-muted">{r.edad}</td>
                        {COLUMNAS_AREAS.map((c) => (
                          <td key={c.key} className="cell-muted">{r[c.key] ?? '—'}</td>
                        ))}
                        {COLUMNAS_CRECIMIENTO.map((c, ci) => (
                          <td key={c.key} className={`cell-muted${ci === 0 ? ' gc-group-divider' : ''}`}>{r[c.key] ?? '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <div id="cre-apgar" ref={setRef(2)} className="ac-mega">
        <section className="pf-card">
          <h2 className="pf-card-title">Clasificación APGAR Familiar</h2>
          <p className="pf-card-desc">Percepción del niño/cuidador sobre el funcionamiento de su familia.</p>

          <div className="gc-apgar-list">
            {PREGUNTAS_APGAR.map((p) => {
              const labelId = `${p.id}-label`;
              return (
                <div className="form-field pf-question-row" key={p.id}>
                  <p id={labelId}>{p.texto}</p>
                  <div className="pf-toggle-group gc-apgar-toggle" role="group" aria-labelledby={labelId}>
                    {OPCIONES_APGAR.map((o) => (
                      <button
                        type="button"
                        key={o.value}
                        className={`pf-toggle-btn${respuestasApgar[p.id] === o.value ? ' active' : ''}`}
                        aria-pressed={respuestasApgar[p.id] === o.value}
                        onClick={() => setRespuestasApgar((prev) => ({ ...prev, [p.id]: o.value }))}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="gc-apgar-result">
            <div className="gc-apgar-result-item">
              <span className="gc-apgar-result-label">Puntos APGAR</span>
              <span className="gc-apgar-result-value">{apgarResultado.puntaje ?? '—'}</span>
            </div>
            <div className="gc-apgar-result-item">
              <span className="gc-apgar-result-label">Clasificación</span>
              <span className={`gc-apgar-class${apgarResultado.clasificacion ? ` gc-apgar-class-${CLASE_APGAR[apgarResultado.clasificacion]}` : ''}`}>
                {apgarResultado.clasificacion || 'Pendiente'}
              </span>
            </div>
            {apgarResultado.puntaje == null && (
              <p className="gc-apgar-result-hint">Responde las 5 preguntas para calcular el puntaje.</p>
            )}
          </div>
        </section>
      </div>

      <GrowthChartModal
        open={chartModal.open}
        indicadorId={chartModal.indicadorId}
        onIndicadorChange={(key) => setChartModal((s) => ({ ...s, indicadorId: key }))}
        onClose={() => setChartModal((s) => ({ ...s, open: false }))}
        sexo={patientSexo}
        edadLabel={patientEdad}
        edadMeses={edadMeses}
        medicionesActuales={medicionesActuales}
        nombrePaciente={patientNombre}
        examenFisico={examenFisico}
      />
    </div>
  );
});

export default CrecimientoStep;
