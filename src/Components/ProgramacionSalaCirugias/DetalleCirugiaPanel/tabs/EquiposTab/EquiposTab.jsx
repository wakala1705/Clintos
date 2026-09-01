'use client';

import './EquiposTab.css';
import { EQUIPO_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function EquiposTab({ cirugia }) {
  return (
    <ul className="eqt-list">
      {cirugia.equipos.map((e) => (
        <li key={e.nombre} className="eqt-row">
          <span className="eqt-name">{e.nombre}</span>
          <span className={`eqt-tag eqt-tag-${e.estado}`}>{EQUIPO_ESTADO_LABEL[e.estado]}</span>
        </li>
      ))}
    </ul>
  );
}
