import './IngresoCell.css';
import Badge from '@/Components/Badge/Badge';
import { estanciaLabel, fechaIngresoLarga } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { LuHourglass } from 'react-icons/lu';

// Fecha de ingreso + estancia en una sola línea — compartida por las tablas
// de pacientes de HC Hospitalización y del Panel General de Enfermería. Los
// dos extremos de la estancia se marcan con un <Badge> en vez del texto:
// - Nuevo ingreso (< 24 h): "24.SEP.2026" + badge info "Nuevo ingreso" (las
//   horas no se muestran: el badge ya dice que entró hoy).
// - Prolongada: "02.SEP.2026" + badge warn con reloj de arena y los días.
// - Resto: "12.AGO.2026 - 8 días".
// `p` = fila de PACIENTES_PISO (ingreso, diasEstancia, nuevoIngreso, prolongada).
// La celda que lo contiene pone white-space:nowrap.
export default function IngresoCell({ p }) {
  const fecha = fechaIngresoLarga(p.ingreso);
  if (p.nuevoIngreso) {
    return (
      <>
        {fecha}
        <Badge tone="info" className="ingreso-cell-badge">Nuevo ingreso</Badge>
      </>
    );
  }
  if (p.prolongada) {
    return (
      <>
        {fecha}
        <Badge tone="warn" className="ingreso-cell-badge" title={`${p.diasEstancia} días de estancia`}>
          <LuHourglass className="ingreso-cell-icon" aria-hidden="true" />
          {estanciaLabel(p)}
        </Badge>
      </>
    );
  }
  return (
    <>
      {fecha}
      <span className="ingreso-cell-dias"> - {estanciaLabel(p)}</span>
    </>
  );
}
