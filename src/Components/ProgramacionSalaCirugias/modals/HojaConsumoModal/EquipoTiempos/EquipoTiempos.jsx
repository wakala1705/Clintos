'use client';

import './EquipoTiempos.css';

const EQUIPO = [
  { key: 'anestesiologo', label: 'Anestesiólogo' },
  { key: 'cirujano', label: 'Cirujano principal' },
  { key: 'ayudante', label: 'Cirujano ayudante' },
  { key: 'instrumentista', label: 'Enf. instrumentista' },
  { key: 'circulante', label: 'Enf. circulante' },
];

const TIEMPOS = [
  { key: 'inicioAnest', label: 'Inicio anest.' },
  { key: 'inicioOperac', label: 'Inicio operac.' },
  { key: 'termOperac', label: 'Term. operac.' },
];

export default function EquipoTiempos({ equipo, tiempos, onEquipo, onTiempos }) {
  return (
    <section className="hco-section" aria-labelledby="hco-et-titulo">
      <div className="hco-section-head">
        <h4 id="hco-et-titulo" className="hco-kicker">Equipo quirúrgico y tiempos</h4>
      </div>
      <div className="hco-et-grid">
        {EQUIPO.map((f) => (
          <div className="form-field" key={f.key}>
            <label htmlFor={`hco-eq-${f.key}`}>{f.label}</label>
            <input
              id={`hco-eq-${f.key}`}
              type="text"
              value={equipo[f.key]}
              onChange={(e) => onEquipo(f.key, e.target.value)}
              placeholder="Sin asignar"
            />
          </div>
        ))}
      </div>
      <div className="hco-et-grid">
        {TIEMPOS.map((f) => (
          <div className="form-field" key={f.key}>
            <label htmlFor={`hco-t-${f.key}`}>{f.label}</label>
            <input
              id={`hco-t-${f.key}`}
              type="time"
              value={tiempos[f.key]}
              onChange={(e) => onTiempos(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
