'use client';

import './FacturaDetallePanel.css';
import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';
import {
  LuArrowLeft, LuBan, LuCopy, LuEllipsis, LuFileText, LuPencil, LuPrinter, LuReceipt,
} from 'react-icons/lu';

const ACCIONES = [
  { key: 'editar', label: 'Editar', icon: LuPencil },
  { key: 'imprimir', label: 'Imprimir', icon: LuPrinter },
  { key: 'copias', label: 'Copias', icon: LuCopy },
  { key: 'anexo', label: 'Anexo por prefijo', icon: LuFileText },
  { key: 'anular', label: 'Anular', icon: LuBan },
  { key: 'mas', label: 'Más acciones', icon: LuEllipsis },
];

// Columna derecha del maestro-detalle. Sin selección: mensaje de estado
// vacío (encargo explícito). Con selección: header + grid de acciones (sin
// funcionalidad real todavía) + ítems facturados (scroll propio + total
// sticky) + datos de origen. `onVolver` solo se usa en el layout mobile
// apilado (ver Facturacion.jsx) — en desktop el panel siempre está visible.
export default function FacturaDetallePanel({ factura, onVolver, mobileOpen = false }) {
  if (!factura) {
    return (
      <div className={`fact-detail-pane fact-detail-empty${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="fact-detail-empty-icon"><LuReceipt className="icon" /></div>
        <div className="fact-detail-empty-title">Selecciona una factura para ver el detalle</div>
        <div className="fact-detail-empty-sub">La información del ítem seleccionado en la lista aparecerá acá.</div>
      </div>
    );
  }

  return (
    <div className={`fact-detail-pane${mobileOpen ? ' mobile-open' : ''}`}>
      <button type="button" className="fact-detail-back" onClick={onVolver}>
        <LuArrowLeft className="icon" aria-hidden="true" />
        Volver al listado
      </button>

      <div className="fact-detail-header">
        <div className="fact-detail-id">No. factura {factura.numero} · No. admisión {factura.noAdmision}</div>
        <div className="fact-detail-name">{factura.nombreAfiliado}</div>
        <div className="fact-detail-amount">{formatCOP(factura.valorTotal)}</div>
      </div>

      <div className="fact-action-grid">
        {ACCIONES.map(({ key, label, icon: Icon }) => (
          <button type="button" key={key} className="fact-action-item">
            <Icon className="icon" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="fact-detail-section fact-items-section">
        <h3>Ítems facturados ({factura.items.length})</h3>
        <div className="fact-items-scroll">
          {factura.items.map((item, idx) => (
            <div className="fact-item-row" key={`${item.referencia}-${idx}`}>
              <span className="fact-item-desc">
                {String(idx + 1).padStart(3, '0')} · {item.descripcion} ({item.referencia})
              </span>
              <span>{formatCOP(item.valor)}</span>
            </div>
          ))}
        </div>
        <div className="fact-items-total">
          <span>Total ítems</span>
          <span>{formatCOP(factura.valorTotal)}</span>
        </div>
      </div>

      <div className="fact-detail-section">
        <h3>Datos de origen</h3>
        <div className="fact-item-row"><span className="fact-item-desc">Administradora</span><span>{factura.administradora}</span></div>
        <div className="fact-item-row"><span className="fact-item-desc">Usuario</span><span>{factura.usuario}</span></div>
        <div className="fact-item-row"><span className="fact-item-desc">Procedencia</span><span>{factura.procedencia}</span></div>
        <div className="fact-item-row"><span className="fact-item-desc">Id. afiliado</span><span>{factura.idAfiliado}</span></div>
      </div>
    </div>
  );
}
