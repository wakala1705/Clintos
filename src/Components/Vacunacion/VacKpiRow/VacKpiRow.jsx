import './VacKpiRow.css';
import { LuCalendarClock, LuCircleCheck, LuClock3, LuUsers } from 'react-icons/lu';
import { KPIS } from '@/hooks/Vacunacion/mockVacunacionData';

// 4 tarjetas KPI compactas, informativas — no interactivas (a diferencia de
// KpiFilterCard en Historia Clínica, que sí filtra al hacer click: acá el
// encargo pide que "no parezcan un dashboard independiente", así que se ven
// pero no controlan la tabla de abajo). Colores derivados de los tokens ya
// definidos en Vacunacion.css (primary/amber/teal/green) para que cada tarjeta
// se distinga a simple vista sin depender de leer el número.
const TILES = [
  { key: 'conEsquema', icon: LuUsers, label: 'Pacientes con esquema', tone: 'info' },
  { key: 'pendientes', icon: LuClock3, label: 'Vacunas pendientes', tone: 'warning' },
  { key: 'proximas', icon: LuCalendarClock, label: 'Próximas vacunas', tone: 'teal' },
  { key: 'aplicadasMes', icon: LuCircleCheck, label: 'Aplicadas este mes', tone: 'success' },
];

export default function VacKpiRow() {
  return (
    <div className="vac-kpi-row">
      {TILES.map((t) => (
        <div className="vac-kpi-card" key={t.key}>
          <span className={`vac-kpi-icon tone-${t.tone}`}><t.icon className="icon" aria-hidden="true" /></span>
          <span className="vac-kpi-body">
            <span className="vac-kpi-value">{KPIS[t.key]}</span>
            <span className="vac-kpi-label">{t.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
