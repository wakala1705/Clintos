'use client';

import './PacienteHeader.css';

// Header dedicado y minimal -- no reusa PatientBanner (ese componente trae
// chips de EDAD/SEXO/EPS/alergias pensados para atención clínica en vivo,
// mucho más pesado de lo que pide esta pantalla de consulta, ver spec).
// Mismo patrón tipográfico que .psc-page-header (h1 + p) con 2 líneas de
// identidad del paciente arriba.
export default function PacienteHeader({ paciente, totalIntervenciones }) {
  return (
    <div className="hq-header">
      <div className="hq-header-patient">{paciente.nombre}</div>
      <div className="hq-header-affiliate">ID de afiliado: {paciente.idAfiliado}</div>
      <h1>Historial quirúrgico</h1>
      <p>{totalIntervenciones} {totalIntervenciones === 1 ? 'intervención' : 'intervenciones'}</p>
    </div>
  );
}
