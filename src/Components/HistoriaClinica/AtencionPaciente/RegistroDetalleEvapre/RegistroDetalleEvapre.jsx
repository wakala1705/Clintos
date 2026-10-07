'use client';

import './RegistroDetalleEvapre.css';
import { LuTriangleAlert } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import {
  Campo, ListaEtiquetada, Seccion, SignosResumen, TextoConPasos, lineas,
} from '../RegistroDetalle/RegistroDetalle';
import {
  LEE_REVISADO_FACTORES, LEE_THRCI_FACTORES, KARNOFSKY_OPCIONES, SECCIONES_EVAPRE, etiquetaOpcionEvapre,
} from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';
import { labelDeOpcion, TIPO_DX_OPTIONS } from '@/hooks/HistoriaClinica/ingresoHospitalizacionCampos';

// Vista de lectura de un registro EVAPRE ("Ver detalle" de HistoriaClinicaTab):
// el mismo `contenido` que abre "Editar" en la plantilla, como texto plano
// jerarquizado en una sola columna (mismo criterio y mismos bloques que
// RegistroDetalle de INGHOSP). Arriba, lo que el anestesiólogo busca primero:
// diagnóstico, signos vitales, alergias y los índices de riesgo. Los campos
// vacíos se omiten.

const LABELS = Object.fromEntries(SECCIONES_EVAPRE.flatMap((s) => s.campos.map((c) => [c.key, c.label])));

const ANTECEDENTES = ['patologicos', 'quirurgicos', 'obstetricos', 'anestesicos', 'toxicos', 'farmacologicos', 'transfusional'];
const LABORATORIOS_CORTOS = SECCIONES_EVAPRE.find((s) => s.id === 'laboratorios')
  .campos.filter((c) => c.type === 'text').map((c) => c.key);
const LABORATORIOS_TEXTO = ['parcialOrina', 'otrosQuimica', 'ekg', 'rxTorax', 'otrosImagenes'];
const VIA_AEREA = [
  'protesisDental', 'tipoProtesis', 'lentes', 'aperturaOral', 'dtm', 'distanciaExternomentoniana',
  'circunferenciaCuello', 'testMordida', 'distanciaInterincisivos', 'mallampaty',
];
const SISTEMAS = ['sensorio', 'cabezaOrganos', 'cuelloCabeza', 'cardiotoracico', 'abdomen', 'gu', 'extremidades', 'neurologico'];

// Un campo de varias líneas como párrafos, respetando los saltos.
function Lineas({ texto }) {
  return lineas(texto).map((l, i) => <p key={i} className="rd-text">{l}</p>);
}

function FilasDl({ filas }) {
  if (filas.length === 0) return null;
  return (
    <dl className="rd-dl">
      {filas.map((f) => (
        <div key={f.label} className="rd-dl-row">
          <dt>{f.label}</dt>
          <dd><Lineas texto={f.valor} /></dd>
        </div>
      ))}
    </dl>
  );
}

function nombresMarcados(opciones, marcados) {
  const nombres = opciones.filter((o) => marcados?.includes(o.value)).map((o) => o.label);
  return nombres.length > 0 ? nombres.join('; ') : 'Ninguno';
}

