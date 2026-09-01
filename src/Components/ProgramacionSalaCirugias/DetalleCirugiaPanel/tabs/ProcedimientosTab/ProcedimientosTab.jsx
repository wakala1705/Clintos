'use client';

import './ProcedimientosTab.css';

export default function ProcedimientosTab({ cirugia }) {
  return (
    <div className="pt-tab">
      <div className="pt-meta">
        <div className="pt-meta-item">
          <span className="pt-meta-label">Servicio</span>
          <span className="pt-meta-value">{cirugia.servicio}</span>
        </div>
        <div className="pt-meta-item">
          <span className="pt-meta-label">Tipo de cirugía</span>
          <span className="pt-meta-value">{cirugia.tipoCirugia}</span>
        </div>
      </div>
      <ul className="pt-list">
        {cirugia.procedimientos.map((p) => (
          <li key={p.nombre} className="pt-item">
            <div className="pt-item-head">
              <span className="pt-item-name">{p.nombre}</span>
              <span className={`pt-badge pt-badge-${p.tipo}`}>{p.tipo === 'principal' ? 'Principal' : 'Secundario'}</span>
            </div>
            <div className="pt-item-meta">{p.duracionMin} min · {p.notas}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
