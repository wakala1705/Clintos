'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './AntecedentesStep.css';
import TriStateField from '../TriStateField/TriStateField';
import { LuChevronDown, LuInfo, LuUser, LuUsers } from 'react-icons/lu';

const SI_NO_DESCONOCE = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'desconoce', label: 'Desconoce' },
];

const CONDICIONES_FAMILIARES = [
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'tuberculosis', label: 'Tuberculosis' },
  { key: 'alergias', label: 'Alergias' },
  { key: 'mentales', label: 'Mentales' },
  { key: 'hereditarias', label: 'Enfermedades hereditarias' },
  { key: 'desarrolloInfantil', label: 'Problemas de desarrollo infantil' },
  { key: 'asma', label: 'Asma' },
  { key: 'dermatitis', label: 'Dermatitis atópica' },
];

const SUCESOS_VITALES = [
  { key: 'duelo', label: 'Duelo o muerte de persona significativa' },
  { key: 'divorcio', label: 'Divorcio de los padres' },
  { key: 'problemasRelacion', label: 'Problemas en relaciones de los progenitores' },
];

const SALUD_MENTAL_PADRES = [
  { key: 'alteracionesEmocionales', label: 'Alteraciones de los estados emocionales' },
  { key: 'alteracionesComportamiento', label: 'Alteraciones del comportamiento' },
  { key: 'conductaSuicida', label: 'Conducta suicida' },
  { key: 'consumoAlcohol', label: 'Consumo de alcohol' },
  { key: 'consumoSPA', label: 'Consumo de SPA' },
  { key: 'depresion', label: 'Depresión' },
  { key: 'esquizofrenia', label: 'Esquizofrenia' },
  { key: 'tab', label: 'TAB' },
];

function emptyCondiciones(lista) {
  return Object.fromEntries(lista.map((c) => [c.key, { valor: null, descripcion: '' }]));
}

function emptyChecklist(lista) {
  return Object.fromEntries(lista.map((c) => [c.key, false]));
}

const SCROLL_OFFSET = 32; // px desde el techo del panel de contenido que cuenta como "línea activa"

