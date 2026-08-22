'use client';

import { useState } from 'react';
import './CatalogoDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  LuBedDouble, LuBell, LuClipboardList, LuListChecks, LuSettings2, LuShieldCheck, LuTimer, LuWrench,
} from 'react-icons/lu';

const ICONS = {
  LuBedDouble, LuListChecks, LuClipboardList, LuWrench, LuShieldCheck, LuSettings2, LuTimer, LuBell,
};

// "Entrar al catálogo" (encargo, sección 4) — acá se consulta y, para
// Reglas de validación, se activa/desactiva con confirmación inline cuando
// la regla es crítica (sección 9: "No permitir modificar reglas críticas
// sin confirmación"). El resto de catálogos (tipos/estados/motivos/
// parámetros/tiempos/notificaciones) no tienen un CRUD completo modelado en
// este prototipo — "Editar catálogo" dispara el mismo aviso "en desarrollo"
// que el resto de accesos sin pantalla propia del proyecto (ver
// GestionCamasSidebar.jsx), en vez de fabricar un formulario sin respaldo.
export default function CatalogoDetailModal({
  catalogo, onClose, onToggleRegla, onAccionNoDisponible, puedeEditar,
}) {
  const [confirmandoIdx, setConfirmandoIdx] = useState(null);
  if (!catalogo) return null;

  const Icon = ICONS[catalogo.icon];
  const esReglas = catalogo.id === 'reglas-validacion';

  function handleToggleClick(idx, item) {
    if (item.critico && item.activa) {
      setConfirmandoIdx(idx);
      return;
    }
    onToggleRegla(idx);
  }
  function handleConfirmarDesactivar(idx) {
    setConfirmandoIdx(null);
    onToggleRegla(idx);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="cbc-cat-title">
        <ModalHeader
          icon={Icon}
          tone="primary"
          title={catalogo.nombre}
          titleId="cbc-cat-title"
          subtitle={`${catalogo.cantidad} ${catalogo.unidad}`}
          onClose={onClose}
        />
        <div className="modal-body">
          <p className="cbc-det-desc">{catalogo.descripcion}</p>

          <div className="cbc-det-list">
            {esReglas ? catalogo.ejemplos.map((item, idx) => (
              <div className="cbc-det-item" key={item.texto}>
                {confirmandoIdx === idx ? (
                  <div className="cbc-det-confirm">
                    <span>¿Desactivar esta regla crítica?</span>
                    <div className="cbc-det-confirm-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmandoIdx(null)}>Cancelar</button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleConfirmarDesactivar(idx)}>Confirmar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="cbc-det-item-texto">{item.texto}</span>
                    {item.critico && <span className="cbc-det-item-critica">Crítica</span>}
                    <button
                      type="button"
                      className={`cbc-det-toggle${item.activa ? ' on' : ''}`}
                      role="switch"
                      aria-checked={item.activa}
                      aria-label={`${item.activa ? 'Desactivar' : 'Activar'} regla: ${item.texto}`}
                      onClick={() => handleToggleClick(idx, item)}
                    />
                  </>
                )}
              </div>
            )) : catalogo.ejemplos.map((texto) => (
              <div className="cbc-det-item" key={texto}>
                <span className="cbc-det-item-texto">{texto}</span>
                {puedeEditar && !catalogo.soloLectura && (
                  <button type="button" className="cbc-det-item-edit" onClick={() => onAccionNoDisponible(`Editar "${texto}"`)}>
                    Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {puedeEditar && !catalogo.soloLectura && (
            <button type="button" className="btn btn-primary" onClick={() => onAccionNoDisponible(`Editar catálogo "${catalogo.nombre}"`)}>
              Editar catálogo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
