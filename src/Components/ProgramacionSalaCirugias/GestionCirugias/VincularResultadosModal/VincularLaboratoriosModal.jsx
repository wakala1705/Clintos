'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LuEye, LuFlaskConical } from 'react-icons/lu';
import './AdjuntarLaboratoriosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { getEvapreRegistros } from '@/hooks/HistoriaClinica/mockEvapreRegistros';
import { CAMPOS_LABORATORIO_EVAPRE } from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';
import { datosLaboratorioDesdeEvapre, resultadosDeEvapre } from '@/hooks/ProgramacionSalaCirugias/gestion/laboratorios';

// Modal de "Adjuntar resultados" del paso Laboratorios (Gestión de cirugías,
// simulado). Mismo patrón que VincularEvapreModal: se listan las EVAPRE del
// paciente y se elige de cuál tomar los resultados de laboratorio (están en la
// sección Laboratorios de la evaluación, no se cargan a mano). Al elegir una
// fila se previsualizan sus resultados; "Adjuntar resultados" los pasa al
// chequeo. Elegir = clic en la fila (doble clic o Enter sobre la ya elegida la
// adjunta).
export default function AdjuntarLaboratoriosModal({ solicitud, onClose, onAdjuntar }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const registros = useMemo(
    () => getEvapreRegistros(solicitud.paciente.numeroDocumento),
    [solicitud.paciente.numeroDocumento],
  );
  // Cantidad de resultados por EVAPRE (0 = no se puede elegir).
  const conteos = useMemo(
    () => Object.fromEntries(registros.map((r) => [r.id, resultadosDeEvapre(r, CAMPOS_LABORATORIO_EVAPRE).length])),
    [registros],
  );
  const [selectedId, setSelectedId] = useState(null);
  const [verPdf, setVerPdf] = useState(null);
  const selected = registros.find((r) => r.id === selectedId) ?? null;
  const resultados = selected ? resultadosDeEvapre(selected, CAMPOS_LABORATORIO_EVAPRE) : [];
  const datos = selected ? datosLaboratorioDesdeEvapre(selected, CAMPOS_LABORATORIO_EVAPRE) : null;

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function adjuntar(registro) {
    const d = datosLaboratorioDesdeEvapre(registro, CAMPOS_LABORATORIO_EVAPRE);
    if (d) onAdjuntar(d);
  }

  return (
    <>
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
                Selecciona la EVAPRE de la que tomar los resultados de laboratorio. Al adjuntarlos quedan asociados a esta solicitud.
              </p>

              <div className="alm-table-wrap alm-lista">
                <table className="alm-table">
                  <thead>
                    <tr>
                      <th scope="col">N° registro</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Anestesiólogo</th>
                      <th scope="col">Laboratorios</th>
                      <th scope="col" className="alm-col-acciones">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r) => {
                      const total = conteos[r.id];
                      const sinResultados = total === 0;
                      const isSelected = r.id === selectedId;
                      return (
                        <tr
                          key={r.id}
                          className={[isSelected && 'selected', sinResultados && 'alm-sin'].filter(Boolean).join(' ') || undefined}
                          aria-selected={isSelected}
                          aria-disabled={sinResultados || undefined}
                          tabIndex={sinResultados ? -1 : 0}
                          onClick={() => { if (!sinResultados) setSelectedId(r.id); }}
                          onDoubleClick={() => { if (!sinResultados) adjuntar(r); }}
                          onKeyDown={(e) => {
                            if (sinResultados || e.target !== e.currentTarget) return;
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            e.preventDefault();
                            if (isSelected) adjuntar(r);
                            else setSelectedId(r.id);
                          }}
                        >
                          <td className="alm-nowrap">{r.numero}</td>
                          <td className="alm-nowrap">{r.fecha} · {r.hora}</td>
                          <td>{r.autor}</td>
                          <td>
                            {sinResultados
                              ? <Badge tone="neutral">Sin resultados</Badge>
                              : <Badge tone="success">{total} {total === 1 ? 'prueba' : 'pruebas'}</Badge>}
                          </td>
                          {/* Ver detalle: abre el PDF de la EVAPRE en el visor. Corta la propagación para que ni el
                              clic ni el doble clic seleccionen/adjunten la fila. */}
                          <td className="alm-col-acciones" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                            <Button
                              type="button"
                              variant="secondary-accent"
                              size="sm"
                              icon={LuEye}
                              aria-label={`Ver detalle de la EVAPRE N° ${r.numero}`}
                              disabled={!r.archivoUrl}
                              onClick={() => setVerPdf({
                                src: r.archivoUrl,
                                title: `Evaluación preanestésica N° ${r.numero}`,
                                subtitle: `${solicitud.paciente.nombre} · ${r.fecha} · ${r.hora}`,
                              })}
                            >
                              Ver detalle
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selected && (
                <section className="alm-preview" aria-label={`Resultados de la EVAPRE N° ${selected.numero}`} role="status">
                  <h4 className="alm-preview-titulo">Resultados de la EVAPRE N° {selected.numero}</h4>
                  <div className="alm-table-wrap alm-resultados">
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
                </section>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" disabled={!datos} onClick={() => adjuntar(selected)}>Adjuntar resultados</Button>
        </div>
      </div>
    </div>
    {verPdf && <PdfViewerModal {...verPdf} onClose={() => setVerPdf(null)} />}
    </>
  );
}
