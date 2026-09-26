'use client';

import './RegistroDetalle.css';
import { LuInfo, LuTriangleAlert } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import {
  CAMPOS_ANTECEDENTES, CANTIDAD_PESO_OPTIONS, PERDIDA_PESO_OPTIONS, SI_NO_OPTIONS, SISTEMAS_EXAMEN, TIPO_DX_OPTIONS, labelDeOpcion,
} from '@/hooks/HistoriaClinica/ingresoHospitalizacionCampos';
import { calcularDerivados, descripcionRango, evaluarRango } from '@/hooks/HistoriaClinica/signosVitales';

// Vista de lectura de un registro INGHOSP ("Ver detalle" de
// HistoriaClinicaTab, encargo explícito): el mismo `contenido` que abre
// "Editar" en la plantilla, pero como texto plano jerarquizado en una sola
// columna, pensado para que el médico lo recorra rápido -- no como
// formulario. Criterios:
// - Arriba, un resumen con lo que se busca primero: diagnóstico, signos
//   vitales (alterados en ámbar/rojo, mismos rangos que SignosVitalesPanel)
//   y alergias.
// - Antecedentes: solo los positivos con su detalle; los negativos se
//   agrupan en una línea "Niega: ...".
// - Textos con líneas "Etiqueta: valor" (revisión por sistemas,
//   paraclínicos) se muestran como lista con la etiqueta resaltada; el plan
//   numerado ("1. ...") como lista ordenada.
// - Campos vacíos se omiten.

const formatNum = (v) => String(v).replace('.', ',');

// "Etiqueta: resto" → etiqueta resaltada, solo si los ":" están al
// principio de la línea (no en medio de una frase larga).
function LineaConEtiqueta({ texto }) {
  const i = texto.indexOf(':');
  if (i > 0 && i <= 60) {
    return (
      <>
        <span className="rd-line-label">{texto.slice(0, i + 1)}</span>
        {texto.slice(i + 1)}
      </>
    );
  }
  return texto;
}

function lineas(texto) {
  return (texto || '').split('\n').map((l) => l.trim()).filter(Boolean);
}

// Párrafos separados por línea en blanco.
function Parrafos({ texto }) {
  return (texto || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
    <p key={i} className="rd-text">{p}</p>
  ));
}

function ListaEtiquetada({ texto }) {
  return (
    <ul className="rd-list">
      {lineas(texto).map((l, i) => <li key={i}><LineaConEtiqueta texto={l} /></li>)}
    </ul>
  );
}

// Plan: agrupa las líneas "N. ..." consecutivas en un <ol> y deja el resto
// como párrafos, en el orden en que vienen.
function TextoConPasos({ texto }) {
  const bloques = [];
  lineas(texto).forEach((l) => {
    const m = l.match(/^(\d+)\.\s+(.*)$/);
    const ultimo = bloques[bloques.length - 1];
    if (m) {
      if (ultimo?.tipo === 'ol') ultimo.items.push(m[2]);
      else bloques.push({ tipo: 'ol', start: Number(m[1]), items: [m[2]] });
    } else {
      bloques.push({ tipo: 'p', texto: l });
    }
  });
  return bloques.map((b, i) => (b.tipo === 'ol' ? (
    <ol key={i} className="rd-steps" start={b.start}>
      {b.items.map((it, j) => <li key={j}>{it}</li>)}
    </ol>
  ) : <p key={i} className="rd-text">{b.texto}</p>));
}

function Campo({ label, children }) {
  return (
    <div className="rd-field">
      <h5 className="rd-field-label">{label}</h5>
      <div className="rd-field-value">{children}</div>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <section className="rd-section">
      <h4 className="rd-section-title">{titulo}</h4>
      {children}
    </section>
  );
}

