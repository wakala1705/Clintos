'use client';

import { useRef } from 'react';
import {
  LuCalendarDays, LuChevronsUpDown, LuCircleArrowLeft, LuFilter, LuList, LuSearch,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { LISTADO_PROGRAMACIONES } from '@/hooks/ProgramacionSalaCirugias/mockListadoProgramaciones';
import './ListadoProgramacionesModal.css';

// Réplica visual de la ventana legada "Listado de Programaciones - Revisión"
// (encargo explícito, 2026-09-25: mismos campos y columnas tal cual, solo
// visual, abierta desde "Listado de cirugías"). Sin lógica: ordenar/filtrar/
// buscar de los encabezados son íconos decorativos (no botones, para no
// ofrecer controles que no hacen nada) y "Cambiar estado" no tiene acción.
// `tool` replica el ícono que cada encabezado trae en la referencia (embudo
// = filtro, lupa = búsqueda, ninguno en los checkboxes).
const COLUMNAS = [
  { key: 'sala', label: 'Sala', tool: 'filter' },
  { key: 'noProgramacion', label: 'No. Programación', tool: 'search', align: 'lpm-center' },
  { key: 'consecutivo', label: 'Consecutivo', tool: 'filter' },
  { key: 'fechaProg', label: 'Fecha Prog.', tool: 'search', align: 'lpm-right' },
  { key: 'duracion', label: 'Duración (min.)', tool: 'search', align: 'lpm-right' },
  { key: 'pedInventario', label: 'Ped. Inventario', check: true },
  { key: 'trasladoCirugia', label: 'Traslado a Cirugía', check: true },
  { key: 'noAdmision', label: 'No. Admisión', tool: 'filter' },
  { key: 'idAfiliado', label: 'Id. Afiliado', tool: 'filter' },
  { key: 'pApellido', label: 'P. Apellido', tool: 'filter' },
  { key: 'sApellido', label: 'S. Apellido', tool: 'filter' },
  { key: 'pNombre', label: 'P. Nombre', tool: 'filter' },
  { key: 'sNombre', label: 'S. Nombre', tool: 'filter' },
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
                        <span className="lpm-th-tools" aria-hidden="true">
                          <LuChevronsUpDown className="icon" />
                          {col.tool === 'filter' && <LuFilter className="icon" />}
                          {col.tool === 'search' && <LuSearch className="icon" />}
                        </span>
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
