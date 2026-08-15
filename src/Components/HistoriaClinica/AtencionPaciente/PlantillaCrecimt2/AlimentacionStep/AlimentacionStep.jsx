'use client';

import {
  forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState,
} from 'react';
import './AlimentacionStep.css';
import SiNoField from '../SiNoField/SiNoField';
import { LuChevronDown, LuHistory } from 'react-icons/lu';

const SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

// "Tipo de lactancia" NO es una selección manual: es un resultado derivado
// de "Toma actualmente lactancia materna?" + "Consumo durante el día
// anterior" (encargo explícito) — se muestra como campo no editable,
// resaltado en verde igual que en el legacy (ver .al-tipo-lactancia-result
// en AlimentacionStep.css), mismo criterio de "diferenciar visualmente un
// campo calculado de uno editable" que el IMC de ExamenFisicoStep.jsx.
// "Toma actualmente lactancia materna?" también decide si el bloque
// "Consumo durante el día anterior" se muestra (ver al-consumo más abajo,
// anidado en esta misma card justo debajo de este campo): si el niño no
// toma lactancia materna actualmente, ese consumo no aplica y el bloque
// completo se deja de montar en vez de mostrarse deshabilitado.
//
// Reglas (encargo explícito):
// - Toma actualmente = No → "Lactancia materna exclusiva" (no depende del
//   consumo del día anterior, que ni siquiera se pregunta en este caso).
// - Toma actualmente = Sí y las 4 respuestas de consumo son "No" (no
//   recibió líquidos/leche animal/fórmula/sólidos) → también "Lactancia
//   materna exclusiva": solo tomó pecho.
// - Toma actualmente = Sí pero al menos una respuesta de consumo es "Sí"
//   → "Lactancia parcial": el pecho se combina con algo más.
function calcularTipoLactancia(tomaActualmente, consumoAyer) {
  if (tomaActualmente === 'no') return 'Lactancia materna exclusiva';
  const soloRecibioPecho = Object.values(consumoAyer).every((respuesta) => respuesta === 'no');
  return soloRecibioPecho ? 'Lactancia materna exclusiva' : 'Lactancia parcial';
}

const EVALUACION_AGARRE = [
  { value: 'buen_agarre', label: 'Buen agarre' },
  { value: 'agarre_regular', label: 'Agarre regular' },
  { value: 'no_agarre', label: 'No agarre' },
];

// Datos de ejemplo del histórico — mismo patrón de la tabla legacy (5 filas,
// solo una con valores diligenciados) para que la sección "Registro
// histórico" no se vea vacía en la demo.
const HISTORICO_ALIMENTACION = [
  { fecha: '10/08/2026', edad: '55,00' },
  {
    fecha: '10/08/2026', edad: '55,00',
    lactanciaMaterna: 'Sí', vecesLM: 6, biberon: 'Sí',
    otrasLeches: 'No', vecesOtras: 5, alimComplementaria: 'No', vecesComplementaria: 5,
  },
  { fecha: '10/08/2026', edad: '55,00' },
  { fecha: '10/08/2026', edad: '55,00' },
  { fecha: '11/08/2026', edad: '55,00' },
];

const SCROLL_OFFSET = 32; // px desde el techo del panel de contenido que cuenta como "línea activa"