function SignosResumen({ signos }) {
  const { imc } = calcularDerivados(signos);
  const items = [
    { campos: ['temperatura'], label: 'T', valor: signos.temperatura, unit: '°C' },
    { campos: ['frecuenciaCardiaca'], label: 'FC', valor: signos.frecuenciaCardiaca, unit: 'lpm' },
    { campos: ['frecuenciaRespiratoria'], label: 'FR', valor: signos.frecuenciaRespiratoria, unit: 'rpm' },
    {
      campos: ['sistolica', 'diastolica'], label: 'PA',
      valor: signos.sistolica && signos.diastolica ? `${signos.sistolica}/${signos.diastolica}` : '', unit: 'mmHg',
    },
    { campos: [], label: 'Peso', valor: signos.peso, unit: 'kg' },
    { campos: [], label: 'Talla', valor: signos.estatura, unit: 'cm' },
    { campos: [], label: 'IMC', valor: imc == null ? '' : imc.toFixed(1), unit: 'kg/m²' },
  ].filter((it) => it.valor);

  return (
    <ul className="rd-vitals">
      {items.map((it) => {
        const estados = it.campos.map((c) => evaluarRango(c, signos[c]));
        const estado = estados.includes('danger') ? 'danger' : estados.includes('warn') ? 'warn' : null;
        const desc = it.campos.map((c) => descripcionRango(c, signos[c])).filter(Boolean).join(', ');
        return (
          <li key={it.label} className={`rd-vital${estado ? ` is-${estado}` : ''}`}>
            <span className="rd-vital-label">{it.label}</span>
            <span className="rd-vital-value">{formatNum(it.valor)}</span>
            <span className="rd-vital-unit">{it.unit}</span>
            {desc && <span className="sr-only">({desc})</span>}
          </li>
        );
      })}
    </ul>
  );
}

// Signos del panel lateral; si faltan, los del examen físico (talla y TA en
// un solo campo "120/80").
function unificarSignos(contenido) {
  const ef = contenido.examenFisico?.signosVitales || {};
  const [sis, dia] = (ef.tensionArterial || '').split('/');
  const base = {
    estatura: ef.talla, peso: ef.peso, temperatura: ef.temperatura,
    frecuenciaCardiaca: ef.frecuenciaCardiaca, frecuenciaRespiratoria: ef.frecuenciaRespiratoria,
    sistolica: sis?.trim(), diastolica: dia?.trim(),
  };
  const panel = Object.fromEntries(Object.entries(contenido.signosVitales || {}).filter(([, v]) => v));
  return { ...base, ...panel };
}

