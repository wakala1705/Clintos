'use client';

import { useState } from 'react';
import './PatientsTable.css';
import IngresoCell from '@/Components/IngresoCell/IngresoCell';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import { documentoDe, ESTADO_MEDICACION_LABEL } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { LuCircleCheck, LuClock, LuMinus, LuTriangleAlert } from 'react-icons/lu';

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
export default function PatientsTable({ pacientes, onOpenAtencion, onVerDetalle }) {
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
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th>Estado medicación</th>
              <th>Fecha de ingreso</th>
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
                  <td className="cell-primary pg-cell-cama">{p.cama}</td>
                  {/* Identidad (nombre + documento · edad) → diagnóstico → lo
                      que pide acción (estado de medicación) → admisión como
                      contexto al final. Mismo orden que PatientsTable.jsx de
                      Historia Clínica Hospitalización. */}
                  <td>
                    <span className="cell-primary pg-cell-nombre">{p.paciente}</span>
                    <span className="cell-sub">CC {documentoDe(p.id)} · {p.edad} años</span>
                  </td>
                  <td className="pg-col-diagnostico">{p.diagnostico}</td>
                  <td>
                    <span className={`pg-med-badge pg-med-${p.estadoMedicacion}`}>
                      <EstadoIcon className="icon" aria-hidden="true" />
                      {ESTADO_MEDICACION_LABEL[p.estadoMedicacion]}
                    </span>
                  </td>
                  {/* Mismo formato que HC Hospitalización: "12.AGO.2026 - 8 días". */}
                  <td className="pg-cell-ingreso"><IngresoCell p={p} /></td>
                  <td className="col-acciones">
                    <RowActionsMenu
                      paciente={p.paciente}
                      onVerDetalle={() => onVerDetalle(p.id)}
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
                  <div className="pg-card-sub">Cama {p.cama} · CC {documentoDe(p.id)}</div>
                </div>
                <span className={`pg-med-badge pg-med-${p.estadoMedicacion}`}>
                  <EstadoIcon className="icon" aria-hidden="true" />
                  {ESTADO_MEDICACION_LABEL[p.estadoMedicacion]}
                </span>
              </div>
              <div className="pg-card-meta">
                <span>{p.diagnostico} · {p.edad} años</span>
                <span>
                  Ingreso <IngresoCell p={p} />
                </span>
              </div>
              <div className="pg-card-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <RowActionsMenu
                  paciente={p.paciente}
                  onVerDetalle={() => onVerDetalle(p.id)}
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
