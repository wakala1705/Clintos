'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './AntecedentesStep.css';
import TriStateField from '../TriStateField/TriStateField';
import { LuChevronDown, LuUser, LuUsers } from 'react-icons/lu';

const SI_NO_DESCONOCE = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'desconoce', label: 'Desconoce' },
];

const SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

const SI_NO_NA = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'No aplica' },
];

const LUGAR_PARTO = [
  { value: 'casa', label: 'Casa' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'centro_salud', label: 'Centro de salud' },
  { value: 'otro', label: 'Otro' },
];

const VIA_PARTO = [
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'cesarea', label: 'Cesárea' },
];

const PRESENTACION_PRODUCTO = [
  { value: 'cefalica', label: 'Cefálica' },
  { value: 'podalica', label: 'Podálica' },
  { value: 'transversa', label: 'Transversa' },
];

const RESULTADO_TSH = [
  { value: 'normal', label: 'Normal' },
  { value: 'anormal', label: 'Anormal' },
];

const GRUPO_SANGUINEO = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'ab', label: 'AB' },
  { value: 'o', label: 'O' },
];

const FACTOR_RH = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'negativo', label: 'Negativo' },
];

const VDRL_PARTO = [
  { value: 'reactivo', label: 'Reactivo' },
  { value: 'no_reactivo', label: 'No reactivo' },
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
  const [perinatalNeonato, setPerinatalNeonato] = useState({
    lugarParto: 'casa', lugarPartoDescriba: '',
    viaParto: 'vaginal', presentacionProducto: 'cefalica', productoUnico: 'si', productoUnicoNo: 0,
    pesoNacer: 0, tallaNacer: 0, perimetroCefalico: 0, perimetroToracico: 0,
    apgarMinuto: 0, apgar5Min: 0, apgarDesconoce: 'no',
    necesidadReanimacion: 'no', tshNeonatal: 'na', resultadoTSH: 'anormal',
    adaptacionNeonatal: '',
  });
  const [hemoclasificacion, setHemoclasificacion] = useState({
    grupoSanguineo: 'ab', factorRh: 'positivo', vdrlParto: 'desconoce', tratamiento: '',
  });
  const [antecedentesPatologicos, setAntecedentesPatologicos] = useState({
    respiratorias: 'si', diarrea: 'si', fiebre: 'no', sarampion: 'si', polio: 'si',
    convulsivos: 'no', parotiditis: 'si', probOido: 'no', tosferina: 'si', probGarganta: 'si',
    saludBucal: 'no', hipotiroidismoCongenito: 'na', tratamiento: '',
    describaTratamiento: '', antQuirurgicos: '',
    consultasUrgencias: 'no', sintomatologiaRecurrente: 'no', describaSintomatologia: '',
    hospitalarios: 'no', transfusionales: 'no',
    alergicos: 'no', farmacologicos: 'no', describaAlergicos: '',
    otros: 'no', describaOtros: '', edadMenarquia: 0,
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
                        <div className="pf-checklist pf-grid-3">
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

              <div className="form-field">
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
            <h3 className="pf-subheading">Antecedentes Perinatales Obstétricos</h3>
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
              <div className="form-field">
                <label htmlFor="ge-vacunas">Vacunas antitetánicas durante la gestación</label>
                <input
                  id="ge-vacunas" type="number" min="0" value={gestacion.vacunasAntitetanicas}
                  onChange={(e) => setGestacion((p) => ({ ...p, vacunasAntitetanicas: e.target.value }))}
                />
              </div>
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

          <div className="pf-group">
            <h3 className="pf-subheading">Antecedentes Perinatales del recién nacido</h3>
            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="pn-lugar">Lugar del parto</label>
                <select
                  id="pn-lugar" value={perinatalNeonato.lugarParto}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, lugarParto: e.target.value }))}
                >
                  {LUGAR_PARTO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pn-lugar-describa">Describa</label>
                <input
                  id="pn-lugar-describa" type="text" value={perinatalNeonato.lugarPartoDescriba}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, lugarPartoDescriba: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="pn-via">Vía del parto</label>
                <select
                  id="pn-via" value={perinatalNeonato.viaParto}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, viaParto: e.target.value }))}
                >
                  {VIA_PARTO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pn-presentacion">Presentación del producto</label>
                <select
                  id="pn-presentacion" value={perinatalNeonato.presentacionProducto}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, presentacionProducto: e.target.value }))}
                >
                  {PRESENTACION_PRODUCTO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pn-producto-unico">Producto único</label>
                <select
                  id="pn-producto-unico" value={perinatalNeonato.productoUnico}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, productoUnico: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pn-producto-no">No.</label>
                <input
                  id="pn-producto-no" type="number" min="0" value={perinatalNeonato.productoUnicoNo}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, productoUnicoNo: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="pn-peso">Peso al nacer</label>
                <input
                  id="pn-peso" type="number" min="0" value={perinatalNeonato.pesoNacer}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, pesoNacer: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pn-talla">Talla al nacer</label>
                <input
                  id="pn-talla" type="number" min="0" value={perinatalNeonato.tallaNacer}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, tallaNacer: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pn-pc">Perímetro cefálico</label>
                <input
                  id="pn-pc" type="number" min="0" value={perinatalNeonato.perimetroCefalico}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, perimetroCefalico: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pn-pt">Perímetro torácico</label>
                <input
                  id="pn-pt" type="number" min="0" value={perinatalNeonato.perimetroToracico}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, perimetroToracico: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pn-apgar1">APGAR al minuto</label>
                <input
                  id="pn-apgar1" type="number" min="0" value={perinatalNeonato.apgarMinuto}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, apgarMinuto: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pn-apgar5">APGAR a los 5 min</label>
                <input
                  id="pn-apgar5" type="number" min="0" value={perinatalNeonato.apgar5Min}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, apgar5Min: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pn-apgar-desconoce">Desconoce</label>
                <select
                  id="pn-apgar-desconoce" value={perinatalNeonato.apgarDesconoce}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, apgarDesconoce: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="pn-reanimacion">Necesidad de reanimación</label>
                <select
                  id="pn-reanimacion" value={perinatalNeonato.necesidadReanimacion}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, necesidadReanimacion: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pn-tsh">TSH Neonatal</label>
                <select
                  id="pn-tsh" value={perinatalNeonato.tshNeonatal}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, tshNeonatal: e.target.value }))}
                >
                  {SI_NO_NA.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pn-tsh-resultado">Resultado TSH</label>
                <select
                  id="pn-tsh-resultado" value={perinatalNeonato.resultadoTSH}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, resultadoTSH: e.target.value }))}
                >
                  {RESULTADO_TSH.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label htmlFor="pn-adaptacion">Adaptación neonatal</label>
                <input
                  id="pn-adaptacion" type="text" placeholder="Normal, Anormal, Describa" value={perinatalNeonato.adaptacionNeonatal}
                  onChange={(e) => setPerinatalNeonato((p) => ({ ...p, adaptacionNeonatal: e.target.value }))}
                />
              </div>
            </div>

            <h4 className="pf-subheading2">Hemoclasificación</h4>
            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="hc-grupo">Grupo Sanguíneo</label>
                <select
                  id="hc-grupo" value={hemoclasificacion.grupoSanguineo}
                  onChange={(e) => setHemoclasificacion((p) => ({ ...p, grupoSanguineo: e.target.value }))}
                >
                  {GRUPO_SANGUINEO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="hc-rh">Factor RH</label>
                <select
                  id="hc-rh" value={hemoclasificacion.factorRh}
                  onChange={(e) => setHemoclasificacion((p) => ({ ...p, factorRh: e.target.value }))}
                >
                  {FACTOR_RH.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="hc-vdrl">VDRL (Parto)</label>
                <select
                  id="hc-vdrl" value={hemoclasificacion.vdrlParto}
                  onChange={(e) => setHemoclasificacion((p) => ({ ...p, vdrlParto: e.target.value }))}
                >
                  {VDRL_PARTO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="hc-tratamiento">Tratamiento</label>
                <input
                  id="hc-tratamiento" type="text" value={hemoclasificacion.tratamiento}
                  onChange={(e) => setHemoclasificacion((p) => ({ ...p, tratamiento: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="pf-group">
            <h3 className="pf-subheading">Antecedentes Patológicos</h3>
            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="pt-respiratorias">Enfermedades respiratorias</label>
                <select
                  id="pt-respiratorias" value={antecedentesPatologicos.respiratorias}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, respiratorias: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-diarrea">Diarrea</label>
                <select
                  id="pt-diarrea" value={antecedentesPatologicos.diarrea}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, diarrea: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-fiebre">Fiebre</label>
                <select
                  id="pt-fiebre" value={antecedentesPatologicos.fiebre}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, fiebre: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-sarampion">Sarampión</label>
                <select
                  id="pt-sarampion" value={antecedentesPatologicos.sarampion}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, sarampion: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-polio">Polio</label>
                <select
                  id="pt-polio" value={antecedentesPatologicos.polio}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, polio: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="pt-convulsivos">Síndromes convulsivos</label>
                <select
                  id="pt-convulsivos" value={antecedentesPatologicos.convulsivos}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, convulsivos: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-parotiditis">Parotiditis</label>
                <select
                  id="pt-parotiditis" value={antecedentesPatologicos.parotiditis}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, parotiditis: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-oido">Probl. de oído</label>
                <select
                  id="pt-oido" value={antecedentesPatologicos.probOido}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, probOido: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-tosferina">Tosferina</label>
                <select
                  id="pt-tosferina" value={antecedentesPatologicos.tosferina}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, tosferina: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-garganta">Probl. Garganta</label>
                <select
                  id="pt-garganta" value={antecedentesPatologicos.probGarganta}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, probGarganta: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="pt-bucal">Problemas de salud bucal</label>
                <select
                  id="pt-bucal" value={antecedentesPatologicos.saludBucal}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, saludBucal: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-hipotiroidismo">Hipotiroidismo congénito</label>
                <select
                  id="pt-hipotiroidismo" value={antecedentesPatologicos.hipotiroidismoCongenito}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, hipotiroidismoCongenito: e.target.value }))}
                >
                  {SI_NO_NA.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="pf-grid-2col ac-field-spaced">
              <div className="form-field">
                <label htmlFor="pt-tratamiento">Tratamiento</label>
                <input
                  id="pt-tratamiento" type="text" value={antecedentesPatologicos.tratamiento}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, tratamiento: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pt-describa-tratamiento">Describa tratamiento</label>
                <input
                  id="pt-describa-tratamiento" type="text" value={antecedentesPatologicos.describaTratamiento}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, describaTratamiento: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-field ac-field-spaced">
              <label htmlFor="pt-ant-quirurgicos">Ant. Quirúrgicos</label>
              <textarea
                id="pt-ant-quirurgicos" value={antecedentesPatologicos.antQuirurgicos}
                onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, antQuirurgicos: e.target.value }))}
              />
            </div>

            <div className="pf-grid-4">
              <div className="form-field">
                <label htmlFor="pt-urgencias">Consultas a urgencias</label>
                <select
                  id="pt-urgencias" value={antecedentesPatologicos.consultasUrgencias}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, consultasUrgencias: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-sintomatologia">Sintomatología Recurrente</label>
                <select
                  id="pt-sintomatologia" value={antecedentesPatologicos.sintomatologiaRecurrente}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, sintomatologiaRecurrente: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-describa-sintomatologia">Describa</label>
                <input
                  id="pt-describa-sintomatologia" type="text" value={antecedentesPatologicos.describaSintomatologia}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, describaSintomatologia: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pt-hospitalarios">Hospitalarios</label>
                <select
                  id="pt-hospitalarios" value={antecedentesPatologicos.hospitalarios}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, hospitalarios: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-transfusionales">Transfusionales</label>
                <select
                  id="pt-transfusionales" value={antecedentesPatologicos.transfusionales}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, transfusionales: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="pt-alergicos">Alérgicos</label>
                <select
                  id="pt-alergicos" value={antecedentesPatologicos.alergicos}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, alergicos: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-farmacologicos">Farmacológicos</label>
                <select
                  id="pt-farmacologicos" value={antecedentesPatologicos.farmacologicos}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, farmacologicos: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-describa-alergicos">Describa</label>
                <input
                  id="pt-describa-alergicos" type="text" value={antecedentesPatologicos.describaAlergicos}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, describaAlergicos: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="pt-otros">Otros</label>
                <select
                  id="pt-otros" value={antecedentesPatologicos.otros}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, otros: e.target.value }))}
                >
                  {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pt-describa-otros">Describa</label>
                <input
                  id="pt-describa-otros" type="text" value={antecedentesPatologicos.describaOtros}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, describaOtros: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="pt-menarquia">Edad Menarquia</label>
                <input
                  id="pt-menarquia" type="number" min="0" value={antecedentesPatologicos.edadMenarquia} disabled
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, edadMenarquia: e.target.value }))}
                />
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
