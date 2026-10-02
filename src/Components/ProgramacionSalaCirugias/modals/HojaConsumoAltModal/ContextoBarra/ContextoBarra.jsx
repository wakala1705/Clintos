'use client';

import './ContextoBarra.css';
import { fechaDDMMAAAA, formatearMiles } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';
import { SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Barra de contexto (solo lectura, viene de la programación).
export default function ContextoBarra({ cirugia }) {
  const pac = cirugia.paciente ?? {};
  const sala = SALAS.find((s) => s.value === cirugia.salaId);
  const datos = [
    { label: 'Paciente', value: pac.nombre || '—', fuerte: true },
    { label: 'Edad', value: pac.edad !== undefined && pac.edad !== null ? `${pac.edad} años` : '—' },
    { label: 'N° historia clínica', value: formatearMiles(pac.documento) },
    { label: 'Fecha', value: fechaDDMMAAAA(cirugia.fecha) },
    { label: 'Sala', value: sala?.descripcion ?? '—' },
  ];
  return (
    <div className="hca-contexto">
      {datos.map((d) => (
        <div key={d.label} className={`hca-dato${d.fuerte ? ' is-fuerte' : ''}`}>
          <span className="hca-dato-label">{d.label}</span>
          <span className="hca-dato-valor">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
