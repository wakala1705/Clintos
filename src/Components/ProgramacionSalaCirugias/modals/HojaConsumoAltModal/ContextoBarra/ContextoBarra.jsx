'use client';

import {
  LuCalendar, LuDoorOpen, LuFileText, LuUser,
} from 'react-icons/lu';
import './ContextoBarra.css';
import { dxDeIngreso, fechaDDMMAAAA, formatearMiles } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';
import { SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Barra de contexto (solo lectura, viene de la programación) en UNA línea: el paciente y sus datos
// a la izquierda; a la derecha, tras un divisor, el procedimiento (CUPS) y el diagnóstico (CIE-10),
// que se recortan con "…" si no caben (el texto completo queda en el tooltip). En pantallas
// angostas la barra envuelve a varias líneas.
export default function ContextoBarra({ cirugia }) {
  const pac = cirugia.paciente ?? {};
  const sala = SALAS.find((s) => s.value === cirugia.salaId);
  const dx = dxDeIngreso(cirugia.dxIngreso ?? cirugia.wizardDatos?.dxIngreso);
  const cups = cirugia.procedimientos?.[0]?.cups || '—';

  const meta = [
    { icon: LuUser, label: 'Edad', value: pac.edad !== undefined && pac.edad !== null ? `${pac.edad} años` : '—' },
    { icon: LuFileText, label: 'N° historia clínica', value: formatearMiles(pac.documento) },
    { icon: LuCalendar, label: 'Fecha', value: fechaDDMMAAAA(cirugia.fecha) },
    { icon: LuDoorOpen, label: 'Sala', value: sala?.descripcion ?? '—' },
  ];

  const clinico = [
    { label: 'Procedimiento (CUPS)', codigo: cups, texto: cirugia.procedimientoPrincipal || '—' },
    { label: 'Diagnóstico (CIE-10)', codigo: dx.codigo, texto: dx.descripcion },
  ];

  return (
    <section className="hca-contexto" aria-label="Contexto de la cirugía">
      <span className="hca-ctx-nombre">{pac.nombre || '—'}</span>

      <dl className="hca-ctx-meta">
        {meta.map((d) => (
          <div key={d.label} className="hca-ctx-dato">
            <dt><d.icon className="icon" aria-hidden="true" />{d.label}</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>

      <div className="hca-ctx-clinico">
        {clinico.map((c) => (
          <div key={c.label} className="hca-ctx-item" title={`${c.codigo} ${c.texto}`}>
            <span className="hca-ctx-label">{c.label}</span>
            <span className="hca-ctx-valor"><b className="hca-codigo">{c.codigo}</b>{c.texto}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
