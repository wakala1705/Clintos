'use client';

import './PatientsTable.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { LuFileText, LuHourglass } from 'react-icons/lu';

// Chips de pendientes clínicos de un paciente (órdenes por firmar/resultados
// nuevos, con "crítico" aparte) — siempre texto con conteo, nunca solo color
// (WCAG 1.4.1). Sin pendientes: guion, no una fila vacía.
function PendientesCell({ p }) {
  if (p.pendientes.length === 0) return <span className="cell-muted">—</span>;
  const resultadosNormales = p.resultadosNuevos - p.resultadosCriticos;
  return (
    <div className="hh-pend-chips">
      {p.resultadosCriticos > 0 && (
        <Badge tone="danger" dot>
          {p.resultadosCriticos} {p.resultadosCriticos === 1 ? 'crítico' : 'críticos'}
        </Badge>
      )}
      {p.ordenesPorFirmar > 0 && (
        <Badge tone="warn">
          {p.ordenesPorFirmar} {p.ordenesPorFirmar === 1 ? 'orden' : 'órdenes'}
        </Badge>
      )}
      {resultadosNormales > 0 && (
        <Badge tone="info">
          {resultadosNormales} {resultadosNormales === 1 ? 'resultado' : 'resultados'}
        </Badge>
      )}
    </div>
  );
}

function EvolucionBadge({ p }) {
  return p.evolucionPendiente
    ? <Badge tone="warn" dot>Pendiente</Badge>
    : <Badge tone="success" dot>Al día</Badge>;
}

// Fila = un paciente. Clic selecciona (resalta) / clic de nuevo sobre la fila
// ya seleccionada deselecciona (vuelve Clintos AI al contexto de pantalla
// completa, ver AGENTS.md-style comentario en ContextChip.jsx), doble clic
// abre su historia clínica — mismo patrón clic-selecciona/doble-clic-abre que
// PatientsTable.jsx de Enfermería y AgendaTable.jsx; el botón "Historia" de
// cada fila es la vía alterna sin depender del doble clic.
//
// `selectedId`/`onSelectRow` controlados desde HistoriaClinicaHospitalizacion.jsx
// (antes vivía local acá) — Clintos AI necesita leer qué paciente está
// seleccionado para volverse contextual (brief "Contexto dinámico"), así que
// la selección ya no puede quedar atrapada dentro de esta tabla.
export default function PatientsTable({
  pacientes, onOpenHistoria, selectedId, onSelectRow,
}) {
  function toggleSelectRow(id) {
    onSelectRow(selectedId === id ? null : id);
  }

  function handleRowKeyDown(e, id) {
    if (e.target !== e.currentTarget) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (selectedId === id) onOpenHistoria(id);
    else onSelectRow(id);
  }

  if (pacientes.length === 0) {
    return (
      <div className="hh-empty" role="status">
        <p className="hh-empty-title">No hay pacientes para mostrar</p>
        <p className="hh-empty-sub">Prueba con otro filtro, otra área o una búsqueda distinta.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hh-table-wrap">
        <table className="data-table hh-patients-table">
          <thead>
            <tr>
              <th>Cama</th>
              <th>ID paciente</th>
              <th>Ingreso</th>
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th className="col-right">Edad</th>
              <th>Evolución</th>
              <th>Pendientes</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr
                key={p.id}
                className={selectedId === p.id ? 'selected' : undefined}
                aria-selected={selectedId === p.id}
                tabIndex={0}
                onClick={() => toggleSelectRow(p.id)}
                onKeyDown={(e) => handleRowKeyDown(e, p.id)}
                onDoubleClick={() => onOpenHistoria(p.id)}
              >
                <td className="cell-primary">{p.cama}</td>
                <td className="cell-muted">{p.id}</td>
                <td>
                  {p.admision}
                  {p.prolongada ? (
                    <span className="hh-estancia-flag" title={`${p.diasEstancia} días de estancia`}>
                      <LuHourglass className="icon" aria-hidden="true" />
                      {p.diasEstancia} días
                    </span>
                  ) : (
                    <span className="cell-sub">{p.diasEstancia} días</span>
                  )}
                </td>
                <td className="cell-primary hh-cell-nombre">{p.paciente}</td>
                <td className="hh-col-diagnostico">{p.diagnostico}</td>
                <td className="col-right cell-muted">{p.edad}</td>
                <td><EvolucionBadge p={p} /></td>
                <td><PendientesCell p={p} /></td>
                <td className="col-acciones" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" icon={LuFileText} onClick={() => onOpenHistoria(p.id)}>
                    Historia
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas mobile — mismo dataset, mismo registro que la tabla de
          arriba; la CSS decide cuál se ve según el ancho (ver
          PatientsTable.css y el mismo patrón en Enfermería/PatientsTable). */}
      <div className="hh-cards">
        {pacientes.map((p) => (
          <div
            className={`hh-card${selectedId === p.id ? ' selected' : ''}`}
            key={p.id}
            tabIndex={0}
            aria-selected={selectedId === p.id}
            onClick={() => toggleSelectRow(p.id)}
            onKeyDown={(e) => handleRowKeyDown(e, p.id)}
            onDoubleClick={() => onOpenHistoria(p.id)}
          >
            <div className="hh-card-top">
              <div className="hh-card-id">
                <div className="hh-card-name">{p.paciente}</div>
                <div className="hh-card-sub">Cama {p.cama} · {p.id}</div>
              </div>
              <EvolucionBadge p={p} />
            </div>
            <div className="hh-card-meta">
              <span>{p.diagnostico} · {p.edad} años</span>
              <span>
                Ingreso {p.admision}
                {p.prolongada && (
                  <span className="hh-estancia-flag" title={`${p.diasEstancia} días de estancia`}>
                    <LuHourglass className="icon" aria-hidden="true" />
                    {p.diasEstancia} días
                  </span>
                )}
              </span>
            </div>
            <PendientesCell p={p} />
            <div className="hh-card-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" icon={LuFileText} onClick={() => onOpenHistoria(p.id)}>
                Historia
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