export default function RegistroDetalleEvapre({ registro }) {
  const c = registro.contenido;
  const v = c.valores || {};
  const dx = c.diagnosticos || {};
  const tipoDx = labelDeOpcion(TIPO_DX_OPTIONS, dx.tipoDx);

  const fila = (key, valor = v[key]) => (valor ? { label: LABELS[key], valor } : null);
  const filaOpcion = (key) => fila(key, etiquetaOpcionEvapre(key, v[key]));
  const sinNulos = (arr) => arr.filter(Boolean);

  const karnofsky = KARNOFSKY_OPCIONES.find((o) => o.value === v.karnofsky)?.label;
  const [recomendaciones, analisis] = (v.opinionRecomendaciones || '').split(/ANALISIS:/i);

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
          <div className="rd-summary-value"><SignosResumen signos={c.signosVitales || {}} /></div>
        </div>
        <div className="rd-summary-row">
          <span className="rd-summary-label">Alergias</span>
          <div className="rd-summary-value">
            {v.alergicos ? (
              <p className="rd-alergia">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                <span>{lineas(v.alergicos).join(' · ')}</span>
              </p>
            ) : <p className="rd-text">No registradas</p>}
          </div>
        </div>
        <div className="rd-summary-row">
          <span className="rd-summary-label">Riesgo anestésico</span>
          <div className="rd-summary-value rde-badges">
            {v.estadoFisicoAsa && <Badge tone="warn">ASA {v.estadoFisicoAsa}</Badge>}
            {v.mallampaty && <Badge tone="neutral">Mallampati {v.mallampaty}</Badge>}
            {v.leeRevisadoClase && <Badge tone="neutral">Lee revisado clase {v.leeRevisadoClase}</Badge>}
            {v.nyha && <Badge tone="neutral">NYHA {v.nyha}</Badge>}
            {v.tipoAnestesia && <Badge tone="info">{etiquetaOpcionEvapre('tipoAnestesia', v.tipoAnestesia)}</Badge>}
          </div>
        </div>
      </div>

      <Seccion titulo="Información general">
        {v.procedimiento && <Campo label="Procedimiento"><Lineas texto={v.procedimiento} /></Campo>}
      </Seccion>

      <Seccion titulo="Antecedentes">
        <FilasDl filas={sinNulos(ANTECEDENTES.map((k) => fila(k)))} />
      </Seccion>

      <Seccion titulo="Laboratorios">
        <dl className="rde-labs">
          {LABORATORIOS_CORTOS.filter((k) => v[k]).map((k) => (
            <div key={k} className="rde-lab"><dt>{LABELS[k]}</dt><dd>{v[k]}</dd></div>
          ))}
        </dl>
        {v.gasesArteriales && <Campo label={LABELS.gasesArteriales}><ListaEtiquetada texto={v.gasesArteriales} /></Campo>}
        {LABORATORIOS_TEXTO.filter((k) => v[k]).map((k) => (
          <Campo key={k} label={LABELS[k]}><Lineas texto={v[k]} /></Campo>
        ))}
      </Seccion>

      <Seccion titulo="Examen físico">
        <Campo label="Vía aérea">
          <FilasDl filas={sinNulos(VIA_AEREA.map(filaOpcion))} />
        </Campo>
        <Campo label="Por sistemas">
          <FilasDl filas={sinNulos(SISTEMAS.map((k) => fila(k)))} />
        </Campo>
      </Seccion>

      <Seccion titulo="Valoración del riesgo">
        <FilasDl
          filas={sinNulos([
            karnofsky && { label: LABELS.karnofsky, valor: karnofsky },
            filaOpcion('estadoFisicoAsa'),
            filaOpcion('nyha'),
            { label: LABELS.leeThrciFactores, valor: nombresMarcados(LEE_THRCI_FACTORES, v.leeThrciFactores) },
            filaOpcion('leeThrciPuntos'),
            { label: LABELS.leeRevisadoFactores, valor: nombresMarcados(LEE_REVISADO_FACTORES, v.leeRevisadoFactores) },
            filaOpcion('leeRevisadoClase'),
            filaOpcion('capacidadFuncional'),
          ])}
        />
      </Seccion>

      <Seccion titulo="Plan anestésico">
        <FilasDl
          filas={sinNulos([filaOpcion('tipoAnestesia'), filaOpcion('uciPostquirurgica'), fila('hemoderivados')])}
        />
        {recomendaciones?.trim() && <Campo label="Recomendaciones"><TextoConPasos texto={recomendaciones} /></Campo>}
        {analisis?.trim() && <Campo label="Análisis"><Lineas texto={analisis} /></Campo>}
      </Seccion>
    </article>
  );
}
