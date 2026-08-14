'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './ExamenFisicoStep.css';
import SystemExamCard from './SystemExamCard/SystemExamCard';
import { LuBaby, LuEye, LuHeartPulse, LuNotebookPen, LuScale, LuStethoscope } from 'react-icons/lu';

// "Columna izquierda"/"Columna derecha" tal como las pide el encargo — dos
// grupos de contenido reales (ver .ef-systems-grid en ExamenFisicoStep.css),
// no un único listado de 14 que se reordena solo. Cada sistema arranca en
// null ("Sin registrar", ver SystemExamCard.jsx): un campo vacío NUNCA se
// interpreta como "Normal".
const SISTEMAS_IZQUIERDA = [
  { key: 'cabezaCuello', label: 'Cabeza y cuello' },
  { key: 'oidos', label: 'Oídos' },
  { key: 'boca', label: 'Boca' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'ano', label: 'Ano' },
  { key: 'extremidadesInferiores', label: 'Extremidades inferiores' },
  { key: 'sistemaNervioso', label: 'Sistema nervioso' },
];
const SISTEMAS_DERECHA = [
  { key: 'ojos', label: 'Ojos' },
  { key: 'nariz', label: 'Nariz' },
  { key: 'cardiorespiratorio', label: 'Cardiorespiratorio' },
  { key: 'genitoUrinario', label: 'Genito-urinario' },
  { key: 'extremidadesSuperiores', label: 'Extremidades superiores' },
  { key: 'pielFaneras', label: 'Piel y faneras' },
  { key: 'signosMaltrato', label: 'Evidencia de signos de maltrato' },
];
const TODOS_SISTEMAS = [...SISTEMAS_IZQUIERDA, ...SISTEMAS_DERECHA];

const TANNER_OPCIONES = [
  { value: 'I', label: 'Tanner I' },
  { value: 'II', label: 'Tanner II' },
  { value: 'III', label: 'Tanner III' },
  { value: 'IV', label: 'Tanner IV' },
  { value: 'V', label: 'Tanner V' },
];

const RESULTADO_TAMIZAJE_OPCIONES = [
  { value: 'normal', label: 'Normal' },
  { value: 'anormal', label: 'Anormal — requiere remisión' },
  { value: 'no_colaborador', label: 'Paciente no colaborador' },
];

// Rangos amplios de recién nacido a infancia (ver "Momento vital" en
// ConsultaStep) — solo para atrapar valores clínicamente IMPOSIBLES (error
// de digitación), no para señalar valores atípicos-pero-reales; interpretar
// el dato sigue siendo criterio del clínico. `label`/`unidad` alimentan
// directamente el mensaje de error junto al campo (nunca "Error en
// formulario" genérico, ver encargo).
const RANGOS = {
  peso: { min: 0.5, max: 120, unidad: 'kg', label: 'Peso' },
  talla: { min: 20, max: 200, unidad: 'cm', label: 'Talla' },
  pc: { min: 20, max: 70, unidad: 'cm', label: 'Perímetro cefálico' },
  pt: { min: 20, max: 100, unidad: 'cm', label: 'Perímetro torácico' },
  perimetroBrazo: { min: 5, max: 50, unidad: 'cm', label: 'Perímetro del brazo' },
  fc: { min: 40, max: 220, unidad: 'lpm', label: 'Frecuencia cardíaca' },
  fr: { min: 10, max: 80, unidad: 'rpm', label: 'Frecuencia respiratoria' },
  sistolica: { min: 40, max: 220, unidad: 'mmHg', label: 'Presión sistólica' },
  diastolica: { min: 20, max: 150, unidad: 'mmHg', label: 'Presión diastólica' },
  temperatura: { min: 30, max: 43, unidad: '°C', label: 'Temperatura' },
};

// Únicos obligatorios del paso (ver "3. Bloque: Medidas antropométricas" del
// encargo) — el resto del paso (signos vitales, sistemas, agudeza visual,
// Tanner) queda sin bloquear "Guardar y continuar"; sus propias validaciones
// de rango solo avisan si el usuario sí llegó a diligenciarlas.
const CAMPOS_OBLIGATORIOS = ['peso', 'talla', 'pc', 'pt', 'perimetroBrazo'];

