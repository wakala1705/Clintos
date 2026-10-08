'use client';

import { LuChevronDown, LuPencil } from 'react-icons/lu';
import './ColumnaFormulario.css';
import Button from '@/Components/Button/Button';
import TiempoTranscurrido from '../TiempoTranscurrido/TiempoTranscurrido';

const EQUIPO = [
  { key: 'cirujano', label: 'Cirujano principal' },
  { key: 'ayudante', label: 'Cirujano ayudante' },
  { key: 'anestesiologo', label: 'Anestesiólogo' },
  { key: 'instrumentista', label: 'Instrumentador(a)' },
  { key: 'circulante', label: 'Circulante' },
];

const TIEMPOS = [
  { key: 'inicioAnest', label: 'Inicio anestesia' },
  { key: 'inicioOperac', label: 'Inicio cirugía' },
  { key: 'termOperac', label: 'Fin cirugía' },
];

// Sección con título (kicker) y una acción opcional a la derecha. Con `plegable` (tablet) pasa
// a un acordeón cerrado por defecto y la acción baja al cuerpo (no va dentro del summary).
function Seccion({ id, titulo, accion, plegable, children }) {
  if (plegable) {
    return (
      <details className="hca-acordeon">
        <summary className="hca-acordeon-resumen">
          <h4 className="hco-kicker">{titulo}</h4>
          <LuChevronDown className="icon hca-acordeon-chev" aria-hidden="true" />
        </summary>
        <div className="hca-acordeon-cuerpo">
          {accion && <div className="hca-acordeon-accion">{accion}</div>}
          {children}
        </div>
      </details>
    );
  }
  return (
    <section className="hco-section" aria-labelledby={id}>
      <div className="hco-section-head">
        <h4 id={id} className="hco-kicker">{titulo}</h4>
        {accion}
      </div>
      {children}
    </section>
  );
}

// Columna del formulario: equipo (solo lectura) y tiempos (editables, con el contador de la
// operación). Procedimiento y diagnóstico viven en la barra de contexto. En tablet (`plegable`)
// cada sección es un acordeón cerrado.
export default function ColumnaFormulario({
  equipo, tiempos, onTiempos, estimadaMin, plegable = false,
}) {
  return (
    <div className="hca-col">
      <Seccion
        id="hca-equipo-titulo"
        titulo="Equipo quirúrgico"
        plegable={plegable}
        accion={<Button variant="tinted" size="sm" icon={LuPencil}>Reportar cambio</Button>}
      >
        <dl className="hca-panel hca-equipo">
          {EQUIPO.map((e) => (
            <div key={e.key} className="hca-equipo-fila">
              <dt>{e.label}</dt>
              <dd>{equipo[e.key] || '—'}</dd>
            </div>
          ))}
        </dl>
      </Seccion>

      <Seccion id="hca-tiempos-titulo" titulo="Tiempos" plegable={plegable}>
        <div className="hca-tiempos">
          {TIEMPOS.map((t) => (
            <div className="form-field" key={t.key}>
              <label htmlFor={`hca-t-${t.key}`}>{t.label}</label>
              <input
                id={`hca-t-${t.key}`}
                type="time"
                value={tiempos[t.key]}
                onChange={(e) => onTiempos(t.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <TiempoTranscurrido inicio={tiempos.inicioOperac} fin={tiempos.termOperac} estimadaMin={estimadaMin} />
      </Seccion>
    </div>
  );
}
