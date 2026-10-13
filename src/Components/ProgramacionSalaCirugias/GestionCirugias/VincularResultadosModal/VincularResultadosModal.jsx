'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LuEye, LuFlaskConical, LuImage } from 'react-icons/lu';
import './VincularResultadosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { getEvapreRegistros } from '@/hooks/HistoriaClinica/mockEvapreRegistros';
import { CAMPOS_IMAGENES_EVAPRE, CAMPOS_LABORATORIO_EVAPRE } from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';
import { capitalizarNombre, enmascararDocumento } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { datosLaboratorioDesdeEvapre, resultadosDeEvapre } from '@/hooks/ProgramacionSalaCirugias/gestion/laboratorios';

// Textos y campos de cada estudio del paso 4 del chequeo que se vincula desde una EVAPRE.
const TIPOS = {
  laboratorios: {
    icon: LuFlaskConical,
    titulo: 'Vincular resultados de laboratorio',
    closeLabel: 'Cerrar vinculación de resultados de laboratorio',
    campos: CAMPOS_LABORATORIO_EVAPRE,
    ayuda: 'Selecciona la EVAPRE de la que tomar los resultados de laboratorio.',
    vacioSub: 'Los resultados de laboratorio se toman de la EVAPRE. Cuando exista una, vuelve a intentarlo.',
    columna: 'Laboratorios',
    item: 'Prueba',
    unidad: ['prueba', 'pruebas'],
  },
  imagenes: {
    icon: LuImage,
    titulo: 'Vincular resultados de imágenes',
    closeLabel: 'Cerrar vinculación de resultados de imágenes',
    campos: CAMPOS_IMAGENES_EVAPRE,
    ayuda: 'Selecciona la EVAPRE de la que tomar los resultados de imágenes.',
    vacioSub: 'Los resultados de imágenes se toman de la EVAPRE. Cuando exista una, vuelve a intentarlo.',
    columna: 'Imágenes',
    item: 'Estudio',
    unidad: ['estudio', 'estudios'],
  },
};

// Modal de "Vincular resultados" del paso Laboratorios / Estudios de imágenes (Gestión de cirugías,
// simulado). Mismo patrón que VincularEvapreModal: se listan las EVAPRE del
// paciente y se elige de cuál tomar los resultados de laboratorio (están en la
// sección Laboratorios de la evaluación, no se cargan a mano). Al elegir una
// fila se previsualizan sus resultados; "Vincular resultados" los pasa al
// chequeo. Elegir = clic en la fila (doble clic o Enter sobre la ya elegida la
// vincula).
export default function VincularResultadosModal({
  tipo = 'laboratorios', solicitud, onClose, onVincular,
}) {
  const cfg = TIPOS[tipo];
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const { paciente } = solicitud;
  const registros = useMemo(
    () => getEvapreRegistros(paciente.numeroDocumento),
    [paciente.numeroDocumento],
  );
  // Cantidad de resultados por EVAPRE (0 = no se puede elegir).
  const conteos = useMemo(
    () => Object.fromEntries(registros.map((r) => [r.id, resultadosDeEvapre(r, cfg.campos).length])),
    [registros, cfg],
  );
  const [selectedId, setSelectedId] = useState(null);
  const [verPdf, setVerPdf] = useState(null);
  const selected = registros.find((r) => r.id === selectedId) ?? null;
  const resultados = selected ? resultadosDeEvapre(selected, cfg.campos) : [];
  const datos = selected ? datosLaboratorioDesdeEvapre(selected, cfg.campos) : null;

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function vincular(registro) {
    const d = datosLaboratorioDesdeEvapre(registro, cfg.campos);
    if (d) onVincular(d);
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
          icon={cfg.icon}
          tone="primary"
          title={cfg.titulo}
          titleId="alm-title"
          subtitle={`${paciente.nombre} · ${enmascararDocumento(paciente.tipoDocumento, paciente.numeroDocumento)}`}
          onClose={onClose}
          closeLabel={cfg.closeLabel}
        />

        <div className="modal-body alm-body">
          {registros.length === 0 ? (
            <div className="alm-empty" role="status">
              <p className="alm-empty-title">Este paciente no tiene evaluaciones preanestésicas</p>
              <p className="alm-empty-sub">
                {cfg.vacioSub}
              </p>
            </div>
          ) : (
            <>
              <p className="alm-help">{cfg.ayuda}</p>

              <div className="alm-table-wrap alm-lista">
                <table className="alm-table">
                  <thead>
                    <tr>
                      <th scope="col">N° registro</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Anestesiólogo</th>
                      <th scope="col">{cfg.columna}</th>
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
                          onDoubleClick={() => { if (!sinResultados) vincular(r); }}
                          onKeyDown={(e) => {
                            if (sinResultados || e.target !== e.currentTarget) return;
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            e.preventDefault();
                            if (isSelected) vincular(r);
                            else setSelectedId(r.id);
                          }}
                        >
                          <td className="alm-nowrap">{r.numero}</td>
                          <td className="alm-nowrap">{r.fecha} - {r.hora}</td>
                          <td>{capitalizarNombre(r.autor)}</td>
                          <td>
                            {sinResultados
                              ? <Badge tone="neutral">Sin resultados</Badge>
                              : <Badge tone="success">{total} {cfg.unidad[total === 1 ? 0 : 1]}</Badge>}
                          </td>
                          {/* Ver detalle: abre el PDF de la EVAPRE en el visor. Corta la propagación para que ni el
                              clic ni el doble clic seleccionen/vinculen la fila. */}
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
                                subtitle: `${paciente.nombre} · ${r.fecha} - ${r.hora}`,
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
                          <th scope="col">{cfg.item}</th>
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
          {registros.length === 0 ? (
            <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="button" disabled={!datos} onClick={() => vincular(selected)}>Vincular resultados</Button>
            </>
          )}
        </div>
      </div>
    </div>
    {verPdf && <PdfViewerModal {...verPdf} onClose={() => setVerPdf(null)} />}
    </>
  );
}