export default function RegistroDetalle({ registro }) {
  const c = registro.contenido;

  if (!c) {
    return (
      <div className="rd-empty" role="status">
        <LuInfo className="icon" aria-hidden="true" />
        <div>
          <p className="rd-empty-title">Este registro no tiene detalle estructurado</p>
          <p className="rd-empty-sub">
            {registro.archivoUrl
              ? 'Puedes consultar el documento original con "Imprimir".'
              : 'El contenido de esta nota todavía no está disponible para consulta en línea.'}
          </p>
        </div>
      </div>
    );
  }

  const ig = c.informacionGeneral || {};
  const ant = c.antecedentes || {};
  const ef = c.examenFisico || {};
  const pt = c.planTratamiento || {};
  const dx = c.diagnosticos || {};
  const signos = unificarSignos(c);

  const booleanos = ant.booleanos || {};
  const positivos = CAMPOS_ANTECEDENTES.filter((a) => booleanos[a.key]?.valor === 'si');
  const negativos = CAMPOS_ANTECEDENTES.filter((a) => booleanos[a.key]?.valor === 'no');
  const alergia = booleanos.alergicos;
  const gineco = [
    ant.ginecoObstetricos,
    ant.menarquia && `Menarquia: ${ant.menarquia}`,
    ant.fum && `FUM: ${ant.fum}`,
    ant.ciclos && `Ciclos: ${ant.ciclos}`,
  ].filter(Boolean);
  const sistemas = SISTEMAS_EXAMEN.filter((s) => s.key !== 'ayudasDiagnosticas' && ef.sistemas?.[s.key]);
  const tamizaje = [
    { label: '¿Ha perdido peso involuntariamente?', valor: labelDeOpcion(PERDIDA_PESO_OPTIONS, pt.perdidaPeso) },
    { label: 'Si ha perdido peso, ¿cuánto?', valor: labelDeOpcion(CANTIDAD_PESO_OPTIONS, pt.cantidadPeso) },
    { label: '¿Ha comido menos a raíz de pérdida de apetito?', valor: labelDeOpcion(SI_NO_OPTIONS, pt.comidoMenos) },
  ].filter((t) => t.valor);
  const tipoDx = labelDeOpcion(TIPO_DX_OPTIONS, dx.tipoDx);

  return (
    <article className="rd" aria-label={`Detalle de ${registro.tituloNota}`}>
      <div className="rd-summary">
        {(dx.cie10 || dx.cie11) && (
          <div className="rd-summary-row">
            <span className="rd-summary-label">Diagnóstico</span>
            <div className="rd-summary-value">
              {dx.cie10 && (
                <p className="rd-dx">
                  <span>{dx.cie10}</span>
                  {tipoDx && <Badge tone="info">{tipoDx}</Badge>}
                </p>
              )}
              {dx.cie11 && <p className="rd-dx-sec">CIE-11: {dx.cie11}</p>}
            </div>
          </div>
        )}
        <div className="rd-summary-row">
          <span className="rd-summary-label">Signos vitales</span>
          <div className="rd-summary-value"><SignosResumen signos={signos} /></div>
        </div>
        <div className="rd-summary-row">
          <span className="rd-summary-label">Alergias</span>
          <div className="rd-summary-value">
            {alergia?.valor === 'si' ? (
              <p className="rd-alergia">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                <span>{alergia.observaciones || 'Positivas (sin detalle)'}</span>
              </p>
            ) : (
              <p className="rd-text">{alergia?.valor === 'no' ? 'Niega alergias' : 'No registradas'}</p>
            )}
          </div>
        </div>
      </div>

      <Seccion titulo="Información general">
        {ig.motivoConsulta && <Campo label="Motivo de consulta"><p className="rd-text rd-quote">{ig.motivoConsulta}</p></Campo>}
        {ig.enfermedadActual && <Campo label="Enfermedad actual"><Parrafos texto={ig.enfermedadActual} /></Campo>}
        {ig.revisionPorSistema && <Campo label="Revisión por sistemas"><ListaEtiquetada texto={ig.revisionPorSistema} /></Campo>}
        {ig.reingreso && <Campo label="Reingreso"><p className="rd-text">{labelDeOpcion(SI_NO_OPTIONS, ig.reingreso)}</p></Campo>}
      </Seccion>

      <Seccion titulo="Antecedentes">
        {positivos.length > 0 && (
          <dl className="rd-dl">
            {positivos.map((a) => (
              <div key={a.key} className="rd-dl-row">
                <dt>{a.label}</dt>
                <dd>{booleanos[a.key].observaciones || 'Sí (sin detalle)'}</dd>
              </div>
            ))}
          </dl>
        )}
        {negativos.length > 0 && (
          <p className="rd-text rd-niega">
            <span className="rd-line-label">Niega:</span> {negativos.map((a) => a.label.toLowerCase()).join(', ')}.
          </p>
        )}
        {gineco.length > 0 && <Campo label="Gineco-obstétricos"><p className="rd-text">{gineco.join(' · ')}</p></Campo>}
        {ant.urologicos && <Campo label="Urológicos"><p className="rd-text">{ant.urologicos}</p></Campo>}
        {ant.socialEconomico && <Campo label="Social / económico"><p className="rd-text">{ant.socialEconomico}</p></Campo>}
      </Seccion>

      <Seccion titulo="Examen físico">
        {ef.inspeccionGeneral && <Campo label="Inspección general"><p className="rd-text">{ef.inspeccionGeneral}</p></Campo>}
        {sistemas.length > 0 && (
          <Campo label="Por sistemas">
            <dl className="rd-dl">
              {sistemas.map((s) => (
                <div key={s.key} className="rd-dl-row">
                  <dt>{s.label}</dt>
                  <dd>{ef.sistemas[s.key]}</dd>
                </div>
              ))}
            </dl>
          </Campo>
        )}
        {ef.sistemas?.ayudasDiagnosticas && (
          <Campo label="Ayudas diagnósticas / Paraclínicos"><ListaEtiquetada texto={ef.sistemas.ayudasDiagnosticas} /></Campo>
        )}
      </Seccion>

      <Seccion titulo="Plan de tratamiento">
        {pt.analisisClinico && <Campo label="Análisis clínico"><Parrafos texto={pt.analisisClinico} /></Campo>}
        {pt.opinionPlanTratamiento && <Campo label="Plan de manejo"><TextoConPasos texto={pt.opinionPlanTratamiento} /></Campo>}
        {tamizaje.length > 0 && (
          <Campo label="Tamizaje nutricional">
            <dl className="rd-dl">
              {tamizaje.map((t) => (
                <div key={t.label} className="rd-dl-row">
                  <dt>{t.label}</dt>
                  <dd>{t.valor}</dd>
                </div>
              ))}
            </dl>
          </Campo>
        )}
      </Seccion>
    </article>
  );
}
