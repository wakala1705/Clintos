'use client';

import { useEffect, useState } from 'react';
import './ConfiguracionEnfermeraDrawer.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { EstadoConfigBadge } from '../TurnoBadges/TurnoBadges';
import { estadoConfiguracion } from '@/hooks/GestionTurnos/mockEnfermerasData';
import { LuUserRoundCog } from 'react-icons/lu';

// Drawer lateral derecho "Configuración de <enfermera>" (encargo sección 5)
// — mismo patrón overlay+aside que AlertDetailDrawer.jsx (ModalHeader,
// cierre por X/backdrop/Escape). Solo turnos ACTIVOS son seleccionables
// (un turno desactivado en Tipos de turno no puede asignarse a nadie
// mientras siga inactivo) — mismo criterio de no ofrecer una opción que no
// tiene efecto real en ningún otro punto del módulo.
export default function ConfiguracionEnfermeraDrawer({
  enfermera, tiposTurno, onClose, onGuardar,
}) {
  const [seleccion, setSeleccion] = useState(() => new Set(enfermera.turnosPermitidos));

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function toggleTurno(turnoId) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(turnoId)) next.delete(turnoId); else next.add(turnoId);
      return next;
    });
  }

  function handleGuardar() {
    const turnosPermitidos = tiposTurno.filter((t) => seleccion.has(t.id)).map((t) => t.id);
    onGuardar(enfermera.id, turnosPermitidos);
  }

  const estadoPrevisto = estadoConfiguracion([...seleccion]);

  return (
    <div className="ced-overlay" onClick={onClose}>
      <aside className="ced-panel" onClick={(e) => e.stopPropagation()} aria-label={`Configuración de ${enfermera.nombre}`}>
        <ModalHeader
          icon={LuUserRoundCog}
          title={`Configuración de ${enfermera.nombre}`}
          subtitle={`${enfermera.cargo} · ${enfermera.areaLabel}`}
          onClose={onClose}
          closeLabel="Cerrar panel de configuración"
        />

        <div className="ced-body">
          <div className="ced-block">
            <h4 className="ced-block-title">Turnos permitidos</h4>
            <div className="ced-turnos-list">
              {tiposTurno.map((t) => {
                const disabled = t.estado !== 'activo';
                const checked = seleccion.has(t.id);
                return (
                  <label key={t.id} className={`ced-turno-option${disabled ? ' disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleTurno(t.id)}
                    />
                    <span className="ced-turno-info">
                      <span className="ced-turno-nombre">{t.nombre}</span>
                      <span className="ced-turno-horario">{t.horaInicio} – {t.horaFin}{disabled ? ' · Turno inactivo' : ''}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="ced-block">
            <h4 className="ced-block-title">Estado</h4>
            <EstadoConfigBadge estado={estadoPrevisto} />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar}>Guardar cambios</Button>
        </div>
      </aside>
    </div>
  );
}
