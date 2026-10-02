'use client';

import { LuLink, LuPencil } from 'react-icons/lu';
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

// Columna izquierda: procedimiento y diagnóstico (de la programación), equipo (solo lectura),
// y tiempos (editables).
export default function ColumnaFormulario({ cirugia, equipo, tiempos, onTiempos }) {
  const dx = dxDeIngreso(cirugia.dxIngreso ?? cirugia.wizardDatos?.dxIngreso);
  const cups = cirugia.procedimientos?.[0]?.cups || '—';

  return (
    <div className="hca-col">
      <section className="hco-section" aria-labelledby="hca-proc-titulo">
        <div className="hco-section-head">
          <h4 id="hca-proc-titulo" className="hco-kicker">Procedimiento</h4>
          <Badge tone="info"><LuLink className="hca-badge-icon" aria-hidden="true" />Desde programación</Badge>
        </div>
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
      </section>

      <section className="hco-section" aria-labelledby="hca-equipo-titulo">
        <div className="hco-section-head">
          <h4 id="hca-equipo-titulo" className="hco-kicker">Equipo quirúrgico</h4>
          <Button variant="tinted" size="sm" icon={LuPencil}>Reportar cambio</Button>
        </div>
        <dl className="hca-panel hca-equipo">
          {EQUIPO.map((e) => (
            <div key={e.key} className="hca-equipo-fila">
              <dt>{e.label}</dt>
              <dd>{equipo[e.key] || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="hco-section" aria-labelledby="hca-tiempos-titulo">
        <div className="hco-section-head">
          <h4 id="hca-tiempos-titulo" className="hco-kicker">Tiempos</h4>
        </div>
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
      </section>
    </div>
  );
}
