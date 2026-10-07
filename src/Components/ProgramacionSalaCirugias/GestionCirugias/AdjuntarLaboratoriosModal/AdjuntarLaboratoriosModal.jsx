'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LuFlaskConical } from 'react-icons/lu';
import './AdjuntarLaboratoriosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { getEvapreRegistros } from '@/hooks/HistoriaClinica/mockEvapreRegistros';
import { CAMPOS_LABORATORIO_EVAPRE } from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';
import { datosLaboratorioDesdeEvapre, resultadosDeEvapre } from '@/hooks/ProgramacionSalaCirugias/gestion/laboratorios';

// Modal de "Adjuntar resultados" del paso Laboratorios (Gestión de cirugías,
// simulado): los resultados ya están registrados en la sección Laboratorios de
// la evaluación preanestésica (EVAPRE) del paciente, así que no se cargan a
// mano -- se muestran tal cual y "Adjuntar resultados" los pasa al chequeo.
// Con más de una EVAPRE se elige de cuál; con una sola va preseleccionada.
export default function AdjuntarLaboratoriosModal({ solicitud, onClose, onAdjuntar }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const registros = useMemo(
    () => getEvapreRegistros(solicitud.paciente.numeroDocumento),
    [solicitud.paciente.numeroDocumento],
  );
  const [selectedId, setSelectedId] = useState(registros[0]?.id ?? '');
  const registro = registros.find((r) => r.id === selectedId) ?? null;
  const resultados = registro ? resultadosDeEvapre(registro, CAMPOS_LABORATORIO_EVAPRE) : [];
  const datos = registro ? datosLaboratorioDesdeEvapre(registro, CAMPOS_LABORATORIO_EVAPRE) : null;

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const opciones = registros.map((r) => ({ value: r.id, label: `EVAPRE N° ${r.numero} · ${r.fecha} · ${r.hora}` }));

  return (
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card alm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alm-title"
      >
        <ModalHeader
          icon={LuFlaskConical}
          tone="primary"
          title="Adjuntar resultados de laboratorio"
          titleId="alm-title"
          subtitle={solicitud.paciente.nombre}
          onClose={onClose}
          closeLabel="Cerrar adjuntar resultados"
        />

        <div className="modal-body alm-body">
          {registros.length === 0 ? (
            <div className="alm-empty" role="status">
              <p className="alm-empty-title">Este paciente no tiene resultados de laboratorio registrados</p>
              <p className="alm-empty-sub">
                Los resultados se toman de la evaluación preanestésica (EVAPRE). Diligénciala en Historia clínica de Hospitalización y vuelve a intentarlo.
              </p>
            </div>
          ) : (
            <>
              <p className="alm-help">
                Estos resultados ya están registrados en la evaluación preanestésica del paciente. Al adjuntarlos
                quedan asociados a esta solicitud.
              </p>

              {registros.length > 1 ? (
                <div className="form-field">
                  <label htmlFor="alm-evapre">Evaluación preanestésica</label>
                  <FormSelect id="alm-evapre" value={selectedId} onChange={setSelectedId} options={opciones} />
                </div>
              ) : (
                <p className="alm-fuente">
                  <span className="alm-fuente-label">Fuente</span>
                  EVAPRE N° {registro.numero} · {registro.fecha} · {registro.hora} · {registro.autor}
                </p>
              )}

              {resultados.length === 0 ? (
                <p className="alm-aviso" role="status">Esta EVAPRE no trae resultados de laboratorio.</p>
              ) : (
                <div className="alm-table-wrap">
                  <table className="alm-table">
                    <thead>
                      <tr>
                        <th scope="col">Prueba</th>
                        <th scope="col">Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.map((r) => (
                        <tr key={r.key}>
                          <th scope="row">{r.label}</th>
                          <td className="alm-valor">{r.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" disabled={!datos} onClick={() => onAdjuntar(datos)}>Adjuntar resultados</Button>
        </div>
      </div>
    </div>
  );
}