// Paso 4 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — rediseño del
// formulario legacy "Alimentación y evaluación de la lactancia materna"
// (misma info clínica, reorganizada en 5 secciones con su propio scrollspy,
// mismo patrón que AntecedentesStep.jsx). Se mantiene SIEMPRE montado (el
// padre lo oculta con `hidden`) para no perder lo ya diligenciado al ir y
// volver entre pasos.
const AlimentacionStep = forwardRef(function AlimentacionStep(
  { hidden, activeSubIndex, onActiveSubIndexChange, scrollContainerRef },
  ref,
) {
  const [lactanciaMaterna, setLactanciaMaterna] = useState({
    exclusiva6m: 'si', edadDestete: 5, tomaActualmente: 'si',
  });
  const [introduccionAlimentos, setIntroduccionAlimentos] = useState({
    tipoLeche: '', edadOtrasLeches: 5, edadComplementaria: 0, alimentoAdministrado: '',
  });
  const [alimentacionActual, setAlimentacionActual] = useState({
    lactanciaMaterna: 'si', vecesLactanciaMaterna: 6,
    biberon: 'si',
    otrasLeches: 'no', vecesOtrasLeches: 5,
    alimComplementaria: 'no', vecesAlimComplementaria: 5,
  });
  const [consumoAyer, setConsumoAyer] = useState({
    liquidos: 'si', lecheAnimal: 'no', formula: 'no', alimentoSolido: 'no',
  });
  const [evaluacionAmamantamiento, setEvaluacionAmamantamiento] = useState({
    tocaMenton: 'no', abreBocaBien: 'si', labioVolteado: 'si', areolaMasArriba: 'si',
  });
  const [evaluacionSuccion, setEvaluacionSuccion] = useState({
    succionBuena: 'si', evaluacionAgarre: 'no_agarre',
  });
  // Histórico secundario/colapsado por defecto (punto 5 del encargo: "la
  // tabla debe ser secundaria visualmente respecto al formulario actual") —
  // mismo patrón pf-block-header/pf-block-body que AntecedentesStep.jsx,
  // pero arrancando cerrado en vez de abierto.
  const [historicoOpen, setHistoricoOpen] = useState(false);

  const sectionRefs = useRef([]);
  function setRef(index) {
    return (el) => { sectionRefs.current[index] = el; };
  }

  const tomaLactanciaActualmente = lactanciaMaterna.tomaActualmente === 'si';
  const tipoLactanciaResultado = useMemo(
    () => calcularTipoLactancia(lactanciaMaterna.tomaActualmente, consumoAyer),
    [lactanciaMaterna.tomaActualmente, consumoAyer],
  );

  useImperativeHandle(ref, () => ({
    scrollToSub(index) {
      const node = sectionRefs.current[index];
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

  function irAHistorico() {
    setHistoricoOpen(true);
    sectionRefs.current[3]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Alimentación</h1>
      <p className="pf-section-desc">Registra la alimentación del niño y la evaluación de la lactancia materna.</p>

      <div id="al-alimentacion" ref={setRef(0)} className="ac-mega">
        <section className="pf-card">

          <div className="pf-grid-2col">
            <SiNoField
              id="al-lact-exclusiva" label="Lactancia materna exclusiva los primeros 6 meses" options={SI_NO}
              value={lactanciaMaterna.exclusiva6m}
              onChange={(v) => setLactanciaMaterna((p) => ({ ...p, exclusiva6m: v }))}
            />
            <div className="form-field">
              <label htmlFor="al-edad-destete">Edad del niño al destete</label>
              <input
                id="al-edad-destete" type="number" min="0" value={lactanciaMaterna.edadDestete}
                onChange={(e) => setLactanciaMaterna((p) => ({ ...p, edadDestete: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="al-edad-otras-leches">Edad del niño al iniciar otras leches</label>
              <input
                id="al-edad-otras-leches" type="number" min="0" value={introduccionAlimentos.edadOtrasLeches}
                onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, edadOtrasLeches: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="al-tipo-leche">Qué tipo de leche</label>
              <input
                id="al-tipo-leche" type="text" value={introduccionAlimentos.tipoLeche}
                onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, tipoLeche: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="al-edad-complementaria">Edad al iniciar alimentación complementaria</label>
              <input
                id="al-edad-complementaria" type="number" min="0" value={introduccionAlimentos.edadComplementaria}
                onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, edadComplementaria: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="al-alimento-administrado">Alimento administrado</label>
              <input
                id="al-alimento-administrado" type="text" value={introduccionAlimentos.alimentoAdministrado}
                onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, alimentoAdministrado: e.target.value }))}
              />
            </div>
          </div>

          <div className="pf-divider"></div>

          <div className="pf-grid-2col ac-field-spaced">
            <SiNoField
              id="al-toma-actual" label="Toma actualmente lactancia materna?" options={SI_NO}
              value={lactanciaMaterna.tomaActualmente}
              onChange={(v) => setLactanciaMaterna((p) => ({ ...p, tomaActualmente: v }))}
            />

            <div className="form-field">
              <label htmlFor="al-tipo-lactancia">Tipo de lactancia<span className="pf-field-tag pf-field-tag-green">Resultado</span></label>
              <input
                id="al-tipo-lactancia" type="text" disabled readOnly
                className="al-tipo-lactancia-result"
                value={tipoLactanciaResultado}
                aria-live="polite"
              />
            </div>
          </div>

          {/* "Consumo durante el día anterior" solo tiene sentido si el niño
              toma lactancia materna actualmente (encargo explícito) — antes
              vivía en su propia card siempre visible, con cada campo
              deshabilitado + una nota explicando por qué; ahora el bloque
              completo depende de "Toma actualmente lactancia materna?" (acá
              arriba) y directamente no se monta cuando la respuesta es "No",
              en vez de mostrarse inerte. */}
          {tomaLactanciaActualmente && (
            <div id="al-consumo" ref={setRef(1)}>
              <div className="pf-divider"></div>

              <h2 className="pf-card-title">Consumo durante el día anterior</h2>
              <p className="pf-card-desc">Durante el día de ayer o anoche</p>

              <div className="al-eval-list">
                <SiNoField
                  id="al-consumo-liquidos" rowLayout
                  label="¿Recibió alguno de los siguientes líquidos: agua, agua aromática, jugo, té?"
                  options={SI_NO} value={consumoAyer.liquidos}
                  onChange={(v) => setConsumoAyer((p) => ({ ...p, liquidos: v }))}
                />
                <SiNoField
                  id="al-consumo-leche-animal" rowLayout
                  label="¿Recibió leche de vaca, cabra, líquida, en polvo, fresca o en bolsa?"
                  options={SI_NO} value={consumoAyer.lecheAnimal}
                  onChange={(v) => setConsumoAyer((p) => ({ ...p, lecheAnimal: v }))}
                />
                <SiNoField
                  id="al-consumo-formula" rowLayout label="¿Recibió leche de fórmula?"
                  options={SI_NO} value={consumoAyer.formula}
                  onChange={(v) => setConsumoAyer((p) => ({ ...p, formula: v }))}
                />
                <SiNoField
                  id="al-consumo-solido" rowLayout
                  label="¿Recibió algún alimento como sopa espesa, puré, papilla o seco?"
                  options={SI_NO} value={consumoAyer.alimentoSolido}
                  onChange={(v) => setConsumoAyer((p) => ({ ...p, alimentoSolido: v }))}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <div id="al-actual" ref={setRef(2)} className="ac-mega">
        <section className="pf-card">
          <h2 className="pf-card-title">Alimentación actual</h2>
          <p className="pf-card-desc">Qué recibe el niño actualmente y con qué frecuencia.</p>

          <div className="pf-grid-2col">
            <div className="al-feed-card">
              <h4 className="al-feed-title">Lactancia materna</h4>
              <div className="pf-grid-2col">
                <SiNoField
                  id="al-actual-lm" label="¿Recibe?" options={SI_NO}
                  value={alimentacionActual.lactanciaMaterna}
                  onChange={(v) => setAlimentacionActual((p) => ({ ...p, lactanciaMaterna: v }))}
                />
                <div className="form-field">
                  <label htmlFor="al-actual-lm-veces">Veces en el día</label>
                  <input
                    id="al-actual-lm-veces" type="number" min="0" value={alimentacionActual.vecesLactanciaMaterna}
                    onChange={(e) => setAlimentacionActual((p) => ({ ...p, vecesLactanciaMaterna: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="al-feed-card">
              <h4 className="al-feed-title">Biberón</h4>
              <SiNoField
                id="al-actual-biberon" label="¿Recibe?" options={SI_NO}
                value={alimentacionActual.biberon}
                onChange={(v) => setAlimentacionActual((p) => ({ ...p, biberon: v }))}
              />
            </div>

            <div className="al-feed-card">
              <h4 className="al-feed-title">Otras leches</h4>
              <div className="pf-grid-2col">
                <SiNoField
                  id="al-actual-otras" label="¿Recibe?" options={SI_NO}
                  value={alimentacionActual.otrasLeches}
                  onChange={(v) => setAlimentacionActual((p) => ({ ...p, otrasLeches: v }))}
                />
                <div className="form-field">
                  <label htmlFor="al-actual-otras-veces">Veces en el día</label>
                  <input
                    id="al-actual-otras-veces" type="number" min="0" value={alimentacionActual.vecesOtrasLeches}
                    onChange={(e) => setAlimentacionActual((p) => ({ ...p, vecesOtrasLeches: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="al-feed-card">
              <h4 className="al-feed-title">Alimentación complementaria</h4>
              <div className="pf-grid-2col">
                <SiNoField
                  id="al-actual-complementaria" label="¿Recibe?" options={SI_NO}
                  value={alimentacionActual.alimComplementaria}
                  onChange={(v) => setAlimentacionActual((p) => ({ ...p, alimComplementaria: v }))}
                />
                <div className="form-field">
                  <label htmlFor="al-actual-complementaria-veces">Veces en el día</label>
                  <input
                    id="al-actual-complementaria-veces" type="number" min="0" value={alimentacionActual.vecesAlimComplementaria}
                    onChange={(e) => setAlimentacionActual((p) => ({ ...p, vecesAlimComplementaria: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div id="al-historico" ref={setRef(3)} className="ac-mega">
        <section className="pf-card pf-card-split">
          <button
            type="button"
            className="pf-block-header"
            onClick={() => setHistoricoOpen((o) => !o)}
            aria-expanded={historicoOpen}
          >
            <span className="pf-block-heading">
              <span className="pf-block-icon"><LuHistory className="icon" aria-hidden="true" /></span>
              <span className="pf-block-header-title">
                <h2 className="pf-card-title">Registro histórico</h2>
                <p className="pf-card-desc">Consulta los registros de alimentación diligenciados en atenciones anteriores.</p>
              </span>
            </span>
            <LuChevronDown className={`icon pf-block-chevron${historicoOpen ? '' : ' collapsed'}`} aria-hidden="true" />
          </button>

          {historicoOpen && (
            <div className="pf-block-body">
              <div className="al-hist-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Edad (meses)</th>
                      <th>Lactancia materna</th>
                      <th>Veces (día)</th>
                      <th>Biberón</th>
                      <th>Otras leches</th>
                      <th>Veces (día)</th>
                      <th>Alimentación complementaria</th>
                      <th>Veces (día)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORICO_ALIMENTACION.map((r, i) => (
                      <tr key={i}>
                        <td>{r.fecha}</td>
                        <td>{r.edad}</td>
                        <td>{r.lactanciaMaterna ?? '—'}</td>
                        <td>{r.vecesLM ?? '—'}</td>
                        <td>{r.biberon ?? '—'}</td>
                        <td>{r.otrasLeches ?? '—'}</td>
                        <td>{r.vecesOtras ?? '—'}</td>
                        <td>{r.alimComplementaria ?? '—'}</td>
                        <td>{r.vecesComplementaria ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <div id="al-evaluacion" ref={setRef(4)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-group">
            <h2 className="pf-card-title">Evaluación de la lactancia materna</h2>

            <h3 className="pf-subheading">Evaluación del amamantamiento</h3>
            <div className="al-eval-list">
              <SiNoField
                id="al-eval-menton" rowLayout label="El niño toca el seno con el mentón"
                options={SI_NO} value={evaluacionAmamantamiento.tocaMenton}
                onChange={(v) => setEvaluacionAmamantamiento((p) => ({ ...p, tocaMenton: v }))}
              />
              <SiNoField
                id="al-eval-boca" rowLayout label="El niño abre bien la boca cuando amamanta"
                options={SI_NO} value={evaluacionAmamantamiento.abreBocaBien}
                onChange={(v) => setEvaluacionAmamantamiento((p) => ({ ...p, abreBocaBien: v }))}
              />
              <SiNoField
                id="al-eval-labio" rowLayout label="El labio inferior está volteado hacia afuera"
                options={SI_NO} value={evaluacionAmamantamiento.labioVolteado}
                onChange={(v) => setEvaluacionAmamantamiento((p) => ({ ...p, labioVolteado: v }))}
              />
              <SiNoField
                id="al-eval-areola" rowLayout
                label="La areola de la madre se ve más por encima que por debajo de la boca del niño"
                options={SI_NO} value={evaluacionAmamantamiento.areolaMasArriba}
                onChange={(v) => setEvaluacionAmamantamiento((p) => ({ ...p, areolaMasArriba: v }))}
              />
            </div>
          </div>

          <div className="pf-group">
            <h3 className="pf-subheading">Evaluación de la succión del niño</h3>
            <div className="al-eval-list">
              <SiNoField
                id="al-eval-succion" rowLayout
                label="Succión buena (de forma lenta y profunda y con pausas ocasionales)"
                options={SI_NO} value={evaluacionSuccion.succionBuena}
                onChange={(v) => setEvaluacionSuccion((p) => ({ ...p, succionBuena: v }))}
              />
              <div className="form-field pf-question-row">
                <label htmlFor="al-eval-agarre">Evaluación del agarre</label>
                <select
                  id="al-eval-agarre" value={evaluacionSuccion.evaluacionAgarre}
                  onChange={(e) => setEvaluacionSuccion((p) => ({ ...p, evaluacionAgarre: e.target.value }))}
                >
                  {EVALUACION_AGARRE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <button type="button" className="btn btn-secondary al-hist-link" onClick={irAHistorico}>
              <LuHistory className="icon" aria-hidden="true" /> Ver histórico
            </button>
          </div>
        </section>
      </div>
    </div>
  );
});

export default AlimentacionStep;
