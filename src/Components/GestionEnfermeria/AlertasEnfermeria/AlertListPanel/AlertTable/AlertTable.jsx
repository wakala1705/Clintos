'use client';

import './AlertTable.css';
import { PriorityBadge, StatusBadge, ICONOS_ALERTA } from '../../AlertBadges/AlertBadges';
import { AREAS_ALERTA, TIPO_ALERTA_CONFIG } from '@/hooks/GestionEnfermeria/mockAlertasData';
import { LuClock } from 'react-icons/lu';

const AREA_LABEL = Object.fromEntries(AREAS_ALERTA.map((a) => [a.value, a.label]));

// Subtítulo de la celda "Creada" (encargo, sección 5: cada ejemplo trae una
// segunda línea distinta — "Retraso: 32 min" / "Programado: 14:00" /
// "Desde: 13:30" / "Pospuesta hasta..." / "Nueva orden"/"Post egreso"/
// "A: <destino>" ya vienen resueltos en `detalle`) — prioriza retraso (el
// dato más urgente) sobre programado, y agrega la ventana de pospuesta
// cuando corresponde.
// Camas de alertas sin paciente (ej. limpieza post-egreso) no tienen un
// número real que mostrar (ver camaLibre() en mockAlertasData.js) — nunca
// anteponer "Cama " a un texto que ya no es un número de cama.
function ubicacionCama(alerta) {
  return alerta.cama ? `Cama ${alerta.cama}` : 'Sin cama asignada';
}

function creadaSub(alerta) {
  if (alerta.estado === 'pospuesta' && alerta.pospuestaHasta) return `Vuelve a las ${alerta.pospuestaHasta}`;
  if (alerta.retrasoMin) return `Retraso: ${alerta.retrasoMin} min`;
  if (alerta.programadoPara) return `Programado: ${alerta.programadoPara}`;
  return null;
}

// Fila = una alerta. Un solo clic selecciona Y abre el drawer de detalle
// (encargo explícito, sección 6) — mismo patrón que TaskTable.jsx (Tareas de
// enfermería): un clic ya es la interacción natural, sin doble-clic ni
// navegar a otra pantalla. El botón de acción primaria en la columna
// Acciones hace `e.stopPropagation()` para no disparar también la selección
// de fila (mismo criterio que TaskTable).
export default function AlertTable({ alertas, selectedId, onSelect, onAccionPrimaria }) {
  return (
    <>
      <div className="alert-table-wrap">
        <table className="data-table alert-table">
          <thead>
            <tr>
              <th>Alerta</th>
              <th>Paciente</th>
              <th>Ubicación</th>
              <th>Creada</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((a) => {
              const tipoCfg = TIPO_ALERTA_CONFIG[a.tipo];
              const TipoIcon = ICONOS_ALERTA[tipoCfg.icon];
              const accion = a.estado !== 'resuelta' ? tipoCfg.accion : null;
              const AccionIcon = accion ? ICONOS_ALERTA[accion.icon] : null;
              const sub = creadaSub(a);
              return (
                <tr
                  key={a.id}
                  className={selectedId === a.id ? 'selected' : undefined}
                  aria-selected={selectedId === a.id}
                  tabIndex={0}
                  onClick={() => onSelect(a.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(a.id); } }}
                >
                  <td className="alert-col-alerta">
                    <span className={`alert-type-icon alert-type-icon-${a.prioridad}`}>
                      <TipoIcon className="icon" aria-hidden="true" />
                    </span>
                    <span className="alert-col-alerta-text">
                      <span className="cell-primary">{a.titulo}</span>
                      <span className="cell-sub">{a.detalle}</span>
                    </span>
                  </td>
                  <td className={a.paciente ? undefined : 'cell-muted'}>{a.paciente ?? 'Sin paciente'}</td>
                  <td className="alert-col-ubicacion">
                    <span className={a.cama ? 'cell-primary' : 'cell-primary cell-muted'}>{ubicacionCama(a)}</span>
                    <span className="cell-sub">{AREA_LABEL[a.area]}</span>
                  </td>
                  <td className="alert-col-creada">
                    <span className="alert-hace"><LuClock className="icon" aria-hidden="true" />{a.hace}</span>
                    {sub && <span className="cell-sub">{sub}</span>}
                  </td>
                  <td><PriorityBadge prioridad={a.prioridad} /></td>
                  <td><StatusBadge estado={a.estado} prioridad={a.prioridad} /></td>
                  <td className="col-acciones">
                    {accion && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={(e) => { e.stopPropagation(); onAccionPrimaria(a); }}
                      >
                        <AccionIcon className="icon" aria-hidden="true" />
                        {accion.label}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {alertas.length === 0 && (
          <div className="alert-table-empty">Ningún resultado con los filtros actuales.</div>
        )}
      </div>

      {/* Tarjetas mobile — mismo dataset/mismas acciones que la tabla de
          arriba, la CSS decide cuál se ve según el ancho (mismo patrón que
          TaskTable/PatientsTable, ver AGENTS.md). */}
      <div className="alert-cards">
        {alertas.map((a) => {
          const tipoCfg = TIPO_ALERTA_CONFIG[a.tipo];
          const accion = a.estado !== 'resuelta' ? tipoCfg.accion : null;
          const AccionIcon = accion ? ICONOS_ALERTA[accion.icon] : null;
          const sub = creadaSub(a);
          return (
            <div
              className={`alert-card${selectedId === a.id ? ' selected' : ''}`}
              key={a.id}
              aria-selected={selectedId === a.id}
              tabIndex={0}
              onClick={() => onSelect(a.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(a.id); } }}
            >
              <div className="alert-card-top">
                <PriorityBadge prioridad={a.prioridad} />
                <StatusBadge estado={a.estado} prioridad={a.prioridad} />
              </div>
              <span className="cell-primary">{a.titulo}</span>
              <span className="cell-sub">{a.detalle}</span>
              <div className="alert-card-meta">
                <span>{a.paciente ?? 'Sin paciente'}</span>
                <span>{ubicacionCama(a)} · {AREA_LABEL[a.area]}</span>
                <span className="alert-hace"><LuClock className="icon" aria-hidden="true" />{a.hace}{sub ? ` · ${sub}` : ''}</span>
              </div>
              {accion && (
                <div className="alert-row-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => onAccionPrimaria(a)}>
                    <AccionIcon className="icon" aria-hidden="true" />
                    {accion.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {alertas.length === 0 && (
          <div className="alert-table-empty">Ningún resultado con los filtros actuales.</div>
        )}
      </div>
    </>
  );
}
