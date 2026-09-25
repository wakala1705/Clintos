'use client';

import { useRef } from 'react';
import {
  LuCalendarDays, LuChevronsUpDown, LuCircleArrowLeft, LuList,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { LISTADO_PROGRAMACIONES } from '@/hooks/ProgramacionSalaCirugias/mockListadoProgramaciones';
import './ListadoProgramacionesModal.css';

// Réplica visual de la ventana legada "Listado de Programaciones - Revisión"
// (encargo explícito, 2026-09-25: mismos campos y columnas tal cual, solo
// visual, abierta desde "Listado de cirugías"). Sin lógica: el ícono de
// ordenar de los encabezados es decorativo (no un botón, para no ofrecer un
// control que no hace nada) y "Cambiar estado" no tiene acción. Los íconos
// de filtro/lupa de la referencia se quitaron por encargo explícito.
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
  { key: 'pApellido', label: 'P. Apellido' },
  { key: 'sApellido', label: 'S. Apellido' },
  { key: 'pNombre', label: 'P. Nombre' },
  { key: 'sNombre', label: 'S. Nombre' },
];

export default function ListadoProgramacionesModal({ onClose }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

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
            <table className="lpm-table">
              <thead>
                <tr>
                  {COLUMNAS.map((col) => (
                    <th key={col.key} className={col.check ? 'lpm-check' : col.align}>
                      <span className="lpm-th">
                        <span className="lpm-th-label">{col.label}</span>
                        <LuChevronsUpDown className="icon lpm-th-sort" aria-hidden="true" />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LISTADO_PROGRAMACIONES.map((fila) => (
                  <tr key={fila.noProgramacion}>
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
                      <td key={col.key} className={col.align}>{fila[col.key]}</td>
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
