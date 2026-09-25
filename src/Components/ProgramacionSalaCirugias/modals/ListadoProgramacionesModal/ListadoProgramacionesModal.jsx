'use client';

import { useRef, useState } from 'react';
import {
  LuCalendarDays, LuCircleArrowLeft, LuList,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { LISTADO_PROGRAMACIONES } from '@/hooks/ProgramacionSalaCirugias/mockListadoProgramaciones';
import './ListadoProgramacionesModal.css';

// Réplica visual de la ventana legada "Listado de Programaciones - Revisión"
// (encargo explícito, 2026-09-25: mismos campos y columnas tal cual, solo
// visual, abierta desde "Listado de cirugías"). Sin lógica: "Cambiar estado"
// no tiene acción. Los íconos de ordenar/filtro/lupa de los encabezados de
// la referencia se quitaron por encargo explícito. Única interacción: cada
// fila se puede seleccionar (una a la vez, como la fila resaltada de la
// ventana legada) con click o Enter/Espacio.
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

export default function ListadoProgramacionesModal({ onClose }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);
  const [seleccionada, setSeleccionada] = useState(null);

  return (
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
                {LISTADO_PROGRAMACIONES.map((fila) => (
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
                      <td key={col.key} className="lpm-check">
                        <input
                          type="checkbox"
                          checked={fila[col.key]}
                          readOnly
                          tabIndex={-1}
                          aria-label={`${col.label} — programación ${fila.noProgramacion}`}
                        />
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
          <Button variant="secondary" icon={LuCalendarDays}>Cambiar estado</Button>
          <Button variant="secondary" icon={LuCircleArrowLeft} onClick={onClose}>Salir</Button>
        </div>
      </div>
    </div>
  );
}
