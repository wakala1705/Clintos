'use client';

import './FacturasGridClasica.css';
import Badge from '@/Components/Badge/Badge';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import FacturasEmptyState from '../../FacturasEmptyState/FacturasEmptyState';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import { LuEye, LuPrinter } from 'react-icons/lu';

const COLUMNS = [
  { key: 'facturacion', label: 'Facturación' },
  { key: 'numero', label: 'No. Factura' },
  { key: 'documento', label: 'Documento' },
  { key: 'terceroRazonSocial', label: 'Tercero Razón Social' },
  { key: 'tipoContrato', label: 'Tipo Contrato' },
  { key: 'tipo', label: 'Tipo Factura' },
  { key: 'clase', label: 'Clase' },
  { key: 'fecha', label: 'F. Factura' },
  { key: 'fechaVencimiento', label: 'F. Vencimiento' },
  { key: 'valorTotal', label: 'Valor Total' },
  { key: 'flagFE', label: 'F.Elect' },
  { key: 'estadoPE', label: 'Estado de envío' },
  { key: 'estado', label: 'Estado FE' },
  { key: 'acciones', label: 'Acciones' },
];

const TIPO_LABEL = {
  individual: 'Individual',
  masiva: 'Masiva',
  copago: 'Copago',
  moderadora: 'Moderadora',
  'pago-compartido': 'Pago Compartido',
};
const CLASE_LABEL = { salud: 'Salud', particular: 'Particular' };

// 3 estados del flujo de facturación electrónica (encargo explícito) --
// "enviada" es el estado normal/mayoritario, sin relación con `estado`
// (anulada/pendiente-electronica, ver FacturaRow) que es un concepto
// distinto (factura anulada) y no se toca acá.
const ESTADO_PE = {
  pendiente: { label: 'Pendiente', tone: 'warn' },
  'fe-pendiente': { label: 'Pendiente de correo', tone: 'warn' },
  enviada: { label: 'Enviada', tone: 'success' },
};

// Columna "Facturación" (encargo: primera columna de la grilla, antes "F"
// sin significado -- ver mismo campo duplicado en FacturaDetalleModalClasico
// y su origen en mockFacturasData.js) -- 2 estados, sin relación con
// `estado`/`estadoPE` de arriba.
const ESTADO_FACTURACION = {
  pendiente: { label: 'Pendiente', tone: 'warn' },
  facturada: { label: 'Facturada', tone: 'success' },
};

// Columna "Estado FE" del formulario legacy (P/A, encargo explícito) --
// deriva de `f.estado`, solo 2 estados (encargo: "solo debe manejar dos
// estados: procesada/anulada"): 'anulada' -> Anulada, cualquier otro valor
// (null/'pendiente-electronica') -> Procesada (tone="info" -- azul, mismo
// `--status-info-bg`/`--status-info-fg` que ya usan otras features para
// Badge tone="info" -- Facturación no los tenía declarados en su :root
// todavía, se agregaron en shared.css para ese cambio, mismo bug ya
// documentado antes para ModalHeader/--gray-bg). 'pendiente-electronica'
// tuvo brevemente su propio badge "Pend. electrónica" acá -- revertido, esta
// columna no distingue ese caso (el dato en sí sigue existiendo en el mock,
// solo esta columna lo colapsa).
function estadoFacturaBadge(f) {
  return f.estado === 'anulada'
    ? { label: 'Anulada', tone: 'danger' }
    : { label: 'Procesada', tone: 'info' };
}

// Réplica de la grilla densa del formulario legacy de Facturas (encargo
// explícito, ver imagen de referencia) -- a diferencia de FacturaRow (vista
// nueva), acá SÍ se muestran la mayoría de las columnas originales, con
// scroll horizontal propio (nunca scrollea la página, ver AGENTS.md
// "Responsive"). Sede/Administradora Afi/Usuario/Procedencia/No. Admisión/
// Id. Afiliado se ocultaron de esta grilla (encargo explícito) pero siguen
// disponibles en FacturaDetalleModalClasico ("Ver detalle"). Columna "C"
// (encargo explícito: su significado no está claro todavía) se sacó de acá y
// bajó a fvcd-compact-fields en ese mismo modal. Columna "F" (primera
// columna, mismo lugar que antes) volvió con significado real: "Facturación"
// (ESTADO_FACTURACION, ver arriba), reemplaza el placeholder "1" fijo que
// tenía cuando también carecía de significado. Doble clic en la fila
// (encargo explícito) abre ese mismo modal -- mismo `onVerDetalle` que
// ya usa el ícono de ojo en Acciones, sin duplicar lógica; el clic simple
// sigue solo seleccionando la fila (`onSelect`).
export default function FacturasGridClasica({
  facturas, selectedId, onSelect, onVerDetalle, onEditar, onImprimir, onClearFilters,
}) {
  // Sin resultados para el filtro/búsqueda activos (encargo: antes la tabla
  // quedaba vacía sin ningún mensaje, indistinguible de "está cargando" o
  // "está roto") -- reusa FacturasEmptyState, mismo componente/copy que ya
  // usa FacturaListPane (vista nueva) para este mismo caso.
  if (facturas.length === 0) {
    return (
      <div className="fvc-grid-scroll">
        <FacturasEmptyState onClearFilters={onClearFilters} />
      </div>
    );
  }

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
              onDoubleClick={() => onVerDetalle(f)}
              tabIndex={0}
              aria-selected={f.id === selectedId}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(f.id); } }}
            >
              <td><Badge tone={ESTADO_FACTURACION[f.estadoFacturacion].tone}>{ESTADO_FACTURACION[f.estadoFacturacion].label}</Badge></td>
              <td className="fvc-strong">{f.numero}</td>
              <td>{f.documento}</td>
              <td className="fvc-ellipsis fvc-uppercase" title={f.terceroRazonSocial}>{f.terceroRazonSocial}</td>
              <td>{f.tipoContrato}</td>
              <td>{TIPO_LABEL[f.tipo]}</td>
              <td>{CLASE_LABEL[f.clase]}</td>
              <td>{formatFechaClasica(f.fecha)}</td>
              <td>{formatFechaClasica(f.fechaVencimiento)}</td>
              <td className="fvc-num">{formatCOP(f.valorTotal)}</td>
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
                    onClick={(e) => { e.stopPropagation(); onImprimir(f); }}
                    aria-label={`Imprimir factura ${f.numero}`}
                    title="Imprimir"
                  >
                    <LuPrinter className="icon" />
                  </button>
                  <RowActionsMenu numero={f.numero} onEditar={() => onEditar(f)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
