'use client';

import { useState } from 'react';
import './ResolverAlertaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ICONOS_ALERTA } from '../../AlertBadges/AlertBadges';
import { AHORA_LABEL, TIPO_ALERTA_CONFIG } from '@/hooks/GestionEnfermeria/mockAlertasData';

// Flujo de resolución (encargo sección 11: "Al seleccionar 'Administrar
// medicamento', abrir el flujo correspondiente... y actualizar la alerta a
// Resuelta") — un único modal liviano reutilizado por los 6 tipos de alerta
// con acción primaria (ver TIPOS_ALERTA), en vez de 6 modales bespoke: la
// acción real (registrar hora + observación) es la misma forma para todos,
// solo cambian el título/ícono/copy según `accion` del tipo. Deliberadamente
// NO reutiliza el AdminModal.jsx existente (Gestión de medicamentos): ese
// modal está acoplado a datos de lotes/insumos de un cronograma real vía
// legacy-app.js, plomería que no aporta acá.
export default function ResolverAlertaModal({ alerta, onClose, onConfirm }) {
  const [hora, setHora] = useState(AHORA_LABEL);
  const [observaciones, setObservaciones] = useState('');

  const tipoCfg = TIPO_ALERTA_CONFIG[alerta.tipo];
  const accion = tipoCfg.accion;
  const Icon = ICONOS_ALERTA[accion.icon];

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(alerta.id, { hora, observaciones });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="resolver-alerta-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={Icon}
            tone="primary"
            title={accion.label}
            titleId="resolver-alerta-title"
            subtitle={alerta.detalle}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="ram-summary">
              <span className="k">Paciente</span>
              <span className="v">{alerta.paciente ?? 'Sin paciente asignado'} · Cama {alerta.cama}</span>
            </div>
            <div className="form-field">
              <label htmlFor="resolver-hora">Hora de registro</label>
              <input id="resolver-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required autoFocus />
            </div>
            <div className="form-field">
              <label htmlFor="resolver-observaciones">Observaciones (opcional)</label>
              <textarea
                id="resolver-observaciones"
                rows="3"
                placeholder="Ej. Sin novedades durante el procedimiento..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Confirmar y resolver</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
