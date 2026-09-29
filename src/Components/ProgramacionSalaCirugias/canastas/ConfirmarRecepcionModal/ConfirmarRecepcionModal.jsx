'use client';

import { useRef, useState } from 'react';
import { LuPackageCheck } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import './ConfirmarRecepcionModal.css';

// Detalle de recepción (encargo explícito, 2026-09-29, referencia visual
// adjunta): resumen de la cirugía (paciente, procedimiento, horario,
// cirujano, farmacia) + checklist de los insumos SOLICITADOS de la canasta
// antes de confirmar -- versión acotada de esa referencia, sin cantidad
// recibida editable ni columna de novedad (esos datos no existen en
// `canasta.items`, ver resumenCanasta en mockCirugiaData.js) y sin el aviso
// "Inicio bloqueado" (regla de negocio nueva, fuera de este alcance -- ver
// respuesta al análisis del mockup completo). El badge de estado usa
// "Pendiente de recepción"/tone warn, mismo texto y color que ya usa esta
// pantalla en la tabla/KPIs -- no el "Despachada · por recibir" de la
// referencia, para no introducir una segunda etiqueta para el mismo estado.
// "Confirmar recepción" sigue moviendo TODA la canasta de 'solicitado' a
// 'entregado' de una vez (registrarEntregaInsumos, sin tocar) -- el
// checklist es una revisión antes de esa acción, no cambia lo que se guarda.
export default function ConfirmarRecepcionModal({ cirugia, onConfirmar, onClose }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  const pendientes = cirugia.canasta.items.filter((i) => i.solicitudFarmacia === 'solicitado');
  const [verificados, setVerificados] = useState(() => new Set());
  const todosVerificados = pendientes.length > 0 && verificados.size === pendientes.length;

  function toggle(nombre) {
    setVerificados((prev) => {
      const next = new Set(prev);
      if (next.has(nombre)) next.delete(nombre);
      else next.add(nombre);
      return next;
    });
  }

  function handleMarcarTodos() {
    setVerificados(todosVerificados ? new Set() : new Set(pendientes.map((i) => i.nombre)));
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose();
  }

  // Hora de farmacia extraída de fechaSolicitud (ISO "YYYY-MM-DDTHH:mm",
  // mismo criterio de split que fechaHoraLabel en mockCirugiaData.js) -- no
  // hay un timestamp de "despachado" separado en el modelo, así que se
  // etiqueta como lo que realmente es.
  const horaFarmacia = cirugia.farmacia?.fechaSolicitud?.split('T')[1];

  return (
    <div className="modal-overlay open" onKeyDown={handleKeyDown}>
      <div ref={cardRef} className="modal-card crm-modal-card" role="dialog" aria-modal="true" aria-labelledby="crm-title">
        <ModalHeader
          icon={LuPackageCheck}
          tone="primary"
          title="Confirmar recepción"
          titleId="crm-title"
          onClose={onClose}
        />
        <div className="modal-body crm-body">
          <div className="crm-resumen">
            <div className="crm-resumen-header">
              <div>
                <span className="crm-resumen-nombre">{cirugia.paciente.nombre}</span>
                <span className="crm-resumen-meta">{cirugia.paciente.documento} · {cirugia.paciente.edad} años</span>
              </div>
              <div className="crm-resumen-header-right">
                <span className="crm-resumen-pedido">Pedido {cirugia.farmacia?.numeroPedido ?? '—'}</span>
                <Badge tone="warn">Pendiente de recepción</Badge>
              </div>
            </div>
            <div className="crm-resumen-grid">
              <div>
                <span className="crm-resumen-label">Procedimiento</span>
                <span className="crm-resumen-value">{cirugia.procedimientoPrincipal}</span>
              </div>
              <div>
                <span className="crm-resumen-label">Horario</span>
                <span className="crm-resumen-value">{cirugia.horaInicio} – {cirugia.horaFin}</span>
              </div>
              <div>
                <span className="crm-resumen-label">Cirujano</span>
                <span className="crm-resumen-value">{cirugia.cirujano}</span>
              </div>
              <div>
                <span className="crm-resumen-label">Farmacia</span>
                <span className="crm-resumen-value">{horaFarmacia ? `Solicitada ${horaFarmacia}` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th className="crm-col-ok">OK</th>
                  <th>Insumo</th>
                  <th className="crm-num">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((item) => (
                  <tr key={item.nombre}>
                    <td className="crm-col-ok">
                      <input
                        type="checkbox"
                        checked={verificados.has(item.nombre)}
                        onChange={() => toggle(item.nombre)}
                        aria-label={`Verificar ${item.nombre}`}
                      />
                    </td>
                    <td className="cell-primary">{item.nombre}</td>
                    <td className="crm-num">{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer crm-footer">
          <span className="crm-contador">{verificados.size} de {pendientes.length} insumos verificados</span>
          <div className="crm-acciones">
            <Button variant="secondary" onClick={handleMarcarTodos}>
              {todosVerificados ? 'Desmarcar todos' : 'Marcar todos'}
            </Button>
            <Button icon={LuPackageCheck} disabled={!todosVerificados} onClick={onConfirmar}>
              Confirmar recepción
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
