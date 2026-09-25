'use client';

import { useRef } from 'react';
import {
  LuCircleArrowLeft, LuCirclePlus, LuPackageMinus, LuPencil, LuPrinter, LuSearch, LuTrash2,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import './DevolucionesCirugiaModal.css';

// Réplica visual de la ventana legada "Devoluciones en Cirugías" (encargo
// explícito, 2026-09-25: solo el diseño, sin lógica, abierta desde
// "Devolver insumos" en la tab Insumos del detalle de la cirugía). Mismo
// esquema maestro-detalle: devoluciones arriba, ítems de la devolución
// abajo. Filtros precargados con la cirugía de origen. Buscar/Nuevo/
// Modificar/Eliminar/Imprimir no tienen acción; los íconos de lupa/orden de
// los encabezados de la referencia se omiten (mismo criterio que
// ListadoProgramacionesModal).
const COLUMNAS_DEVOLUCIONES = ['Consecutivo', 'Usuario', 'Fecha', 'Aplicada', 'Confirmada'];
const COLUMNAS_ITEMS = [
  { label: 'Item' },
  { label: 'ID' },
  { label: 'Descripción', wide: true },
  { label: 'Cant. Devuelta', align: 'dvm-right' },
  { label: 'Man. Lote', align: 'dvm-center' },
  { label: 'No. Lote' },
];
// Leyenda de colores de estado de la referencia (el estado de cada
// devolución se marca con el color de la fila).
const LEYENDA = [
  { tone: 'green', label: 'Confirmada por farmacia [completado]' },
  { tone: 'amber', label: 'Pendiente por entregar a farmacia' },
  { tone: 'red', label: 'No completada por el usuario' },
  { tone: 'gray', label: 'Anulado en Farmacia' },
];

export default function DevolucionesCirugiaModal({ cirugia, onClose }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={cardRef} className="modal-card dvm-modal-card" role="dialog" aria-modal="true" aria-labelledby="dvm-title">
        <ModalHeader
          icon={LuPackageMinus}
          tone="primary"
          title="Devoluciones en Cirugías"
          titleId="dvm-title"
          onClose={onClose}
        />
        <div className="modal-body dvm-body">
          <div className="dvm-filtros">
            <div className="form-field">
              <label htmlFor="dvm-desde">Desde</label>
              <input id="dvm-desde" type="date" defaultValue={cirugia.fecha} />
            </div>
            <div className="form-field">
              <label htmlFor="dvm-num">Num Cirugía</label>
              <input id="dvm-num" type="text" defaultValue={cirugia.id} />
            </div>
            <div className="dvm-spacer" />
            <div className="form-field">
              <label htmlFor="dvm-usuario">Usuario</label>
              <input id="dvm-usuario" type="text" defaultValue="CLINTOS" />
            </div>
            <Button variant="secondary-accent" icon={LuSearch}>Buscar</Button>
          </div>

          <div className="dvm-table-wrap">
            <table className="dvm-table" aria-label="Devoluciones">
              <thead>
                <tr>{COLUMNAS_DEVOLUCIONES.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={COLUMNAS_DEVOLUCIONES.length} className="dvm-empty">
                    No hay devoluciones registradas para esta cirugía.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="dvm-table-wrap">
            <table className="dvm-table" aria-label="Ítems de la devolución">
              <thead>
                <tr>
                  {COLUMNAS_ITEMS.map((c) => (
                    <th key={c.label} className={[c.align, c.wide && 'dvm-wide'].filter(Boolean).join(' ') || undefined}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={COLUMNAS_ITEMS.length} className="dvm-empty">
                    Selecciona una devolución para ver sus ítems.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer dvm-footer">
          <ul className="dvm-leyenda" aria-label="Estados de la devolución">
            {LEYENDA.map((l) => (
              <li key={l.tone}>
                <span className={`dvm-swatch dvm-swatch-${l.tone}`} aria-hidden="true" />
                {l.label}
              </li>
            ))}
          </ul>
          <div className="dvm-acciones">
            <Button variant="secondary-accent" icon={LuCirclePlus}>Nuevo</Button>
            <Button variant="secondary-accent" icon={LuPencil}>Modificar</Button>
            <Button variant="secondary-accent" icon={LuTrash2}>Eliminar</Button>
            <Button variant="secondary-accent" icon={LuPrinter}>Imprimir</Button>
            <Button variant="secondary" icon={LuCircleArrowLeft} onClick={onClose}>Salir</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
