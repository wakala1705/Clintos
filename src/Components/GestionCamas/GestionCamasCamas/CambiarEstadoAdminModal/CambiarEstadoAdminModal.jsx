'use client';

import { useState } from 'react';
import './CambiarEstadoAdminModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import EstadoAdminBadge from '../EstadoAdminBadge/EstadoAdminBadge';
import {
  ESTADO_LABEL, REQUIERE_MOTIVO, TRANSICIONES_PERMITIDAS,
} from '@/hooks/GestionCamas/mockCamasAdminData';
import { LuBedDouble } from 'react-icons/lu';

// Cubre a la vez "Cambiar estado" (sección 9, select genérico entre las
// transiciones permitidas) y "Activar/Desactivar" (sección 13, confirmación
// con motivo obligatorio al desactivar) — un solo modal en vez de 2, porque
// desactivar/activar ES un cambio de estado más (a Habilitada o afuera de
// ella), no una acción de otra naturaleza. El texto de advertencia y el CTA
// se adaptan según el destino elegido (ver `motivoRequerido`/`ctaLabel`
// abajo) para que, cuando el destino sea justamente "desactivar" desde
// Habilitada, se lea igual que el mockup de la sección 13.
export default function CambiarEstadoAdminModal({
  cama, onClose, onConfirm,
}) {
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivo, setMotivo] = useState('');

  if (!cama) return null;

  const opciones = TRANSICIONES_PERMITIDAS[cama.estado].map((estado) => ({ value: estado, label: ESTADO_LABEL[estado] }));
  const motivoRequerido = nuevoEstado !== '' && REQUIERE_MOTIVO(nuevoEstado);
  const esDesactivacion = cama.estado === 'habilitada' && motivoRequerido;
  const esActivacion = nuevoEstado === 'habilitada';
  const puedeConfirmar = nuevoEstado !== '' && (!motivoRequerido || motivo.trim() !== '');

  let ctaLabel = 'Cambiar estado';
  if (esDesactivacion) ctaLabel = 'Desactivar cama';
  else if (esActivacion) ctaLabel = 'Activar cama';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(cama.id, nuevoEstado, motivoRequerido ? motivo.trim() : undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card cba-modal-card" role="dialog" aria-modal="true" aria-labelledby="cba-cambiar-estado-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuBedDouble}
            tone={esDesactivacion ? 'warning' : 'primary'}
            title="Cambiar estado de cama"
            titleId="cba-cambiar-estado-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama</label>
              <div className="tf-readonly-value">{cama.codigo} — {cama.habitacionCodigo}</div>
            </div>

            <div className="form-field">
              <label>Estado actual</label>
              <div className="tf-readonly-value"><EstadoAdminBadge estado={cama.estado} /></div>
            </div>

            <div className="form-field">
              <label htmlFor="cba-nuevo-estado">Nuevo estado</label>
              <FormSelect
                id="cba-nuevo-estado"
                value={nuevoEstado}
                onChange={setNuevoEstado}
                placeholder="Selecciona el nuevo estado"
                options={opciones}
              />
            </div>

            {esDesactivacion && (
              <p className="cba-cambiar-estado-warning">
                ¿Deseas desactivar la cama {cama.codigo}? La cama dejará de estar disponible para nuevas asignaciones.
              </p>
            )}

            {motivoRequerido && (
              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="cba-motivo">Motivo</label>
                  <span className="required-pill">Requerido</span>
                </div>
                <textarea
                  id="cba-motivo"
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
            <button type="submit" className={`btn ${esDesactivacion ? 'btn-danger' : 'btn-primary'}`} disabled={!puedeConfirmar}>{ctaLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
