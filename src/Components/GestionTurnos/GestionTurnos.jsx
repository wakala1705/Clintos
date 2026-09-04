'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './GestionTurnos.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import KpiCard from '@/Components/KpiCard/KpiCard';
import GestionTurnosSidebar from './GestionTurnosSidebar/GestionTurnosSidebar';
import NuevoTurnoModal from './NuevoTurnoModal/NuevoTurnoModal';
import TurnoRowActionsMenu from './TurnoRowActionsMenu/TurnoRowActionsMenu';
import { TurnoBadge, EstadoTurnoBadge, EstadoConfigBadge } from './TurnoBadges/TurnoBadges';
import { TIPOS_TURNO_INICIALES, duracionHoras } from '@/hooks/GestionTurnos/mockTurnosData';
import { ENFERMERAS_INICIALES } from '@/hooks/GestionTurnos/mockEnfermerasData';
import {
  LuCalendarClock, LuCircleDashed, LuPlus, LuUserCheck, LuUsers,
} from 'react-icons/lu';

const TURNO_LABEL = Object.fromEntries(TIPOS_TURNO_INICIALES.map((t) => [t.id, t.nombre]));

// Cuántas enfermeras se muestran en la vista previa del bloque "Configuración
// del personal" antes de derivar a la página completa (encargo: ejemplo con
// 5 filas) — el resto se consulta en /gestion-turnos/enfermeras.
const PREVIEW_ENFERMERAS = 5;

// Resumen de "Gestión de turnos" (encargo V1: solo tipos de turno + turnos
// permitidos por enfermera, ver AGENTS.md — el nombre del módulo pasó de
// "Configuración de turnos" a "Gestión de turnos" al sumar la sección
// PLANIFICACIÓN, ver GestionTurnosSidebar.jsx). Mismo criterio de estado
// 100% local que el resto del módulo — esta página no comparte su copia
// mutable de `turnos` con la de Tipos de turno/Enfermeras, se remonta
// fresca en cada navegación (ver GestionCamas.jsx/GestionCamasReservas.jsx).
export default function GestionTurnos() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [turnos, setTurnos] = useState(TIPOS_TURNO_INICIALES);
  const [enfermeras] = useState(ENFERMERAS_INICIALES);
  const [modal, setModal] = useState(null);

  const kpis = useMemo(() => ({
    tiposActivos: turnos.filter((t) => t.estado === 'activo').length,
    totalEnfermeras: enfermeras.length,
    configuradas: enfermeras.filter((e) => e.estado === 'configurada').length,
    pendientes: enfermeras.filter((e) => e.estado === 'pendiente').length,
  }), [turnos, enfermeras]);

  const enfermerasPreview = enfermeras.slice(0, PREVIEW_ENFERMERAS);

  function handleCloseModal() {
    setModal(null);
  }

  function handleSubmitNuevoTurno(datos) {
    if (modal?.turno) {
      setTurnos((prev) => prev.map((t) => (t.id === modal.turno.id ? { ...t, ...datos } : t)));
      window.ncToast?.(`Turno ${datos.nombre} actualizado.`);
    } else {
      const nuevo = { id: `TUR-${Date.now()}`, ...datos };
      setTurnos((prev) => [...prev, nuevo]);
      window.ncToast?.(`Turno ${datos.nombre} creado.`);
    }
    setModal(null);
  }

  function handleToggleEstado(turno) {
    const nuevoEstado = turno.estado === 'activo' ? 'inactivo' : 'activo';
    setTurnos((prev) => prev.map((t) => (t.id === turno.id ? { ...t, estado: nuevoEstado } : t)));
    window.ncToast?.(`Turno ${turno.nombre} ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}.`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de turnos', href: '/gestion-turnos' }]}
          page="Resumen"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <GestionTurnosSidebar />

          <div className="ct-page-body">
            <div className="ct-page-header">
              <div>
                <h1>Gestión de turnos</h1>
                <p>Define los tipos de turno y los turnos permitidos para el personal de enfermería.</p>
              </div>
            </div>

            <div className="ct-kpi-row">
              <KpiCard icon={LuCalendarClock} label="Tipos de turno" value={kpis.tiposActivos} description="Activos" variant="neutral" />
              <KpiCard icon={LuUsers} label="Personal de enfermería" value={kpis.totalEnfermeras} description="Total registradas" variant="neutral" />
              <KpiCard icon={LuUserCheck} label="Configuradas" value={kpis.configuradas} description="Con turnos permitidos" variant="success" />
              <KpiCard icon={LuCircleDashed} label="Pendientes" value={kpis.pendientes} description="Sin configuración" variant="warning" />
            </div>

            <div className="ct-blocks-row">



              
              <div className="card">
                <div className="ct-block-header">
                  <div>
                    <h2>Tipos de turno</h2>
                    <p>Turnos disponibles para la programación.</p>
                  </div>
                  <Button icon={LuPlus} size="sm" onClick={() => setModal({ type: 'nuevo-turno' })}>Nuevo turno</Button>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Turno</th>
                        <th>Horario</th>
                        <th>Duración</th>
                        <th>Estado</th>
                        <th aria-hidden="true" />
                      </tr>
                    </thead>
                    <tbody>
                      {turnos.map((t) => (
                        <tr key={t.id}>
                          <td className="cell-primary">{t.nombre}</td>
                          <td>{t.horaInicio} – {t.horaFin}</td>
                          <td className="cell-muted">{duracionHoras(t.horaInicio, t.horaFin)} horas</td>
                          <td><EstadoTurnoBadge estado={t.estado} /></td>
                          <td className="col-acciones">
                            <TurnoRowActionsMenu
                              turno={t}
                              onEditar={(turno) => setModal({ type: 'nuevo-turno', turno })}
                              onToggleEstado={handleToggleEstado}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="ct-block-header">
                  <div>
                    <h2>Configuración del personal</h2>
                    <p>Consulta y configura los turnos permitidos para cada enfermera.</p>
                  </div>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Enfermera</th>
                        <th>Área</th>
                        <th>Turnos permitidos</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermerasPreview.map((e) => (
                        <tr key={e.id}>
                          <td className="cell-primary">{e.nombre}</td>
                          <td>{e.areaLabel}</td>
                          <td>
                            {e.turnosPermitidos.length === 0 ? (
                              <span className="cell-muted">—</span>
                            ) : (
                              <div className="ct-turnos-cell">
                                {e.turnosPermitidos.map((tId) => (
                                  <TurnoBadge key={tId} turnoId={tId} label={TURNO_LABEL[tId]} />
                                ))}
                              </div>
                            )}
                          </td>
                          <td><EstadoConfigBadge estado={e.estado} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="ct-preview-footer">
                  <Link href="/gestion-turnos/enfermeras">Ver todas las enfermeras ({kpis.totalEnfermeras})</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(modal?.type === 'nuevo-turno') && (
        <NuevoTurnoModal
          turno={modal.turno}
          onClose={handleCloseModal}
          onSubmit={handleSubmitNuevoTurno}
        />
      )}
    </div>
  );
}
