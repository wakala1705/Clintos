'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './AntecedentesStep.css';
import TriStateField from '../TriStateField/TriStateField';
import SiNoField from '../SiNoField/SiNoField';
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

// "Antecedentes / condiciones de salud" (Bloque 1): checklist rápido de 4 en
// una fila, sin "Describa" al marcar "Sí" (encargo explícito, no aplica
// progressive disclosure acá). Alergias y Asma quedan aparte, en su propia
// fila de 2 (encargo explícito de reagrupar el layout) — a diferencia de las
// 4 de arriba, Asma SÍ lleva "Describa" al marcar "Sí" (encargo explícito);
// Alergias no, mismo criterio que el resto del checklist de 4.
const CONDICIONES_SALUD = [
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'tuberculosis', label: 'Tuberculosis' },
  { key: 'dermatitis', label: 'Dermatitis atópica' },
  { key: 'mentales', label: 'Enfermedades mentales' },
];
const CONDICION_ALERGIAS = { key: 'alergias', label: 'Alergias' };
const CONDICION_ASMA = { key: 'asma', label: 'Asma' };
// "Antecedentes familiares y desarrollo" (Bloque 2): a diferencia del
// checklist de arriba, SÍ mantiene el "Describa" al marcar "Sí" — mismo
// criterio que antes (antecedente genético/de desarrollo amerita
// elaboración, a diferencia de una condición de salud puntual).
const CONDICIONES_FAMILIARES_DESARROLLO = [
  { key: 'hereditarias', label: 'Enfermedades hereditarias' },
  { key: 'desarrolloInfantil', label: 'Problemas de desarrollo infantil' },
];
const CONDICIONES_FAMILIARES = [
  ...CONDICIONES_SALUD, CONDICION_ALERGIAS, CONDICION_ASMA, ...CONDICIONES_FAMILIARES_DESARROLLO,
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
                
              </span>
            </span>
            <LuChevronDown className={`icon pf-block-chevron${familiaresOpen ? '' : ' collapsed'}`} aria-hidden="true" />
          </button>

          {familiaresOpen && (
          <div className="pf-block-body">
          <div className="pf-group">
            <h2 className="pf-card-title">Antecedentes / condiciones de salud</h2>
            <div className="pf-grid-4">
              {CONDICIONES_SALUD.map((c) => {
                const estado = antecedentesFamiliares[c.key];
                return (
                  <TriStateField
                    key={c.key}
                    label={c.label}
                    value={estado.valor}
                    onChange={(v) => updateCondicion(setAntecedentesFamiliares, c.key, { valor: v })}
                  />
                );
              })}
            </div>
            <div className="pf-grid-2col ac-field-spaced">
              <TriStateField
                label={CONDICION_ALERGIAS.label}
                value={antecedentesFamiliares[CONDICION_ALERGIAS.key].valor}
                onChange={(v) => updateCondicion(setAntecedentesFamiliares, CONDICION_ALERGIAS.key, { valor: v })}
              />
              <TriStateField
                label={CONDICION_ASMA.label}
                value={antecedentesFamiliares[CONDICION_ASMA.key].valor}
                onChange={(v) => updateCondicion(setAntecedentesFamiliares, CONDICION_ASMA.key, { valor: v })}
                showDescription={antecedentesFamiliares[CONDICION_ASMA.key].valor === 'si'}
                descriptionValue={antecedentesFamiliares[CONDICION_ASMA.key].descripcion}
                onDescriptionChange={(v) => updateCondicion(setAntecedentesFamiliares, CONDICION_ASMA.key, { descripcion: v })}
                descriptionPlaceholder={`Describe brevemente el antecedente de ${CONDICION_ASMA.label.toLowerCase()}`}
              />
            </div>
          </div>

          <div className="pf-group">
            <h2 className="pf-card-title">Antecedentes familiares y desarrollo</h2>
            <div className="pf-grid-2col">
              {CONDICIONES_FAMILIARES_DESARROLLO.map((c) => {
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
                </span>
            </span>
            <LuChevronDown className={`icon pf-block-chevron${personalesOpen ? '' : ' collapsed'}`} aria-hidden="true" />
          </button>

          {personalesOpen && (
          <div className="pf-block-body">
          <div className="pf-group">
            <h3 className="pf-subheading">Antecedentes Perinatales Obstétricos</h3>
            <div className="pf-grid-4">
              <SiNoField
                id="ob-deseado" label="Embarazo deseado" options={SI_NO_DESCONOCE}
                value={embarazo.embarazoDeseado}
                onChange={(v) => setEmbarazo((p) => ({ ...p, embarazoDeseado: v }))}
              />
              <SiNoField
                id="ob-control" label="Control prenatal" options={SI_NO_DESCONOCE}
                value={embarazo.controlPrenatal}
                onChange={(v) => setEmbarazo((p) => ({ ...p, controlPrenatal: v }))}
              />
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
              <SiNoField
                id="ge-dtpa" label="Vacuna DTPa" options={SI_NO_DESCONOCE}
                value={gestacion.vacunaDTPa}
                onChange={(v) => setGestacion((p) => ({ ...p, vacunaDTPa: v }))}
              />
              <SiNoField
                id="ge-vdrl" label="VDRL prenatal" options={SI_NO_DESCONOCE}
                value={gestacion.vdrlPrenatal}
                onChange={(v) => setGestacion((p) => ({ ...p, vdrlPrenatal: v }))}
              />
              <SiNoField
                id="ge-elisa" label="ELISA para VIH" options={SI_NO_DESCONOCE}
                value={gestacion.elisaVIH}
                onChange={(v) => setGestacion((p) => ({ ...p, elisaVIH: v }))}
              />
              <SiNoField
                id="ge-western" label="Western Blood" options={SI_NO_DESCONOCE}
                value={gestacion.westernBlot}
                onChange={(v) => setGestacion((p) => ({ ...p, westernBlot: v }))}
              />
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
              <SiNoField
                id="pn-producto-unico" label="Producto único" options={SI_NO}
                value={perinatalNeonato.productoUnico}
                onChange={(v) => setPerinatalNeonato((p) => ({ ...p, productoUnico: v }))}
              />
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
              <SiNoField
                id="pn-apgar-desconoce" label="Desconoce" options={SI_NO}
                value={perinatalNeonato.apgarDesconoce}
                onChange={(v) => setPerinatalNeonato((p) => ({ ...p, apgarDesconoce: v }))}
              />

              <SiNoField
                id="pn-reanimacion" label="Necesidad de reanimación" options={SI_NO}
                value={perinatalNeonato.necesidadReanimacion}
                onChange={(v) => setPerinatalNeonato((p) => ({ ...p, necesidadReanimacion: v }))}
              />
              <SiNoField
                id="pn-tsh" label="TSH Neonatal" options={SI_NO_NA}
                value={perinatalNeonato.tshNeonatal}
                onChange={(v) => setPerinatalNeonato((p) => ({ ...p, tshNeonatal: v }))}
              />
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
              <SiNoField
                id="pt-respiratorias" label="Enfermedades respiratorias" options={SI_NO}
                value={antecedentesPatologicos.respiratorias}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, respiratorias: v }))}
              />
              <SiNoField
                id="pt-diarrea" label="Diarrea" options={SI_NO}
                value={antecedentesPatologicos.diarrea}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, diarrea: v }))}
              />
              <SiNoField
                id="pt-fiebre" label="Fiebre" options={SI_NO}
                value={antecedentesPatologicos.fiebre}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, fiebre: v }))}
              />
              <SiNoField
                id="pt-sarampion" label="Sarampión" options={SI_NO}
                value={antecedentesPatologicos.sarampion}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, sarampion: v }))}
              />
              <SiNoField
                id="pt-polio" label="Polio" options={SI_NO}
                value={antecedentesPatologicos.polio}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, polio: v }))}
              />

              <SiNoField
                id="pt-convulsivos" label="Síndromes convulsivos" options={SI_NO}
                value={antecedentesPatologicos.convulsivos}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, convulsivos: v }))}
              />
              <SiNoField
                id="pt-parotiditis" label="Parotiditis" options={SI_NO}
                value={antecedentesPatologicos.parotiditis}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, parotiditis: v }))}
              />
              <SiNoField
                id="pt-oido" label="Probl. de oído" options={SI_NO}
                value={antecedentesPatologicos.probOido}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, probOido: v }))}
              />
              <SiNoField
                id="pt-tosferina" label="Tosferina" options={SI_NO}
                value={antecedentesPatologicos.tosferina}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, tosferina: v }))}
              />
              <SiNoField
                id="pt-garganta" label="Probl. Garganta" options={SI_NO}
                value={antecedentesPatologicos.probGarganta}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, probGarganta: v }))}
              />

              <SiNoField
                id="pt-bucal" label="Problemas de salud bucal" options={SI_NO}
                value={antecedentesPatologicos.saludBucal}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, saludBucal: v }))}
              />
              <SiNoField
                id="pt-hipotiroidismo" label="Hipotiroidismo congénito" options={SI_NO_NA}
                value={antecedentesPatologicos.hipotiroidismoCongenito}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, hipotiroidismoCongenito: v }))}
              />
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
              <SiNoField
                id="pt-urgencias" label="Consultas a urgencias" options={SI_NO}
                value={antecedentesPatologicos.consultasUrgencias}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, consultasUrgencias: v }))}
              />
              <SiNoField
                id="pt-sintomatologia" label="Sintomatología Recurrente" options={SI_NO}
                value={antecedentesPatologicos.sintomatologiaRecurrente}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, sintomatologiaRecurrente: v }))}
              />
              <div className="form-field">
                <label htmlFor="pt-describa-sintomatologia">Describa</label>
                <input
                  id="pt-describa-sintomatologia" type="text" value={antecedentesPatologicos.describaSintomatologia}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, describaSintomatologia: e.target.value }))}
                />
              </div>
              <SiNoField
                id="pt-hospitalarios" label="Hospitalarios" options={SI_NO}
                value={antecedentesPatologicos.hospitalarios}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, hospitalarios: v }))}
              />
              <SiNoField
                id="pt-transfusionales" label="Transfusionales" options={SI_NO}
                value={antecedentesPatologicos.transfusionales}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, transfusionales: v }))}
              />

              <SiNoField
                id="pt-alergicos" label="Alérgicos" options={SI_NO}
                value={antecedentesPatologicos.alergicos}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, alergicos: v }))}
              />
              <SiNoField
                id="pt-farmacologicos" label="Farmacológicos" options={SI_NO}
                value={antecedentesPatologicos.farmacologicos}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, farmacologicos: v }))}
              />
              <div className="form-field">
                <label htmlFor="pt-describa-alergicos">Describa</label>
                <input
                  id="pt-describa-alergicos" type="text" value={antecedentesPatologicos.describaAlergicos}
                  onChange={(e) => setAntecedentesPatologicos((p) => ({ ...p, describaAlergicos: e.target.value }))}
                />
              </div>

              <SiNoField
                id="pt-otros" label="Otros" options={SI_NO}
                value={antecedentesPatologicos.otros}
                onChange={(v) => setAntecedentesPatologicos((p) => ({ ...p, otros: v }))}
              />
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
