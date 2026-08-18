'use client';

import { useState } from 'react';
import './PatientsTable.css';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import { ESTADO_MEDICACION_LABEL } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { LuCircleCheck, LuClock, LuHourglass, LuMinus, LuTriangleAlert } from 'react-icons/lu';

// Ícono + texto por estado (nunca solo color, mismo criterio WCAG que el
// resto del proyecto — ver .dp-status-badge/.gcm-estado-badge en otras
// features) — reutiliza los mismos 4 colores semánticos (verde/ámbar/rojo/
// gris) que el resto de la app, pero con nombres propios de este dominio
// (Al día/Pendiente/Retrasada/No aplica) en vez de tomar prestadas clases
// como .dp-status-badge, cuyos nombres (st-administered, st-upcoming...)
// pertenecen al dominio de dosis de AtencionEnfermeria y confundirían acá.
const ESTADO_ICONO = {
  'al-dia': LuCircleCheck,
  pendiente: LuClock,
  retrasada: LuTriangleAlert,
  'no-aplica': LuMinus,
};

// Fila = un paciente. Clic selecciona (resalta), doble clic abre la
// atención de ese paciente — mismo patrón clic-selecciona/doble-clic-abre
// que AgendaTable.jsx (HistoriaClinica); cada fila también expone el menú
// "⋮" (RowActionsMenu) como vía alterna sin depender del doble clic.
export default function PatientsTable({ pacientes, onOpenAtencion }) {
  const [selectedId, setSelectedId] = useState(null);

  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (selectedId === id) onOpenAtencion(id);
    else setSelectedId(id);
  }

  return (
    <>
      <div className="pg-table-wrap">
        <table className="data-table pg-patients-table">
          <thead>
            <tr>
              <th>Cama</th>
              <th>ID paciente</th>
              <th>Admisión</th>
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th className="col-right">Edad</th>
              <th>Estado medicación</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => {
              const EstadoIcon = ESTADO_ICONO[p.estadoMedicacion];
              return (
                <tr
                  key={p.id}
                  className={selectedId === p.id ? 'selected' : undefined}
                  aria-selected={selectedId === p.id}
                  tabIndex={0}
                  onClick={() => setSelectedId(p.id)}
                  onKeyDown={(e) => handleRowKeyDown(e, p.id)}
                  onDoubleClick={() => onOpenAtencion(p.id)}
                >
                  <td className="cell-primary">{p.cama}</td>
                  <td className="cell-muted">{p.id}</td>
                  <td>
                    {p.admision}
                    {p.prolongada ? (
                      <span className="pg-estancia-flag" title={`${p.diasEstancia} días de estancia`}>
                        <LuHourglass className="icon" aria-hidden="true" />
                        {p.diasEstancia} días
                      </span>
                    ) : (
                      <span className="cell-sub">{p.diasEstancia} días</span>
                    )}
                  </td>
                  <td className="cell-primary">{p.paciente}</td>
                  <td className="pg-col-diagnostico">{p.diagnostico}</td>
                  <td className="col-right cell-muted">{p.edad}</td>
                  <td>
                    <span className={`pg-med-badge pg-med-${p.estadoMedicacion}`}>
                      <EstadoIcon className="icon" aria-hidden="true" />
                      {ESTADO_MEDICACION_LABEL[p.estadoMedicacion]}
                    </span>
                  </td>
                  <td className="col-acciones">
                    <RowActionsMenu
                      paciente={p.paciente}
                      onVerMedicacion={() => onOpenAtencion(p.id)}
                      onVerOrdenes={() => onOpenAtencion(p.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas mobile — mismo dataset, misma fila = mismo registro que la
          tabla de arriba, la CSS decide cuál se ve según el ancho (ver
          PatientsTable.css y el mismo patrón en ListaPacientes/PatientsTable). */}
      <div className="pg-cards">
        {pacientes.map((p) => {
          const EstadoIcon = ESTADO_ICONO[p.estadoMedicacion];
          return (
            <div
              className={`pg-card${selectedId === p.id ? ' selected' : ''}`}
              key={p.id}
              tabIndex={0}
              aria-selected={selectedId === p.id}
              onClick={() => setSelectedId(p.id)}
              onKeyDown={(e) => handleRowKeyDown(e, p.id)}
              onDoubleClick={() => onOpenAtencion(p.id)}
            >
              <div className="pg-card-top">
                <div className="pg-card-id">
                  <div className="pg-card-name">{p.paciente}</div>
                  <div className="pg-card-sub">Cama {p.cama} · {p.id}</div>
                </div>
                <span className={`pg-med-badge pg-med-${p.estadoMedicacion}`}>
                  <EstadoIcon className="icon" aria-hidden="true" />
                  {ESTADO_MEDICACION_LABEL[p.estadoMedicacion]}
                </span>
              </div>
              <div className="pg-card-meta">
                <span>{p.diagnostico} · {p.edad} años</span>
                <span>
                  Admisión {p.admision}
                  {p.prolongada && (
                    <span className="pg-estancia-flag" title={`${p.diasEstancia} días de estancia`}>
                      <LuHourglass className="icon" aria-hidden="true" />
                      {p.diasEstancia} días
                    </span>
                  )}
                </span>
              </div>
              <div className="pg-card-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <RowActionsMenu
                  paciente={p.paciente}
                  onVerMedicacion={() => onOpenAtencion(p.id)}
                  onVerOrdenes={() => onOpenAtencion(p.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
