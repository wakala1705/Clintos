'use client';

import { useEffect, useState } from 'react';
import './ConfiguracionEnfermeraModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { EstadoConfigBadge } from '../TurnoBadges/TurnoBadges';
import { estadoConfiguracion } from '@/hooks/GestionTurnos/mockEnfermerasData';
import { LuUserRoundCog } from 'react-icons/lu';

// Modal "Configuración de <enfermera>" (antes drawer lateral — encargo:
// unificarlo al patrón de modal centrado del resto del módulo, ver
// AgregarEnfermeraModal.jsx). Mismo scaffolding compartido
// .modal-overlay/.modal-card/.modal-body/.modal-footer de GestionTurnos.css.
// Solo turnos ACTIVOS son seleccionables (un turno desactivado en Tipos de
// turno no puede asignarse a nadie mientras siga inactivo) — mismo criterio
// de no ofrecer una opción que no tiene efecto real en ningún otro punto
// del módulo.
export default function ConfiguracionEnfermeraModal({
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
    <div className="modal-overlay open">
      <div className="modal-card cem-modal-card" role="dialog" aria-modal="true" aria-labelledby="cem-modal-title">
        <ModalHeader
          icon={LuUserRoundCog}
          title={`Configuración de ${enfermera.nombre}`}
          titleId="cem-modal-title"
          subtitle={`${enfermera.cargo} · ${enfermera.areaLabel}`}
          onClose={onClose}
          closeLabel="Cerrar configuración"
        />

        <div className="modal-body">
          <div className="cem-block">
            <h4 className="cem-block-title">Turnos permitidos</h4>
            <div className="cem-turnos-list">
              {tiposTurno.map((t) => {
                const disabled = t.estado !== 'activo';
                const checked = seleccion.has(t.id);
                return (
                  <label key={t.id} className={`cem-turno-option${disabled ? ' disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleTurno(t.id)}
                    />
                    <span className="cem-turno-info">
                      <span className="cem-turno-nombre">{t.nombre}</span>
                      <span className="cem-turno-horario">{t.horaInicio} – {t.horaFin}{disabled ? ' · Turno inactivo' : ''}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="cem-block">
            <h4 className="cem-block-title">Estado</h4>
            <EstadoConfigBadge estado={estadoPrevisto} />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar}>Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}
