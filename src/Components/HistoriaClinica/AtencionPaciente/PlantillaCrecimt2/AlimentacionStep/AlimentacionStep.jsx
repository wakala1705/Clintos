'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './AlimentacionStep.css';
import { LuChevronDown, LuHistory } from 'react-icons/lu';

const SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

// El valor visible en el legacy era "LACTANCIA PARCIAL" resaltado en verde;
// acá se mantiene como una opción más del mismo selector (ver punto 9 del
// encargo: "el mismo tratamiento visual que los demás campos, salvo que
// exista una regla clínica explícita que requiera mostrarlo como estado" —
// no la hay, así que no lleva tratamiento especial).
const TIPO_LACTANCIA = [
  { value: 'exclusiva', label: 'Lactancia exclusiva' },
  { value: 'parcial', label: 'Lactancia parcial' },
  { value: 'artificial', label: 'Lactancia artificial' },
  { value: 'no_aplica', label: 'No aplica' },
];

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
    exclusiva6m: 'si', edadDestete: 5, tomaActualmente: 'si', tipoLactancia: 'parcial',
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
          <h2 className="pf-card-title">Alimentación</h2>

          <h3 className="pf-subheading">Lactancia materna</h3>
          <div className="pf-grid-2col">
            <div className="form-field">
              <label htmlFor="al-lact-exclusiva">Lactancia materna exclusiva los primeros 6 meses</label>
              <select
                id="al-lact-exclusiva" value={lactanciaMaterna.exclusiva6m}
                onChange={(e) => setLactanciaMaterna((p) => ({ ...p, exclusiva6m: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="al-edad-destete">Edad del niño al destete</label>
              <div className="pf-field-suffix">
                <input
                  id="al-edad-destete" type="number" min="0" value={lactanciaMaterna.edadDestete}
                  onChange={(e) => setLactanciaMaterna((p) => ({ ...p, edadDestete: e.target.value }))}
                />
                <span>meses</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="al-toma-actual">Toma actualmente lactancia materna?</label>
              <select
                id="al-toma-actual" value={lactanciaMaterna.tomaActualmente}
                onChange={(e) => setLactanciaMaterna((p) => ({ ...p, tomaActualmente: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="al-tipo-lactancia">Tipo de lactancia</label>
              <select
                id="al-tipo-lactancia" value={lactanciaMaterna.tipoLactancia}
                onChange={(e) => setLactanciaMaterna((p) => ({ ...p, tipoLactancia: e.target.value }))}
              >
                {TIPO_LACTANCIA.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <h3 className="pf-subheading">Introducción de alimentos y otras leches</h3>
          <div className="pf-grid-2col">
            <div className="form-field">
              <label htmlFor="al-tipo-leche">Qué tipo de leche</label>
              <input
                id="al-tipo-leche" type="text" value={introduccionAlimentos.tipoLeche}
                onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, tipoLeche: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="al-edad-otras-leches">Edad del niño al iniciar otras leches</label>
              <div className="pf-field-suffix">
                <input
                  id="al-edad-otras-leches" type="number" min="0" value={introduccionAlimentos.edadOtrasLeches}
                  onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, edadOtrasLeches: e.target.value }))}
                />
                <span>meses</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="al-edad-complementaria">Edad al iniciar alimentación complementaria</label>
              <div className="pf-field-suffix">
                <input
                  id="al-edad-complementaria" type="number" min="0" value={introduccionAlimentos.edadComplementaria}
                  onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, edadComplementaria: e.target.value }))}
                />
                <span>meses</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="al-alimento-administrado">Alimento administrado</label>
              <input
                id="al-alimento-administrado" type="text" value={introduccionAlimentos.alimentoAdministrado}
                onChange={(e) => setIntroduccionAlimentos((p) => ({ ...p, alimentoAdministrado: e.target.value }))}
              />
            </div>
          </div>
        </section>
      </div>

      <div id="al-actual" ref={setRef(1)} className="ac-mega">
        <section className="pf-card">
          <h2 className="pf-card-title">Alimentación actual</h2>
          <p className="pf-card-desc">Qué recibe el niño actualmente y con qué frecuencia.</p>

          <div className="pf-grid-2col">
            <div className="al-feed-card">
              <h4 className="al-feed-title">Lactancia materna</h4>
              <div className="pf-grid-2col">
                <div className="form-field">
                  <label htmlFor="al-actual-lm">¿Recibe?</label>
                  <select
                    id="al-actual-lm" value={alimentacionActual.lactanciaMaterna}
                    onChange={(e) => setAlimentacionActual((p) => ({ ...p, lactanciaMaterna: e.target.value }))}
                  >
                    {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
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
              <div className="form-field">
                <label htmlFor="al-actual-biberon">¿Recibe?</label>
                <select
                  id="al-actual-biberon" value={alimentacionActual.biberon}
                  onChange={(e) => setAlimentacionActual((p) => ({ ...p, biberon: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="al-feed-card">
              <h4 className="al-feed-title">Otras leches</h4>
              <div className="pf-grid-2col">
                <div className="form-field">
                  <label htmlFor="al-actual-otras">¿Recibe?</label>
                  <select
                    id="al-actual-otras" value={alimentacionActual.otrasLeches}
                    onChange={(e) => setAlimentacionActual((p) => ({ ...p, otrasLeches: e.target.value }))}
                  >
                    {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
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
                <div className="form-field">
                  <label htmlFor="al-actual-complementaria">¿Recibe?</label>
                  <select
                    id="al-actual-complementaria" value={alimentacionActual.alimComplementaria}
                    onChange={(e) => setAlimentacionActual((p) => ({ ...p, alimComplementaria: e.target.value }))}
                  >
                    {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
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

      <div id="al-consumo" ref={setRef(2)} className="ac-mega">
        <section className="pf-card">
          <h2 className="pf-card-title">Consumo durante el día anterior</h2>
          <p className="pf-card-desc">Durante el día de ayer o anoche</p>

          <div className="al-eval-list">
            <div className="form-field al-eval-row">
              <label htmlFor="al-consumo-liquidos">¿Recibió alguno de los siguientes líquidos: agua, agua aromática, jugo, té?</label>
              <select
                id="al-consumo-liquidos" value={consumoAyer.liquidos}
                onChange={(e) => setConsumoAyer((p) => ({ ...p, liquidos: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field al-eval-row">
              <label htmlFor="al-consumo-leche-animal">¿Recibió leche de vaca, cabra, líquida, en polvo, fresca o en bolsa?</label>
              <select
                id="al-consumo-leche-animal" value={consumoAyer.lecheAnimal}
                onChange={(e) => setConsumoAyer((p) => ({ ...p, lecheAnimal: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field al-eval-row">
              <label htmlFor="al-consumo-formula">¿Recibió leche de fórmula?</label>
              <select
                id="al-consumo-formula" value={consumoAyer.formula}
                onChange={(e) => setConsumoAyer((p) => ({ ...p, formula: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field al-eval-row">
              <label htmlFor="al-consumo-solido">¿Recibió algún alimento como sopa espesa, puré, papilla o seco?</label>
              <select
                id="al-consumo-solido" value={consumoAyer.alimentoSolido}
                onChange={(e) => setConsumoAyer((p) => ({ ...p, alimentoSolido: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
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
              <div className="form-field al-eval-row">
                <label htmlFor="al-eval-menton">El niño toca el seno con el mentón</label>
                <select
                  id="al-eval-menton" value={evaluacionAmamantamiento.tocaMenton}
                  onChange={(e) => setEvaluacionAmamantamiento((p) => ({ ...p, tocaMenton: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field al-eval-row">
                <label htmlFor="al-eval-boca">El niño abre bien la boca cuando amamanta</label>
                <select
                  id="al-eval-boca" value={evaluacionAmamantamiento.abreBocaBien}
                  onChange={(e) => setEvaluacionAmamantamiento((p) => ({ ...p, abreBocaBien: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field al-eval-row">
                <label htmlFor="al-eval-labio">El labio inferior está volteado hacia afuera</label>
                <select
                  id="al-eval-labio" value={evaluacionAmamantamiento.labioVolteado}
                  onChange={(e) => setEvaluacionAmamantamiento((p) => ({ ...p, labioVolteado: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field al-eval-row">
                <label htmlFor="al-eval-areola">La areola de la madre se ve más por encima que por debajo de la boca del niño</label>
                <select
                  id="al-eval-areola" value={evaluacionAmamantamiento.areolaMasArriba}
                  onChange={(e) => setEvaluacionAmamantamiento((p) => ({ ...p, areolaMasArriba: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pf-group">
            <h3 className="pf-subheading">Evaluación de la succión del niño</h3>
            <div className="al-eval-list">
              <div className="form-field al-eval-row">
                <label htmlFor="al-eval-succion">Succión buena (de forma lenta y profunda y con pausas ocasionales)</label>
                <select
                  id="al-eval-succion" value={evaluacionSuccion.succionBuena}
                  onChange={(e) => setEvaluacionSuccion((p) => ({ ...p, succionBuena: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field al-eval-row">
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
