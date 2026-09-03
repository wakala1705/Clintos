'use client';

import './FacturaRow.css';
import { formatCOP, formatFecha } from '@/hooks/Facturacion/mockFacturasData';

const ESTADO_LABEL = {
  anulada: 'Anulada',
  'pendiente-electronica': 'Pend. electrónica',
};

// Card compacta (no fila de +20 columnas) — No. Factura + badge de estado,
// tercero/sede, fecha y valor alineado a la derecha (ver AGENTS.md
// "Barra de filtros de listado" / requisitos del encargo de Facturas).
export default function FacturaRow({ factura, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`fact-row${selected ? ' selected' : ''}`}
      onClick={() => onSelect(factura.id)}
      aria-current={selected ? 'true' : undefined}
    >
      <div className="fact-row-main">
        <div className="fact-row-title">
          {factura.numero}
          {factura.estado && (
            <span className={`badge ${factura.estado === 'anulada' ? 'danger' : 'warn'}`}>
              {ESTADO_LABEL[factura.estado]}
            </span>
          )}
        </div>
        <div className="fact-row-sub">{factura.terceroRazonSocial} · {factura.sede}</div>
      </div>
      <div className="fact-row-end">
        <div className="fact-row-date">{formatFecha(factura.fecha)}</div>
        <div className="fact-row-value">{formatCOP(factura.valorTotal)}</div>
      </div>
    </button>
  );
}
