'use client';

import { LuChevronDown, LuLink, LuPencil } from 'react-icons/lu';
import './ColumnaFormulario.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import { dxDeIngreso } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';

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

// Columna del formulario: procedimiento y diagnóstico (de la programación), equipo (solo
// lectura) y tiempos (editables). En tablet (`plegable`) cada sección es un acordeón cerrado.
export default function ColumnaFormulario({ cirugia, equipo, tiempos, onTiempos, plegable = false }) {
  const dx = dxDeIngreso(cirugia.dxIngreso ?? cirugia.wizardDatos?.dxIngreso);
  const cups = cirugia.procedimientos?.[0]?.cups || '—';

  return (
    <div className="hca-col">
      <Seccion
        id="hca-proc-titulo"
        titulo="Procedimiento"
        plegable={plegable}
        accion={<Badge tone="info"><LuLink className="hca-badge-icon" aria-hidden="true" />Desde programación</Badge>}
      >
        <div className="hca-panel">
          <div className="hca-campo">
            <span className="hca-campo-label">Procedimiento (CUPS)</span>
            <span className="hca-campo-valor"><b className="hca-codigo">{cups}</b> · {cirugia.procedimientoPrincipal || '—'}</span>
          </div>
          <div className="hca-campo">
            <span className="hca-campo-label">Diagnóstico (CIE-10)</span>
            <span className="hca-campo-valor"><b className="hca-codigo">{dx.codigo}</b> · {dx.descripcion}</span>
          </div>
        </div>
      </Seccion>

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
      </Seccion>
    </div>
  );
}
