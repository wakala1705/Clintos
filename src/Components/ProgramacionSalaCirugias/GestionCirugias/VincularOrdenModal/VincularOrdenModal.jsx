'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LuFileText } from 'react-icons/lu';
import './VincularOrdenModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { getOrdenesPropias } from '@/hooks/HistoriaClinica/mockOrdenesMedicas';
import { capitalizarNombre, enmascararDocumento } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import {
  datosOrdenDesdeHc, incluyeCirugia, resumenOrden, serviciosDeOrden,
} from '@/hooks/ProgramacionSalaCirugias/gestion/ordenMedica';

// Modal de "Vincular orden médica" del paso Orden (Gestión de cirugías,
// simulado). Mismo patrón que VincularResultadosModal / VincularEvapreModal:
// se listan las órdenes que el paciente ya tiene en el submódulo Órdenes
// médicas de Historia clínica y se elige cuál vincular a la solicitud. Al
// elegir una fila se previsualizan sus servicios (hace de "ver detalle", las
// órdenes de HC no tienen PDF); elegir = clic en la fila (doble clic o Enter
// sobre la ya elegida la vincula).
export default function VincularOrdenModal({ solicitud, onClose, onVincular }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const { paciente } = solicitud;
  const ordenes = useMemo(() => getOrdenesPropias(paciente.numeroDocumento), [paciente.numeroDocumento]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = ordenes.find((o) => o.id === selectedId) ?? null;
  const servicios = selected ? serviciosDeOrden(selected) : [];

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function vincular(orden) {
    onVincular(datosOrdenDesdeHc(orden));
  }

  return (
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card aom-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aom-title"
      >
        <ModalHeader
          icon={LuFileText}
          tone="primary"
          title="Vincular orden médica"
          titleId="aom-title"
          subtitle={`${paciente.nombre} · ${enmascararDocumento(paciente.tipoDocumento, paciente.numeroDocumento)}`}
          onClose={onClose}
          closeLabel="Cerrar vinculación de orden médica"
        />

        <div className="modal-body aom-body">
          {ordenes.length === 0 ? (
            <div className="aom-empty" role="status">
              <p className="aom-empty-title">Este paciente no tiene órdenes médicas</p>
              <p className="aom-empty-sub">
                La orden se toma del submódulo Órdenes médicas de Historia clínica. Cuando exista una, vuelve a intentarlo.
              </p>
            </div>
          ) : (
            <>
              <p className="aom-help">Selecciona la orden médica que respalda esta solicitud.</p>

              <div className="aom-table-wrap aom-lista">
                <table className="aom-table">
                  <thead>
                    <tr>
                      <th scope="col">N° orden</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Profesional</th>
                      <th scope="col">Especialidad</th>
                      <th scope="col">Servicios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((o) => {
                      const isSelected = o.id === selectedId;
                      return (
                        <tr
                          key={o.id}
                          className={isSelected ? 'selected' : undefined}
                          aria-selected={isSelected}
                          tabIndex={0}
                          onClick={() => setSelectedId(o.id)}
                          onDoubleClick={() => vincular(o)}
                          onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            e.preventDefault();
                            if (isSelected) vincular(o);
                            else setSelectedId(o.id);
                          }}
                        >
                          <td className="aom-nowrap">{o.numero}</td>
                          <td className="aom-nowrap">{o.fecha} - {o.hora}</td>
                          <td>{capitalizarNombre(o.autor)}</td>
                          <td>{capitalizarNombre(o.especialidad)}</td>
                          <td>
                            <span className="aom-servicios">
                              {resumenOrden(o) || '—'}
                              {incluyeCirugia(o) && <Badge tone="info">Incluye cirugía</Badge>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selected && (
                <section className="aom-preview" aria-label={`Servicios de la orden N° ${selected.numero}`} role="status">
                  <h4 className="aom-preview-titulo">Servicios de la orden N° {selected.numero}</h4>
                  <div className="aom-table-wrap aom-servicios-lista">
                    <table className="aom-table">
                      <thead>
                        <tr>
                          <th scope="col">Tipo</th>
                          <th scope="col">Descripción</th>
                          <th scope="col" className="aom-col-cant">Cant.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicios.map((s) => (
                          <tr key={s.id}>
                            <td className="aom-nowrap">{s.tipo}</td>
                            <td className="aom-desc">{s.descripcion}</td>
                            <td className="aom-col-cant">{s.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          {ordenes.length === 0 ? (
            <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="button" disabled={!selected} onClick={() => vincular(selected)}>Vincular orden</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
