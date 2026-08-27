import './VacTable.css';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import VacRowMenu from '../VacRowMenu/VacRowMenu';
import { ESQUEMA_LABEL, ESTADO_LABEL } from '@/hooks/Vacunacion/mockVacunacionData';
import { LuArrowDown, LuArrowUp, LuCircleCheck, LuEye, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

const SORTABLE_COLUMNS = [
  { key: 'nombre', label: 'Paciente' },
  { key: 'edadOrdenMeses', label: 'Edad' },
  { key: 'esquema', label: 'Esquema' },
  { key: 'estado', label: 'Estado' },
  { key: 'fechaProgramadaDias', label: 'Fecha programada' },
];

// "Venció hace N días" / "Hoy" / "En N días" — única pista textual (además
// del badge de Estado) de qué tan urgente es la próxima dosis, para no
// depender solo del color en la fila (encargo: "sin convertir la pantalla en
// una interfaz excesivamente alarmista", pero igual identificable). null =
// esquema completo, sin próxima dosis.
function formatDias(dias) {
  if (dias === null || dias === undefined) return null;
  if (dias < 0) return `Venció hace ${Math.abs(dias)} días`;
  if (dias === 0) return 'Hoy';
  return `En ${dias} días`;
}

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset — se
// renderizan ambas y la CSS decide cuál mostrar según el ancho (ver
// VacTable.css), mismo patrón que PatientsTable (Lista de Pacientes).
export default function VacTable({ pacientes, sortBy, sortDir, onSort, onVerDetalle, onRegistrarAplicacion, onVerEsquema, onEnviarRecordatorio }) {
  return (
    <>
      <div className="vac-table-wrap">
        <table className="vac-table">
          <thead>
            <tr>
              {SORTABLE_COLUMNS.map((col) => (
                <th key={col.key} aria-sort={sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="vac-th-sort-btn" onClick={() => onSort(col.key)}>
                    {col.label}
                    {sortBy === col.key && (sortDir === 'asc' ? <LuArrowUp className="icon" /> : <LuArrowDown className="icon" />)}
                  </button>
                </th>
              ))}
              <th>Próxima vacuna</th>
              <th>Última aplicación</th>
              <th className="vac-th-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => {
              const diasTexto = formatDias(p.fechaProgramadaDias);
              return (
                <tr
                  key={p.id}
                  className={p.estado === 'atrasado' ? 'row-atrasado' : undefined}
                  tabIndex={0}
                  onClick={() => onVerDetalle(p)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onVerDetalle(p); }}
                >
                  <td>
                    <div className="vac-patient-cell">
                      <PatientAvatar iniciales={initials(p.nombre)} className="vac-avatar" />
                      <div className="vac-patient-id">
                        <span className="vac-pname">{p.nombre}</span>
                        <span className="vac-pdoc">{p.documento}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.edadLabel}</td>
                  <td><EsquemaBadge esquema={p.esquema} /></td>
                  <td><EstadoBadge estado={p.estado} /></td>
                  <td>
                    {p.proximaVacuna ? (
                      <div className="vac-vacuna-cell">
                        <span className="vac-vacuna-nombre">{p.proximaVacuna.nombre}</span>
                        <span className="vac-vacuna-dosis">{p.proximaVacuna.dosis}</span>
                      </div>
                    ) : <span className="vac-muted">—</span>}
                  </td>
                  <td>
                    {p.fechaProgramadaLabel ? (
                      <div className="vac-fecha-cell">
                        <span>{p.fechaProgramadaLabel}</span>
                        <span className={`vac-fecha-hint${p.fechaProgramadaDias < 0 ? ' overdue' : ''}`}>{diasTexto}</span>
                      </div>
                    ) : <span className="vac-muted">Esquema completo</span>}
                  </td>
                  <td className="vac-cell-muted">{p.ultimaAplicacionLabel || <span className="vac-muted">—</span>}</td>
                  <td className="vac-td-acciones" onClick={(e) => e.stopPropagation()}>
                    <div className="vac-row-actions">
                      <button
                        type="button"
                        className="vac-row-action-btn"
                        onClick={() => onVerDetalle(p)}
                        aria-label={`Ver detalle de ${p.nombre}`}
                        title="Ver detalle"
                      >
                        <LuEye className="icon" />
                      </button>
                      <VacRowMenu
                        onRegistrarAplicacion={() => onRegistrarAplicacion(p)}
                        onVerEsquema={() => onVerEsquema(p)}
                        onEnviarRecordatorio={() => onEnviarRecordatorio(p)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="vac-cards">
        {pacientes.map((p) => {
          const diasTexto = formatDias(p.fechaProgramadaDias);
          return (
            <div className={`vac-card${p.estado === 'atrasado' ? ' row-atrasado' : ''}`} key={p.id}>
              <div className="vac-card-top">
                <PatientAvatar iniciales={initials(p.nombre)} className="vac-avatar" />
                <div className="vac-card-id">
                  <span className="vac-pname">{p.nombre}</span>
                  <span className="vac-pdoc">{p.documento}</span>
                </div>
                <EstadoBadge estado={p.estado} />
              </div>
              <div className="vac-card-meta">
                <span>{p.edadLabel} · <EsquemaBadge esquema={p.esquema} /></span>
                {p.proximaVacuna ? (
                  <span>{p.proximaVacuna.nombre} · {p.proximaVacuna.dosis}</span>
                ) : <span className="vac-muted">Esquema completo</span>}
                {p.fechaProgramadaLabel && (
                  <span>{p.fechaProgramadaLabel} · <span className={`vac-fecha-hint${p.fechaProgramadaDias < 0 ? ' overdue' : ''}`}>{diasTexto}</span></span>
                )}
                {p.ultimaAplicacionLabel && <span>Última aplicación: {p.ultimaAplicacionLabel}</span>}
              </div>
              <div className="vac-card-actions">
                <Button variant="secondary" icon={LuEye} className="vac-detalle-btn" onClick={() => onVerDetalle(p)}>
                  Ver detalle
                </Button>
                <VacRowMenu
                  onRegistrarAplicacion={() => onRegistrarAplicacion(p)}
                  onVerEsquema={() => onVerEsquema(p)}
                  onEnviarRecordatorio={() => onEnviarRecordatorio(p)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function initials(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function EsquemaBadge({ esquema }) {
  return <span className={`vac-esquema-badge esquema-${esquema}`}>{ESQUEMA_LABEL[esquema]}</span>;
}

// Cada estado ya se distingue por texto (WCAG 1.4.1) — Atrasado/Completo
// suman además un ícono propio (no un simple punto) porque son los dos
// extremos del esquema (riesgo real vs. cerrado) y ameritan una señal que
// siga siendo legible en escala de grises, sin que Pendiente/Al día (estados
// de tránsito normal, no una alarma) compitan visualmente por lo mismo.
function EstadoBadge({ estado }) {
  return (
    <span className={`vac-status-badge estado-${estado}`}>
      {estado === 'atrasado' && <LuTriangleAlert className="icon" aria-hidden="true" />}
      {estado === 'completo' && <LuCircleCheck className="icon" aria-hidden="true" />}
      {(estado === 'al-dia' || estado === 'pendiente') && <span className="dot" aria-hidden="true"></span>}
      {ESTADO_LABEL[estado]}
    </span>
  );
}
