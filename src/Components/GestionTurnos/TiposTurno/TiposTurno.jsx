'use client';

import { useEffect, useState } from 'react';
import '../GestionTurnos.css';
import './TiposTurno.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import GestionTurnosSidebar from '../GestionTurnosSidebar/GestionTurnosSidebar';
import NuevoTurnoModal from '../NuevoTurnoModal/NuevoTurnoModal';
import TurnoRowActionsMenu from '../TurnoRowActionsMenu/TurnoRowActionsMenu';
import { EstadoTurnoBadge } from '../TurnoBadges/TurnoBadges';
import { TIPOS_TURNO_INICIALES, duracionHoras } from '@/hooks/GestionTurnos/mockTurnosData';
import { LuPlus } from 'react-icons/lu';

// Página dedicada "Tipos de turno" (encargo sección 3) — mismo estado local
// mutable que TiposTurno usa en el bloque de Resumen (GestionTurnos.jsx),
// pero cada página mantiene su propia copia (sin store global entre rutas,
// mismo criterio que GestionCamas/GestionCamasReservas).
export default function TiposTurno() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [turnos, setTurnos] = useState(TIPOS_TURNO_INICIALES);
  const [modal, setModal] = useState(null);

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
          page="Tipos de turno"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <GestionTurnosSidebar />

          <div className="ct-page-body">
            <div className="ct-page-header">
              <div>
                <h1>Tipos de turno</h1>
                <p>Define los turnos disponibles para la programación del personal.</p>
              </div>
              <Button icon={LuPlus} onClick={() => setModal({ type: 'nuevo-turno' })}>Nuevo turno</Button>
            </div>

            <div className="card">
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
