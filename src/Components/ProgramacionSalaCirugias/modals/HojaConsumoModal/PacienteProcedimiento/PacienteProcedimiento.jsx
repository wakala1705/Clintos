'use client';

import './PacienteProcedimiento.css';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';
import { dxDeIngreso, fechaDDMMAAAA, formatearMiles } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';
import { SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const TIPOS = [
  { value: 'programado', label: 'Programado' },
  { value: 'emergencia', label: 'Emergencia' },
];

// Paciente y procedimiento: solo lectura, viene de la programación. El segmented
// Programado/Emergencia sí se puede cambiar (el badge del header lo sigue).
export default function PacienteProcedimiento({ cirugia, tipo, onTipoChange }) {
  const pac = cirugia.paciente ?? {};
  const dx = dxDeIngreso(cirugia.dxIngreso ?? cirugia.wizardDatos?.dxIngreso);
  const sala = SALAS.find((s) => s.value === cirugia.salaId);
  const celdas = [
    { label: 'Apellidos y nombres', value: pac.nombre || '—', span: 2 },
    { label: 'Edad', value: pac.edad !== undefined && pac.edad !== null ? `${pac.edad} años` : '—' },
    { label: 'Fecha', value: fechaDDMMAAAA(cirugia.fecha) },
    { label: 'Acto médico', value: cirugia.servicio || '—' },
    { label: 'N° HCL', value: formatearMiles(pac.documento) },
    { label: 'N° de S.S.', value: pac.aseguradora || '—' },
    { label: 'Sala N°', value: sala?.idSala ?? '—' },
    { label: 'Diagnóstico', value: dx.descripcion, span: 3 },
    { label: 'CIE-10', value: dx.codigo },
    { label: 'Operación', value: cirugia.procedimientoPrincipal || '—', span: 3 },
    { label: 'Cód. operac.', value: cirugia.procedimientos?.[0]?.cups || '—' },
  ];

  return (
    <section className="hco-section" aria-labelledby="hco-pp-titulo">
      <div className="hco-section-head">
        <h4 id="hco-pp-titulo" className="hco-kicker">Paciente y procedimiento</h4>
        <div className="chip-group segmented" role="radiogroup" aria-label="Tipo de cirugía">
          {TIPOS.map((t) => (
            <ChipFilter
              key={t.value}
              variant="segmented"
              active={tipo === t.value}
              role="radio"
              aria-checked={tipo === t.value}
              onClick={() => onTipoChange(t.value)}
            >
              {t.label}
            </ChipFilter>
          ))}
        </div>
      </div>
      <dl className="hco-pp-grid">
        {celdas.map((c) => (
          <div key={c.label} className={`hco-pp-celda${c.span ? ` span-${c.span}` : ''}`}>
            <dt>{c.label}</dt>
            <dd>{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
