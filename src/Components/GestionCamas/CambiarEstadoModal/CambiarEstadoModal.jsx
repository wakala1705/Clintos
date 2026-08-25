'use client';

import { useState } from 'react';
import './CambiarEstadoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import {
  AREA_LABEL, ESTADOS_CRITICOS, ESTADO_LABEL, PISO_LABEL, SECTOR_LABEL, SEDE_LABEL, TRANSICIONES_PERMITIDAS,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuBedDouble } from 'react-icons/lu';

// "Cambiar estado" — el select de destino solo ofrece
// TRANSICIONES_PERMITIDAS[cama.estado] (stand-in local de "el frontend le
// pregunta al backend qué transiciones están permitidas desde acá", ver
// mockCamasData.js). Motivo se vuelve obligatorio solo si el estado elegido
// está en ESTADOS_CRITICOS (hoy: Bloqueada/Mantenimiento — placeholder
// pendiente de confirmación de negocio, mismo criterio que el doc fuente).
// `presetEstado` preselecciona el destino cuando se llega desde una acción
// puntual del menú "⋯" (ej. "Bloquear"/"Mantenimiento", ver
// BedActionsMenu/GestionCamas.jsx) — el usuario igual puede cambiarlo,
// sigue siendo el mismo modal genérico, no uno nuevo por acción.
export default function CambiarEstadoModal({
  cama, presetEstado, onClose, onConfirm,
}) {
  const [nuevoEstado, setNuevoEstado] = useState(presetEstado ?? '');
  const [motivo, setMotivo] = useState('');

  // `|| []`: Aislamiento/Inactiva no tienen entrada en TRANSICIONES_PERMITIDAS
  // (mockCamasData.js) — hoy ningún trigger real abre este modal desde esos 2
  // estados (MENU_ACCIONES/CTA_PRINCIPAL tampoco los tienen), pero sin el
  // fallback un futuro trigger rompería el modal en vez de mostrar 0 opciones.
  const opciones = (TRANSICIONES_PERMITIDAS[cama.estado] || []).map((estado) => ({ value: estado, label: ESTADO_LABEL[estado] }));
  const motivoRequerido = nuevoEstado !== '' && ESTADOS_CRITICOS.includes(nuevoEstado);
  const puedeConfirmar = nuevoEstado !== '' && (!motivoRequerido || motivo.trim() !== '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(cama.id, nuevoEstado, motivoRequerido ? motivo.trim() : undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card cb-modal-card" role="dialog" aria-modal="true" aria-labelledby="cambiar-estado-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuBedDouble}
            tone="primary"
            title="Cambiar estado de cama"
            titleId="cambiar-estado-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama</label>
              <div className="tf-readonly-value">
                {cama.numero} — {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
              </div>
            </div>

            <div className="form-field">
              <label>Estado actual</label>
              <div className="tf-readonly-value"><EstadoCamaBadge estado={cama.estado} /></div>
            </div>

            <div className="form-field">
              <label htmlFor="cb-nuevo-estado">Nuevo estado</label>
              <FormSelect
                id="cb-nuevo-estado"
                value={nuevoEstado}
                onChange={setNuevoEstado}
                placeholder="Selecciona el nuevo estado"
                options={opciones}
              />
            </div>

            {motivoRequerido && (
              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="cb-motivo">Motivo</label>
                  <span className="required-pill">Requerido</span>
                </div>
                <textarea
                  id="cb-motivo"
                  rows="2"
                  placeholder="Describe brevemente el motivo del cambio..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Cambiar estado</button>
          </div>
        </form>
      </div>
    </div>
  );
}