export function calcularIMC(pesoKg, tallaCm) {
  const peso = Number(pesoKg);
  const talla = Number(tallaCm);
  if (!peso || !talla) return null;
  const tallaM = talla / 100;
  return peso / (tallaM * tallaM);
}

function emptySistemas() {
  return Object.fromEntries(TODOS_SISTEMAS.map((s) => [s.key, { estado: null, descripcion: '' }]));
}

const SCROLL_OFFSET = 32; // px desde el techo del panel de contenido que cuenta como "línea activa"

// Paso "09 Examen físico" del wizard CRECIMT2 (ver SECCIONES en
// PlantillaCrecimt2.jsx) — igual que AntecedentesStep, se mantiene SIEMPRE
// montado (el padre lo oculta con `hidden`) y expone un scrollspy propio
// sobre sus 6 subsecciones (mismo patrón `scrollContainerRef`/
// `activeSubIndex`/`onActiveSubIndexChange`/`scrollToSub`). `patientSexo`
// es el único dato del paciente que este wizard necesita en algún paso: el
// desarrollo puberal (Tanner) muestra un set de campos distinto para mujer/
// varón y nunca ambos a la vez (ver PlantillaCrecimt2.jsx, comentario sobre
// por qué ese prop rompe la regla de "no recibe datos del paciente").
// `antropometria`/`onAntropometriaChange`/`imc` viven controlados desde
// PlantillaCrecimt2.jsx (a diferencia del resto del estado de este paso,
// 100% local) — encargo explícito: "10 Crecimiento y APGAR familiar" (ver
// GrowthChartModal.jsx) necesita leer Peso/Talla/PC/IMC ya diligenciados
// acá, y un ref no re-renderiza al padre cuando cambian, así que el único
// mecanismo reactivo real es levantar este pedazo de estado.
const ExamenFisicoStep = forwardRef(function ExamenFisicoStep(
  {
    hidden, activeSubIndex, onActiveSubIndexChange, scrollContainerRef, patientSexo,
    antropometria, onAntropometriaChange, imc,
  },
  ref,
) {
  const [signosVitales, setSignosVitales] = useState({ fc: '', fr: '', sistolica: '', diastolica: '', temperatura: '' });
  const [condicionesGenerales, setCondicionesGenerales] = useState('');
  const [sistemas, setSistemas] = useState(emptySistemas);
  const [agudezaVisual, setAgudezaVisual] = useState({
    sintomas: null, especificar: '', ojoDerecho: '', ojoIzquierdo: '', resultadoTamizaje: '',
  });
  const [tanner, setTanner] = useState({ mamario: '', pubicoMujer: '', genitalesMasculinos: '', pubicoVaron: '' });
  const [errors, setErrors] = useState({});

  const sectionRefs = useRef([]);
  function setRef(index) {
    return (el) => { sectionRefs.current[index] = el; };
  }

  function clearError(key) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function validarRango(key, rawValue) {
    const rango = RANGOS[key];
    if (!rango || rawValue === '' || rawValue == null) { clearError(key); return; }
    const n = Number(rawValue);
    if (Number.isNaN(n) || n < rango.min || n > rango.max) {
      setErrors((prev) => ({ ...prev, [key]: `Fuera de rango clínico permitido (${rango.min}–${rango.max} ${rango.unidad})` }));
    } else {
      clearError(key);
    }
  }

  function updateAntropometria(key, value) {
    onAntropometriaChange((p) => ({ ...p, [key]: value }));
    clearError(key);
  }
  function updateSignosVitales(key, value) {
    setSignosVitales((p) => ({ ...p, [key]: value }));
    clearError(key);
  }
  function updateSistema(key, patch) {
    setSistemas((p) => ({ ...p, [key]: { ...p[key], ...patch } }));
  }

  useImperativeHandle(ref, () => ({
    scrollToSub(index) {
      const node = sectionRefs.current[index];
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    // Solo bloquea por CAMPOS_OBLIGATORIOS + rangos clínicos imposibles de lo
    // ya diligenciado — nunca un "Error en formulario" genérico (ver
    // handleGuardarContinuar en PlantillaCrecimt2.jsx, que reenvía este
    // mismo mensaje contado en window.ncToast).
    validar() {
      const next = {};

      CAMPOS_OBLIGATORIOS.forEach((key) => {
        if (!String(antropometria[key]).trim()) next[key] = 'Campo obligatorio para continuar';
      });

      Object.keys(RANGOS).forEach((key) => {
        if (next[key]) return; // ya marcado como obligatorio faltante, no lo pises con un mensaje de rango
        const rawValue = key in antropometria ? antropometria[key] : signosVitales[key];
        if (rawValue === '' || rawValue == null) return;
        const n = Number(rawValue);
        const rango = RANGOS[key];
        if (Number.isNaN(n) || n < rango.min || n > rango.max) {
          next[key] = `Fuera de rango clínico permitido (${rango.min}–${rango.max} ${rango.unidad})`;
        }
      });

      if (!next.sistolica && !next.diastolica && signosVitales.sistolica && signosVitales.diastolica
        && Number(signosVitales.sistolica) <= Number(signosVitales.diastolica)) {
        next.sistolica = 'La presión sistólica debe ser mayor que la diastólica';
      }

      setErrors(next);
      const total = Object.keys(next).length;
      if (total > 0) {
        window.ncToast?.(`${total} campo${total === 1 ? '' : 's'} pendiente${total === 1 ? '' : 's'} en Examen físico.`);
      }
      return total === 0;
    },
  }));

  useEffect(() => {
    if (hidden) return; // paso oculto: no recalcular sobre un contenedor con display:none
    const el = scrollContainerRef?.current;
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

  // 'Femenino' es el único valor que dispara el set de campos de mujer (ver
  // mockAgendaData.js) — cualquier otro valor (incluido "sin registrar") cae
  // en el set de varón antes que no mostrar nada, para no dejar la card
  // vacía cuando el sexo del paciente no vino informado.
  const esMujer = patientSexo === 'Femenino';

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Examen físico</h1>
      <p className="pf-section-desc">Registra las medidas, signos vitales y hallazgos del examen físico por sistemas.</p>

      <div id="ef-antropometria" ref={setRef(0)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-card-header-icon">
            <span className="pf-block-icon"><LuScale className="icon" aria-hidden="true" /></span>
            <div>
              <h2 className="pf-card-title">Medidas antropométricas</h2>
              <p className="pf-card-desc">El IMC se calcula automáticamente a partir del peso y la talla.</p>
            </div>
          </div>

          <div className="pf-grid-3">
            <div className="form-field">
              <label htmlFor="ef-peso">Peso<span className="req">*</span></label>
              <div className="pf-field-suffix">
                <input
                  id="ef-peso" type="number" step="0.1" min="0" required
                  value={antropometria.peso}
                  aria-invalid={errors.peso ? 'true' : undefined}
                  aria-describedby={errors.peso ? 'ef-peso-error' : undefined}
                  onChange={(e) => updateAntropometria('peso', e.target.value)}
                  onBlur={(e) => validarRango('peso', e.target.value)}
                />
                <span>kg</span>
              </div>
              {errors.peso && <span id="ef-peso-error" className="pf-field-error">{errors.peso}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-talla">Talla<span className="req">*</span></label>
              <div className="pf-field-suffix">
                <input
                  id="ef-talla" type="number" step="0.1" min="0" required
                  value={antropometria.talla}
                  aria-invalid={errors.talla ? 'true' : undefined}
                  aria-describedby={errors.talla ? 'ef-talla-error' : undefined}
                  onChange={(e) => updateAntropometria('talla', e.target.value)}
                  onBlur={(e) => validarRango('talla', e.target.value)}
                />
                <span>cm</span>
              </div>
              {errors.talla && <span id="ef-talla-error" className="pf-field-error">{errors.talla}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-imc">IMC<span className="pf-field-tag">Calculado</span></label>
              <div className="pf-field-suffix">
                <input id="ef-imc" type="text" disabled className="ef-calculated-input" value={imc ? imc.toFixed(1) : ''} placeholder="—" />
                <span>kg/m²</span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="ef-pc">PC (perímetro cefálico)<span className="req">*</span></label>
              <div className="pf-field-suffix">
                <input
                  id="ef-pc" type="number" step="0.1" min="0" required
                  value={antropometria.pc}
                  aria-invalid={errors.pc ? 'true' : undefined}
                  aria-describedby={errors.pc ? 'ef-pc-error' : undefined}
                  onChange={(e) => updateAntropometria('pc', e.target.value)}
                  onBlur={(e) => validarRango('pc', e.target.value)}
                />
                <span>cm</span>
              </div>
              {errors.pc && <span id="ef-pc-error" className="pf-field-error">{errors.pc}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-pt">PT (perímetro torácico)<span className="req">*</span></label>
              <div className="pf-field-suffix">
                <input
                  id="ef-pt" type="number" step="0.1" min="0" required
                  value={antropometria.pt}
                  aria-invalid={errors.pt ? 'true' : undefined}
                  aria-describedby={errors.pt ? 'ef-pt-error' : undefined}
                  onChange={(e) => updateAntropometria('pt', e.target.value)}
                  onBlur={(e) => validarRango('pt', e.target.value)}
                />
                <span>cm</span>
              </div>
              {errors.pt && <span id="ef-pt-error" className="pf-field-error">{errors.pt}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-perimetro-brazo">Perímetro del brazo<span className="req">*</span></label>
              <div className="pf-field-suffix">
                <input
                  id="ef-perimetro-brazo" type="number" step="0.1" min="0" required
                  value={antropometria.perimetroBrazo}
                  aria-invalid={errors.perimetroBrazo ? 'true' : undefined}
                  aria-describedby={errors.perimetroBrazo ? 'ef-perimetro-brazo-error' : undefined}
                  onChange={(e) => updateAntropometria('perimetroBrazo', e.target.value)}
                  onBlur={(e) => validarRango('perimetroBrazo', e.target.value)}
                />
                <span>cm</span>
              </div>
              {errors.perimetroBrazo && <span id="ef-perimetro-brazo-error" className="pf-field-error">{errors.perimetroBrazo}</span>}
            </div>
          </div>
        </section>
      </div>

      <div id="ef-signos-vitales" ref={setRef(1)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-card-header-icon">
            <span className="pf-block-icon"><LuHeartPulse className="icon" aria-hidden="true" /></span>
            <div><h2 className="pf-card-title">Signos vitales</h2></div>
          </div>

          <div className="pf-grid-4">
            <div className="form-field">
              <label htmlFor="ef-fc">Frecuencia cardíaca</label>
              <div className="pf-field-suffix">
                <input
                  id="ef-fc" type="number" min="0" value={signosVitales.fc}
                  aria-invalid={errors.fc ? 'true' : undefined}
                  aria-describedby={errors.fc ? 'ef-fc-error' : undefined}
                  onChange={(e) => updateSignosVitales('fc', e.target.value)}
                  onBlur={(e) => validarRango('fc', e.target.value)}
                />
                <span>lpm</span>
              </div>
              {errors.fc && <span id="ef-fc-error" className="pf-field-error">{errors.fc}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-fr">Frecuencia respiratoria</label>
              <div className="pf-field-suffix">
                <input
                  id="ef-fr" type="number" min="0" value={signosVitales.fr}
                  aria-invalid={errors.fr ? 'true' : undefined}
                  aria-describedby={errors.fr ? 'ef-fr-error' : undefined}
                  onChange={(e) => updateSignosVitales('fr', e.target.value)}
                  onBlur={(e) => validarRango('fr', e.target.value)}
                />
                <span>rpm</span>
              </div>
              {errors.fr && <span id="ef-fr-error" className="pf-field-error">{errors.fr}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-pa-sistolica">Presión arterial</label>
              <div className="ef-bp-field">
                <input
                  id="ef-pa-sistolica" type="number" min="0" value={signosVitales.sistolica}
                  aria-label="Presión sistólica" placeholder="Sistólica"
                  aria-invalid={errors.sistolica ? 'true' : undefined}
                  onChange={(e) => updateSignosVitales('sistolica', e.target.value)}
                  onBlur={(e) => validarRango('sistolica', e.target.value)}
                />
                <span className="ef-bp-sep" aria-hidden="true">/</span>
                <input
                  id="ef-pa-diastolica" type="number" min="0" value={signosVitales.diastolica}
                  aria-label="Presión diastólica" placeholder="Diastólica"
                  aria-invalid={errors.diastolica ? 'true' : undefined}
                  onChange={(e) => updateSignosVitales('diastolica', e.target.value)}
                  onBlur={(e) => validarRango('diastolica', e.target.value)}
                />
                <span className="ef-bp-unit">mmHg</span>
              </div>
              {errors.sistolica && <span className="pf-field-error">{errors.sistolica}</span>}
              {!errors.sistolica && errors.diastolica && <span className="pf-field-error">{errors.diastolica}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ef-temperatura">Temperatura</label>
              <div className="pf-field-suffix">
                <input
                  id="ef-temperatura" type="number" step="0.1" min="0" value={signosVitales.temperatura}
                  aria-invalid={errors.temperatura ? 'true' : undefined}
                  aria-describedby={errors.temperatura ? 'ef-temperatura-error' : undefined}
                  onChange={(e) => updateSignosVitales('temperatura', e.target.value)}
                  onBlur={(e) => validarRango('temperatura', e.target.value)}
                />
                <span>°C</span>
              </div>
              {errors.temperatura && <span id="ef-temperatura-error" className="pf-field-error">{errors.temperatura}</span>}
            </div>
          </div>
        </section>
      </div>

      <div id="ef-condiciones-generales" ref={setRef(2)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-card-header-icon">
            <span className="pf-block-icon"><LuNotebookPen className="icon" aria-hidden="true" /></span>
            <div><h2 className="pf-card-title">Condiciones generales</h2></div>
          </div>
          <div className="form-field">
            <label htmlFor="ef-condiciones">Observaciones generales del examen físico</label>
            <textarea
              id="ef-condiciones" rows={4} placeholder="Describa las condiciones generales del paciente..."
              value={condicionesGenerales}
              onChange={(e) => setCondicionesGenerales(e.target.value)}
            />
          </div>
        </section>
      </div>

      <div id="ef-sistemas" ref={setRef(3)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-card-header-icon">
            <span className="pf-block-icon"><LuStethoscope className="icon" aria-hidden="true" /></span>
            <div>
              <h2 className="pf-card-title">Examen físico por sistemas</h2>
              <p className="pf-card-desc">Marca cada sistema como Normal o Anormal; los hallazgos solo aparecen cuando corresponde.</p>
            </div>
          </div>

          <div className="ef-systems-grid">
            <div className="ef-systems-col">
              {SISTEMAS_IZQUIERDA.map((s) => (
                <SystemExamCard
                  key={s.key}
                  label={s.label}
                  value={sistemas[s.key].estado}
                  onChange={(v) => updateSistema(s.key, { estado: v })}
                  descripcion={sistemas[s.key].descripcion}
                  onDescripcionChange={(v) => updateSistema(s.key, { descripcion: v })}
                />
              ))}
            </div>
            <div className="ef-systems-col">
              {SISTEMAS_DERECHA.map((s) => (
                <SystemExamCard
                  key={s.key}
                  label={s.label}
                  value={sistemas[s.key].estado}
                  onChange={(v) => updateSistema(s.key, { estado: v })}
                  descripcion={sistemas[s.key].descripcion}
                  onDescripcionChange={(v) => updateSistema(s.key, { descripcion: v })}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div id="ef-agudeza-visual" ref={setRef(4)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-card-header-icon">
            <span className="pf-block-icon"><LuEye className="icon" aria-hidden="true" /></span>
            <div><h2 className="pf-card-title">Tamizaje de agudeza visual</h2></div>
          </div>

          <div className="pf-condition-row">
            <span className="pf-condition-label">¿Presenta síntomas de pérdida de agudeza visual?</span>
            <div className="pf-toggle-group" role="group" aria-label="¿Presenta síntomas de pérdida de agudeza visual?">
              <button
                type="button" className={`pf-toggle-btn${agudezaVisual.sintomas === 'si' ? ' active' : ''}`}
                aria-pressed={agudezaVisual.sintomas === 'si'}
                onClick={() => setAgudezaVisual((p) => ({ ...p, sintomas: 'si' }))}
              >
                Sí
              </button>
              <button
                type="button" className={`pf-toggle-btn${agudezaVisual.sintomas === 'no' ? ' active' : ''}`}
                aria-pressed={agudezaVisual.sintomas === 'no'}
                onClick={() => setAgudezaVisual((p) => ({ ...p, sintomas: 'no', especificar: '' }))}
              >
                No
              </button>
            </div>
          </div>

          {agudezaVisual.sintomas === 'si' && (
            <div className="form-field ac-field-spaced">
              <label htmlFor="ef-av-especificar">Especificar síntomas</label>
              <textarea
                id="ef-av-especificar" rows={2} value={agudezaVisual.especificar}
                onChange={(e) => setAgudezaVisual((p) => ({ ...p, especificar: e.target.value }))}
                placeholder="Describe los síntomas reportados"
              />
            </div>
          )}

          <h3 className="pf-subheading ac-field-spaced">Resultado de agudeza visual</h3>
          <div className="pf-grid-2col">
            <div className="form-field">
              <label htmlFor="ef-av-od">Ojo derecho</label>
              <input
                id="ef-av-od" type="text" placeholder="Ej. 20/20" value={agudezaVisual.ojoDerecho}
                onChange={(e) => setAgudezaVisual((p) => ({ ...p, ojoDerecho: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="ef-av-oi">Ojo izquierdo</label>
              <input
                id="ef-av-oi" type="text" placeholder="Ej. 20/20" value={agudezaVisual.ojoIzquierdo}
                onChange={(e) => setAgudezaVisual((p) => ({ ...p, ojoIzquierdo: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-field ac-field-spaced">
            <label htmlFor="ef-av-resultado">Resultado del tamizaje</label>
            <select
              id="ef-av-resultado" value={agudezaVisual.resultadoTamizaje}
              onChange={(e) => setAgudezaVisual((p) => ({ ...p, resultadoTamizaje: e.target.value }))}
            >
              <option value="">Seleccionar</option>
              {RESULTADO_TAMIZAJE_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </section>
      </div>

      <div id="ef-tanner" ref={setRef(5)} className="ac-mega">
        <section className="pf-card">
          <div className="pf-card-header-icon">
            <span className="pf-block-icon"><LuBaby className="icon" aria-hidden="true" /></span>
            <div><h2 className="pf-card-title">Desarrollo puberal</h2></div>
          </div>

          {esMujer ? (
            <div className="pf-group">
              <h3 className="pf-subheading">Desarrollo puberal en la mujer</h3>
              <div className="pf-grid-2col">
                <div className="form-field">
                  <label htmlFor="ef-tanner-mamario">Desarrollo mamario según Tanner</label>
                  <select
                    id="ef-tanner-mamario" value={tanner.mamario}
                    onChange={(e) => setTanner((p) => ({ ...p, mamario: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    {TANNER_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="ef-tanner-pubico-mujer">Desarrollo púbico según Tanner</label>
                  <select
                    id="ef-tanner-pubico-mujer" value={tanner.pubicoMujer}
                    onChange={(e) => setTanner((p) => ({ ...p, pubicoMujer: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    {TANNER_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="pf-group">
              <h3 className="pf-subheading">Desarrollo puberal en el varón</h3>
              <div className="pf-grid-2col">
                <div className="form-field">
                  <label htmlFor="ef-tanner-genitales">Genitales masculinos según Tanner</label>
                  <select
                    id="ef-tanner-genitales" value={tanner.genitalesMasculinos}
                    onChange={(e) => setTanner((p) => ({ ...p, genitalesMasculinos: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    {TANNER_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="ef-tanner-pubico-varon">Desarrollo del vello púbico según Tanner</label>
                  <select
                    id="ef-tanner-pubico-varon" value={tanner.pubicoVaron}
                    onChange={(e) => setTanner((p) => ({ ...p, pubicoVaron: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    {TANNER_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default ExamenFisicoStep;
