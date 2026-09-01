'use client';

import './PersonalTab.css';

function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function PersonalTab({ cirugia }) {
  return (
    <ul className="pst-list">
      {cirugia.personal.map((p) => (
        <li key={p.rol} className="pst-row">
          <span className="pst-avatar" aria-hidden="true">{iniciales(p.nombre)}</span>
          <span className="pst-info">
            <span className="pst-name">{p.nombre}</span>
            <span className="pst-rol">{p.rol}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