// Paso 2 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — antes vivía
// junto con "01 Consulta" en un único componente (AntecedentesContent.jsx)
// con un scrollspy GLOBAL sobre las 3 subsecciones del formulario; ahora que
// Consulta es un paso separado sin scroll propio, el scrollspy de acá abajo
// solo cubre las 2 subsecciones propias de este paso (familiares/personales)
// y arranca su propio índice en 0 cada vez que se entra al paso. Igual que
// ConsultaStep, se mantiene SIEMPRE montado (el padre lo oculta con
// `hidden`) para no perder lo ya diligenciado al ir y volver entre pasos.
const AntecedentesStep = forwardRef(function AntecedentesStep(
  { hidden, activeSubIndex, onActiveSubIndexChange, scrollContainerRef },
  ref,
) {
  const [antecedentesFamiliares, setAntecedentesFamiliares] = useState(() => emptyCondiciones(CONDICIONES_FAMILIARES));
  const [sucesosVitales, setSucesosVitales] = useState(() => emptyChecklist(SUCESOS_VITALES));
  const [saludMentalPadres, setSaludMentalPadres] = useState(() => emptyChecklist(SALUD_MENTAL_PADRES));
  const [otrosAntecedentes, setOtrosAntecedentes] = useState({ existen: null, cuales: '' });
  const [composicionFamiliar, setComposicionFamiliar] = useState({
    hermanosVivos: 5, hermanosMuertos: 2, causas: '', hermanosDesnutridos: 2,
  });
  const [embarazo, setEmbarazo] = useState({
    embarazoDeseado: 'no', controlPrenatal: 'desconoce', noControles: 0, edadMadre: 5, duracionEmbarazo: 5,
  });
  const [gestacion, setGestacion] = useState({
    vacunasAntitetanicas: 2, vacunaDTPa: 'si', vdrlPrenatal: 'desconoce', elisaVIH: 'desconoce', westernBlot: 'desconoce',
  });
  // Cada bloque principal (familiares/personales) es colapsable de forma
  // independiente (ver .pf-block-header/.pf-block-body en PlantillaCrecimt2.css)
  // — arrancan expandidos, mismo estado visual que antes de este cambio.
  const [familiaresOpen, setFamiliaresOpen] = useState(true);
  const [personalesOpen, setPersonalesOpen] = useState(true);

  const sectionRefs = useRef([]);
  function setRef(index) {
    return (el) => { sectionRefs.current[index] = el; };
  }
  function updateCondicion(setter, key, patch) {
    setter((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }
  function toggleCheck(setter, key) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
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

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Antecedentes</h1>
      <p className="pf-section-desc">Registra los antecedentes familiares, personales y perinatales relevantes para la atención integral.</p>

      <div id="bloque-familiares" ref={setRef(0)} className="ac-mega">
        <section className="pf-card pf-card-split">
          <button
            type="button"
            className="pf-block-header"
            onClick={() => setFamiliaresOpen((o) => !o)}
            aria-expanded={familiaresOpen}
          >
            <span className="pf-block-heading">
              <span className="pf-block-icon"><LuUsers className="icon" aria-hidden="true" /></span>
              <span className="pf-block-header-title">
                <h2 className="pf-card-title">Antecedentes familiares</h2>
                <p className="pf-card-desc">Antecedentes familiares, sucesos vitales, salud mental de los padres y composición del núcleo familiar.</p>
              </span>
            </span>
            <LuChevronDown className={`icon pf-block-chevron${familiaresOpen ? '' : ' collapsed'}`} aria-hidden="true" />
          </button>

          {familiaresOpen && (
          <div className="pf-block-body">
          <div className="pf-group">
            
            <div className="pf-grid-4">
              {CONDICIONES_FAMILIARES.map((c) => {
                const estado = antecedentesFamiliares[c.key];
                return (
                  <TriStateField
                    key={c.key}
                    label={c.label}
                    value={estado.valor}
                    onChange={(v) => updateCondicion(setAntecedentesFamiliares, c.key, { valor: v })}
                    showDescription={estado.valor === 'si'}
                    descriptionValue={estado.descripcion}
                    onDescriptionChange={(v) => updateCondicion(setAntecedentesFamiliares, c.key, { descripcion: v })}
                    descriptionPlaceholder={`Describe brevemente el antecedente de ${c.label.toLowerCase()}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="pf-group">
            <h2 className="pf-card-title">Sucesos vitales familiares</h2>
            <p className="pf-card-desc">Selecciona los eventos presentes en el entorno familiar.</p>
            <div className="pf-checklist">
              {SUCESOS_VITALES.map((item) => (
                <label className="pf-check-row" key={item.key}>
                  <input
                    type="checkbox" checked={sucesosVitales[item.key]}
                    onChange={() => toggleCheck(setSucesosVitales, item.key)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

            <div className="pf-group">
            <h2 className="pf-card-title">Otros antecedentes</h2>
            <TriStateField
              label="¿Existen otros antecedentes relevantes?"
              options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={otrosAntecedentes.existen}
              onChange={(v) => setOtrosAntecedentes((p) => ({ ...p, existen: v }))}
              showDescription={otrosAntecedentes.existen === 'si'}
              descriptionValue={otrosAntecedentes.cuales}
              onDescriptionChange={(v) => setOtrosAntecedentes((p) => ({ ...p, cuales: v }))}
              descriptionLabel="¿Cuáles?"
              descriptionPlaceholder="Describe los antecedentes relevantes"
            />
          </div>

          <div className="pf-group">
            <h2 className="pf-card-title">Salud mental de los padres</h2>
            <div className="pf-checklist pf-grid-4">
              {SALUD_MENTAL_PADRES.map((item) => (
                <label className="pf-check-row" key={item.key}>
                  <input
                    type="checkbox" checked={saludMentalPadres[item.key]}
                    onChange={() => toggleCheck(setSaludMentalPadres, item.key)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

            <div className="pf-group">
            <h2 className="pf-card-title">Composición familiar</h2>
            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="cf-vivos">Hermanos vivos</label>
                <input
                  id="cf-vivos" type="number" min="0" value={composicionFamiliar.hermanosVivos}
                  onChange={(e) => setComposicionFamiliar((p) => ({ ...p, hermanosVivos: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="cf-muertos">Hermanos muertos</label>
                <input
                  id="cf-muertos" type="number" min="0" value={composicionFamiliar.hermanosMuertos}
                  onChange={(e) => setComposicionFamiliar((p) => ({ ...p, hermanosMuertos: e.target.value }))}
                />
              </div>

              <div className="form-field full">
                <label htmlFor="cf-causas">Causas</label>
                <input
                  id="cf-causas" type="text" placeholder="Describe las causas" value={composicionFamiliar.causas}
                  onChange={(e) => setComposicionFamiliar((p) => ({ ...p, causas: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="cf-desnutridos">Hermanos desnutridos menores de 5 años</label>
                <input
                  id="cf-desnutridos" type="number" min="0" value={composicionFamiliar.hermanosDesnutridos}
                  onChange={(e) => setComposicionFamiliar((p) => ({ ...p, hermanosDesnutridos: e.target.value }))}
                />
              </div>

              
            </div>
          </div>
          </div>
          )}
        </section>
      </div>

      <div id="bloque-personales" ref={setRef(1)} className="ac-mega">
        <section className="pf-card pf-card-split">
          <button
            type="button"
            className="pf-block-header"
            onClick={() => setPersonalesOpen((o) => !o)}
            aria-expanded={personalesOpen}
          >
            <span className="pf-block-heading">
              <span className="pf-block-icon"><LuUser className="icon" aria-hidden="true" /></span>
              <span className="pf-block-header-title">
                <h2 className="pf-card-title">Antecedentes personales</h2>
                <p className="pf-card-desc">Historia individual del paciente, diferenciada en antecedentes perinatales y obstétricos.</p>
              </span>
            </span>
            <LuChevronDown className={`icon pf-block-chevron${personalesOpen ? '' : ' collapsed'}`} aria-hidden="true" />
          </button>

          {personalesOpen && (
          <div className="pf-block-body">
          <div className="pf-group">
            <h3 className="pf-subheading">Antecedentes perinatales</h3>
            <div className="pf-note">
              <LuInfo className="icon" aria-hidden="true" />
              <span>Esta subsección no incluye campos adicionales en el formulario original. Los hallazgos del recién nacido se registran en las secciones de <strong>Crecimiento</strong> y <strong>Desarrollo</strong>.</span>
            </div>
          </div>

          <div className="pf-group">
            <h3 className="pf-subheading">Antecedentes Perinatales Obstétricos</h3>

            <h4 className="pf-subheading2">Embarazo</h4>
            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="ob-deseado">Embarazo deseado</label>
                <select
                  id="ob-deseado" value={embarazo.embarazoDeseado}
                  onChange={(e) => setEmbarazo((p) => ({ ...p, embarazoDeseado: e.target.value }))}
                >
                  {SI_NO_DESCONOCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="ob-control">Control prenatal</label>
                <select
                  id="ob-control" value={embarazo.controlPrenatal}
                  onChange={(e) => setEmbarazo((p) => ({ ...p, controlPrenatal: e.target.value }))}
                >
                  {SI_NO_DESCONOCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="ob-ncontroles">No. de controles</label>
                <input
                  id="ob-ncontroles" type="number" min="0" value={embarazo.noControles}
                  onChange={(e) => setEmbarazo((p) => ({ ...p, noControles: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="ob-edad-madre">Edad de la madre al momento del parto</label>
                <div className="pf-field-suffix">
                  <input
                    id="ob-edad-madre" type="number" min="0" value={embarazo.edadMadre}
                    onChange={(e) => setEmbarazo((p) => ({ ...p, edadMadre: e.target.value }))}
                  />

                </div>
              </div>
              <div className="form-field">
                <label htmlFor="ob-duracion">Duración del embarazo</label>
                <div className="pf-field-suffix">
                  <input
                    id="ob-duracion" type="number" min="0" value={embarazo.duracionEmbarazo}
                    onChange={(e) => setEmbarazo((p) => ({ ...p, duracionEmbarazo: e.target.value }))}
                  />

                </div>
              </div>
            </div>

            <h4 className="pf-subheading2">Antecedentes durante la gestación</h4>
            <div className="form-field ac-field-spaced">
              <label htmlFor="ge-vacunas">Vacunas antitetánicas durante la gestación</label>
              <input
                id="ge-vacunas" type="number" min="0" value={gestacion.vacunasAntitetanicas}
                onChange={(e) => setGestacion((p) => ({ ...p, vacunasAntitetanicas: e.target.value }))}
              />
            </div>
            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="ge-dtpa">Vacuna DTPa</label>
                <select
                  id="ge-dtpa" value={gestacion.vacunaDTPa}
                  onChange={(e) => setGestacion((p) => ({ ...p, vacunaDTPa: e.target.value }))}
                >
                  {SI_NO_DESCONOCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="ge-vdrl">VDRL prenatal</label>
                <select
                  id="ge-vdrl" value={gestacion.vdrlPrenatal}
                  onChange={(e) => setGestacion((p) => ({ ...p, vdrlPrenatal: e.target.value }))}
                >
                  {SI_NO_DESCONOCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="ge-elisa">ELISA para VIH</label>
                <select
                  id="ge-elisa" value={gestacion.elisaVIH}
                  onChange={(e) => setGestacion((p) => ({ ...p, elisaVIH: e.target.value }))}
                >
                  {SI_NO_DESCONOCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="ge-western">Western Blood</label>
                <select
                  id="ge-western" value={gestacion.westernBlot}
                  onChange={(e) => setGestacion((p) => ({ ...p, westernBlot: e.target.value }))}
                >
                  {SI_NO_DESCONOCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default AntecedentesStep;
