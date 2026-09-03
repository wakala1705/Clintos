'use client';

import './FacturasGridClasica.css';
import Badge from '@/Components/Badge/Badge';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import { LuEye, LuPencil, LuPrinter } from 'react-icons/lu';

const COLUMNS = [
  { key: 'flag', label: 'F' },
  { key: 'numero', label: 'No. Factura' },
  { key: 'documento', label: 'Documento' },
  { key: 'terceroRazonSocial', label: 'Tercero Razón Social' },
  { key: 'tipoContrato', label: 'Tipo Contrato' },
  { key: 'tipo', label: 'Tipo Factura' },
  { key: 'clase', label: 'Clase' },
  { key: 'fecha', label: 'F. Factura' },
  { key: 'fechaVencimiento', label: 'F. Vencimiento' },
  { key: 'valorTotal', label: 'Valor Total' },
  { key: 'c', label: 'C' },
  { key: 'flagFE', label: 'F.Elect FE' },
  { key: 'estadoPE', label: 'PE' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones' },
];

const TIPO_LABEL = { individual: 'Individual', capitada: 'Capitada' };
const CLASE_LABEL = { salud: 'Salud', particular: 'Particular' };

// 3 estados del flujo de facturación electrónica (encargo explícito) --
// "enviada" es el estado normal/mayoritario, sin relación con `estado`
// (anulada/pendiente-electronica, ver FacturaRow) que es un concepto
// distinto (factura anulada) y no se toca acá.
const ESTADO_PE = {
  pendiente: { label: 'Pendiente', tone: 'neutral' },
  'fe-pendiente': { label: 'Factura electrónica pendiente', tone: 'warn' },
  enviada: { label: 'Enviada', tone: 'success' },
};

// Columna "Estado" del formulario legacy (P/A, encargo explícito) -- deriva
// de `f.estado` (misma fuente que el badge de FacturaRow en la vista nueva):
// 'anulada' -> Anulada, cualquier otro valor (null/'pendiente-electronica')
// -> Pagada.
function estadoFacturaBadge(f) {
  return f.estado === 'anulada'
    ? { label: 'Anulada', tone: 'danger' }
    : { label: 'Pagada', tone: 'success' };
}

// Réplica de la grilla densa del formulario legacy de Facturas (encargo
// explícito, ver imagen de referencia) -- a diferencia de FacturaRow (vista
// nueva), acá SÍ se muestran la mayoría de las columnas originales, con
// scroll horizontal propio (nunca scrollea la página, ver AGENTS.md
// "Responsive"). Sede/Administradora Afi/Usuario/Procedencia/No. Admisión/
// Id. Afiliado se ocultaron de esta grilla (encargo explícito) pero siguen
// disponibles en FacturaDetalleModalClasico ("Ver detalle").
export default function FacturasGridClasica({
  facturas, selectedId, onSelect, onVerDetalle,
}) {
  return (
    <div className="fvc-grid-scroll">
      <table className="fvc-grid">
        <thead>
          <tr>
            {COLUMNS.map((col) => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => (
            <tr
              key={f.id}
              className={f.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(f.id)}
              tabIndex={0}
              aria-selected={f.id === selectedId}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(f.id); } }}
            >
              <td><span className="fvc-flag-badge">1</span></td>
              <td className="fvc-strong">{f.numero}</td>
              <td>{f.documento}</td>
              <td className="fvc-ellipsis" title={f.terceroRazonSocial}>{f.terceroRazonSocial}</td>
              <td>{f.tipoContrato}</td>
              <td>{TIPO_LABEL[f.tipo]}</td>
              <td>{CLASE_LABEL[f.clase]}</td>
              <td>{formatFechaClasica(f.fecha)}</td>
              <td>{formatFechaClasica(f.fechaVencimiento)}</td>
              <td className="fvc-num">{formatCOP(f.valorTotal)}</td>
              <td className="fvc-num">0</td>
              <td>{f.flagFE ? 'Sí' : 'No'}</td>
              <td><Badge tone={ESTADO_PE[f.estadoPE].tone}>{ESTADO_PE[f.estadoPE].label}</Badge></td>
              <td><Badge tone={estadoFacturaBadge(f).tone}>{estadoFacturaBadge(f).label}</Badge></td>
              <td className="fvc-actions-cell">
                <div className="fvc-row-actions">
                  <button
                    type="button"
                    className="fvc-row-action-btn"
                    onClick={(e) => { e.stopPropagation(); onVerDetalle(f); }}
                    aria-label={`Ver detalle de la factura ${f.numero}`}
                    title="Ver detalle"
                  >
                    <LuEye className="icon" />
                  </button>
                  <button
                    type="button"
                    className="fvc-row-action-btn"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Editar factura ${f.numero}`}
                    title="Editar"
                  >
                    <LuPencil className="icon" />
                  </button>
                  <button
                    type="button"
                    className="fvc-row-action-btn"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Imprimir factura ${f.numero}`}
                    title="Imprimir"
                  >
                    <LuPrinter className="icon" />
                  </button>
                  <RowActionsMenu numero={f.numero} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
