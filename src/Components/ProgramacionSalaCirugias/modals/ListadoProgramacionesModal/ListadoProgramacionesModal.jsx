'use client';

import { useRef, useState } from 'react';
import {
  LuCalendarDays, LuCheck, LuList,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { LISTADO_PROGRAMACIONES } from '@/hooks/ProgramacionSalaCirugias/mockListadoProgramaciones';
import CambiarEstadoProgramacionModal from '../CambiarEstadoProgramacionModal/CambiarEstadoProgramacionModal';
import './ListadoProgramacionesModal.css';

// Réplica visual de la ventana legada "Listado de Programaciones - Revisión"
// (encargo explícito, 2026-09-25: mismos campos y columnas tal cual, solo
// visual, abierta desde "Listado de cirugías"). Los íconos de ordenar/
// filtro/lupa de los encabezados de la referencia se quitaron por encargo
// explícito. Cada fila se puede seleccionar (una a la vez, como la fila
// resaltada de la ventana legada) con click o Enter/Espacio; "Cambiar
// estado" habilita con una fila seleccionada y abre
// CambiarEstadoProgramacionModal (esa sí construida con el estilo actual del
// proyecto, no una réplica -- encargo explícito, 2026-09-29). Al validar el
// nuevo estado, la fila sale del listado (ya se resolvió la inconsistencia)
// y se avisa al feature con onCambiarEstado para el toast, mismo patrón que
// Reprogramar/Cancelar en ProgramacionSalaCirugias.jsx.
const COLUMNAS = [
  { key: 'sala', label: 'Sala' },
  { key: 'noProgramacion', label: 'No. Programación', align: 'lpm-center' },
  { key: 'consecutivo', label: 'Consecutivo' },
  { key: 'fechaProg', label: 'Fecha Prog.', align: 'lpm-right' },
  { key: 'duracion', label: 'Duración (min.)', align: 'lpm-right' },
  { key: 'pedInventario', label: 'Ped. Inventario', check: true },
  { key: 'trasladoCirugia', label: 'Traslado a Cirugía', check: true },
  { key: 'noAdmision', label: 'No. Admisión' },
  { key: 'idAfiliado', label: 'Id. Afiliado' },
  // Los 4 campos de nombre de la referencia (P./S. Apellido, P./S. Nombre)
  // agrupados en una sola columna (encargo explícito); los vacíos se omiten.
  {
    key: 'paciente',
    label: 'Paciente',
    value: (f) => [f.pNombre, f.sNombre, f.pApellido, f.sApellido].filter(Boolean).join(' '),
  },
];

export default function ListadoProgramacionesModal({ onClose, onCambiarEstado }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);
  const [filas, setFilas] = useState(LISTADO_PROGRAMACIONES);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  const filaSeleccionada = filas.find((f) => f.noProgramacion === seleccionada);

  function handleConfirmarCambioEstado(estado) {
    setFilas((fs) => fs.filter((f) => f.noProgramacion !== cambiandoEstado.noProgramacion));
    setSeleccionada(null);
    setCambiandoEstado(null);
    onCambiarEstado?.(cambiandoEstado, estado);
  }

  return (
    <>
      <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div ref={cardRef} className="modal-card lpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="lpm-title">
          <ModalHeader
            icon={LuList}
            tone="primary"
            title="Listado de Programaciones - Revisión"
            titleId="lpm-title"
            onClose={onClose}
          />
          <div className="modal-body lpm-body">
            <div className="lpm-intro">
              <p>Programaciones en estado P (Programadas), con fecha anterior a la fecha actual.</p>
              <p>Por favor verifique el estado de estas Programaciones y resuelva la inconsistencia.</p>
            </div>

            <div className="lpm-table-wrap">
              <table className="lpm-table" role="grid" aria-label="Programaciones vencidas">
                <thead>
                  <tr>
                    {COLUMNAS.map((col) => (
                      <th key={col.key} className={col.check ? 'lpm-check' : col.align}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila) => (
                    <tr
                      key={fila.noProgramacion}
                      className={`lpm-row${seleccionada === fila.noProgramacion ? ' selected' : ''}`}
                      tabIndex={0}
                      aria-selected={seleccionada === fila.noProgramacion}
                      onClick={() => setSeleccionada(fila.noProgramacion)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSeleccionada(fila.noProgramacion);
                        }
                      }}
                    >
                      {COLUMNAS.map((col) => (col.check ? (
                        <td
                          key={col.key}
                          className="lpm-check"
                          aria-label={`${col.label} — programación ${fila.noProgramacion}: ${fila[col.key] ? 'sí' : 'no'}`}
                        >
                          {fila[col.key] && <LuCheck className="lpm-check-icon" aria-hidden="true" />}
                        </td>
                      ) : (
                        <td key={col.key} className={col.align}>{col.value ? col.value(fila) : fila[col.key]}</td>
                      )))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="primary" icon={LuCalendarDays} disabled={!filaSeleccionada} onClick={() => setCambiandoEstado(filaSeleccionada)}>
              Cambiar estado
            </Button>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </div>

      {cambiandoEstado && (
        <CambiarEstadoProgramacionModal
          programacion={cambiandoEstado}
          onClose={() => setCambiandoEstado(null)}
          onSubmit={handleConfirmarCambioEstado}
        />
      )}
    </>
  );
}
