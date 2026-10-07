'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LuEye, LuFileCheck } from 'react-icons/lu';
import './VincularEvapreModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { getEvapreRegistros } from '@/hooks/HistoriaClinica/mockEvapreRegistros';
import { etiquetaOpcionEvapre } from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';
import { CONCEPTOS, datosDesdeEvapre } from '@/hooks/ProgramacionSalaCirugias/gestion/valoracion';

const CONCEPTO_TONO = { apto: 'success', condiciones: 'warn', 'no-apto': 'danger' };

// Modal de "Registrar valoración" del paso 3 del chequeo (Gestión de
// cirugías): en vez de diligenciar un formulario, se elige una evaluación
// preanestésica (EVAPRE) ya registrada en Historia clínica del paciente y se
// vincula. El concepto (apto / con condiciones / no apto) se deriva de su ASA
// (ver conceptoDesdeAsa) y se previsualiza antes de confirmar. Elegir =
// clic en la fila (doble clic o Enter sobre la ya elegida la vincula), mismo
// patrón que PlantillaModal de HC.
export default function VincularEvapreModal({ solicitud, onClose, onVincular }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const registros = useMemo(
    () => getEvapreRegistros(solicitud.paciente.numeroDocumento),
    [solicitud.paciente.numeroDocumento],
  );
  const [selectedId, setSelectedId] = useState(null);
  const [verPdf, setVerPdf] = useState(null);
  const selected = registros.find((r) => r.id === selectedId) ?? null;
  const datos = selected ? datosDesdeEvapre(selected) : null;

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function vincular(registro) {
    const d = datosDesdeEvapre(registro);
    if (d) onVincular(d);
  }

  return (
    <>
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card vem-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vem-title"
      >
        <ModalHeader
          icon={LuFileCheck}
          tone="primary"
          title="Vincular evaluación preanestésica"
          titleId="vem-title"
          onClose={onClose}
          closeLabel="Cerrar vinculación de evaluación"
        />

        <div className="modal-body vem-body">
          <p className="vem-paciente">
            <span className="vem-paciente-label">Paciente</span>
            {solicitud.paciente.nombre} · {solicitud.paciente.tipoDocumento} {solicitud.paciente.numeroDocumento}
          </p>

          {registros.length === 0 ? (
            <div className="vem-empty" role="status">
              <p className="vem-empty-title">Este paciente no tiene evaluaciones preanestésicas</p>
              <p className="vem-empty-sub">
                Diligencia la plantilla EVAPRE en Historia clínica de Hospitalización y vuelve a intentarlo.
              </p>
            </div>
          ) : (
            <>
              <p className="vem-help">Selecciona la EVAPRE que corresponde a este procedimiento.</p>
              <div className="vem-table-wrap">
                <table className="vem-table">
                  <thead>
                    <tr>
                      <th scope="col">N° registro</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Anestesiólogo</th>
                      <th scope="col">ASA</th>
                      <th scope="col">Anestesia</th>
                      <th scope="col" className="vem-col-acciones">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r) => {
                      const v = r.contenido?.valores ?? {};
                      const isSelected = r.id === selectedId;
                      return (
                        <tr
                          key={r.id}
                          className={isSelected ? 'selected' : undefined}
                          aria-selected={isSelected}
                          tabIndex={0}
                          onClick={() => setSelectedId(r.id)}
                          onDoubleClick={() => vincular(r)}
                          onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            e.preventDefault();
                            if (isSelected) vincular(r);
                            else setSelectedId(r.id);
                          }}
                        >
                          <td className="vem-nowrap">{r.numero}</td>
                          <td className="vem-nowrap">{r.fecha} · {r.hora}</td>
                          <td>{r.autor}</td>
                          <td>{v.estadoFisicoAsa ? <Badge tone="neutral">ASA {v.estadoFisicoAsa}</Badge> : '—'}</td>
                          <td>{etiquetaOpcionEvapre('tipoAnestesia', v.tipoAnestesia) || '—'}</td>
                          {/* Ver detalle: abre el PDF de la EVAPRE en el visor. Corta la propagación para que ni el
                              clic ni el doble clic seleccionen/vinculen la fila. */}
                          <td className="vem-col-acciones" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
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
                <p className="vem-concepto" role="status">
                  {datos ? (
                    <>
                      Concepto derivado de la EVAPRE:
                      <Badge tone={CONCEPTO_TONO[datos.concepto]}>{CONCEPTOS.find((c) => c.value === datos.concepto).label}</Badge>
                      {datos.concepto === 'no-apto' && (
                        <span className="vem-aviso">La solicitud quedará bloqueada hasta vincular una nueva valoración.</span>
                      )}
                    </>
                  ) : (
                    <span className="vem-aviso">Esta EVAPRE no tiene clasificación ASA, no se puede vincular.</span>
                  )}
                </p>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" disabled={!datos} onClick={() => vincular(selected)}>Vincular evaluación</Button>
        </div>
      </div>
    </div>
    {verPdf && <PdfViewerModal {...verPdf} onClose={() => setVerPdf(null)} />}
    </>
  );
}
