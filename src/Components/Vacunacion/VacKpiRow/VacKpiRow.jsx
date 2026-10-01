import './VacKpiRow.css';
import { LuCalendarClock, LuCircleCheck, LuClock3, LuUsers } from 'react-icons/lu';
import KpiCard from '@/Components/KpiCard/KpiCard';
import { KPIS } from '@/hooks/Vacunacion/mockVacunacionData';

// 4 tarjetas KPI informativas — no interactivas (a diferencia de KpiCard con
// onClick en Historia Clínica, que sí filtra al hacer click: acá el encargo
// pide que "no parezcan un dashboard independiente", así que se ven pero no
// controlan la tabla de abajo). Cada tarjeta lleva un tono distinto del
// KpiCard compartido para distinguirse a simple vista sin leer el número.
const TILES = [
  { key: 'conEsquema', icon: LuUsers, label: 'Pacientes con esquema', variant: 'neutral' },
  { key: 'pendientes', icon: LuClock3, label: 'Vacunas pendientes', variant: 'warning' },
  { key: 'proximas', icon: LuCalendarClock, label: 'Próximas vacunas', variant: 'info' },
  { key: 'aplicadasMes', icon: LuCircleCheck, label: 'Aplicadas este mes', variant: 'success' },
];

export default function VacKpiRow() {
  return (
    <div className="vac-kpi-row">
      {TILES.map((t) => (
        <KpiCard key={t.key} icon={t.icon} label={t.label} value={KPIS[t.key]} variant={t.variant} />
      ))}
    </div>
  );
}
