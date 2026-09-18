'use client';

import './FacturasGridClasica.css';
import Badge from '@/Components/Badge/Badge';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import FacturasEmptyState from '../../FacturasEmptyState/FacturasEmptyState';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import {
  LuEye, LuPrinter, LuCircleCheck, LuBan,
} from 'react-icons/lu';

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
// `estado`/`estadoPE` de arriba. "Sin facturar" (no "Pendiente", encargo
// explícito) para no confundirse con "Pendiente" de ESTADO_PE (columna
// "Estado de envío", un concepto totalmente distinto).
const ESTADO_FACTURACION = {
  pendiente: { label: 'Sin facturar', tone: 'warn' },
  facturada: { label: 'Facturada', tone: 'success' },
};

// Columna "Estado FE" del formulario legacy (P/A) -- deriva de `f.estado`,
// solo 2 estados (encargo: "solo debe manejar dos estados: procesada/
// anulada"). Se pinta como ícono, no Badge (encargo explícito: "cambiemos
// los badges de 'procesada' por un icono check y 'anulada' por un icono que
// represente el estado anulada") -- `LuBan` reusa el mismo ícono que ya
// representa "Anular" en RowActionsMenu.jsx, misma feature. El color de
// cada ícono conserva el que tenía su tone de Badge (`--status-info-fg`/
// `--red`, ver .fvcg-estado-fe en FacturasGridClasica.css) para no perder
// el significado semántico azul/rojo que tenía el badge.
function EstadoFeIcon({ f }) {
  return f.estado === 'anulada'
    ? <LuBan className="icon fvcg-estado-fe anulada" role="img" aria-label="Anulada" title="Anulada" />
    : <LuCircleCheck className="icon fvcg-estado-fe procesada" role="img" aria-label="Procesada" title="Procesada" />;
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
// tenía cuando también carecía de significado. Doble clic en la fila abre un
// modal distinto según ese mismo estado (encargo explícito): "Sin facturar"
// (`estadoFacturacion === 'pendiente'`) abre modo edición (`onEditar`, mismo
// que ya usa "Editar" en RowActionsMenu) en vez de "Ver detalle" -- una
// factura sin facturar todavía no tiene nada que "ver", tiene que
// completarse; "Facturada" sigue abriendo "Ver detalle" (`onVerDetalle`,
// mismo que ya usa el ícono de ojo en Acciones), sin duplicar lógica en
// ninguno de los dos casos. El clic simple sigue solo seleccionando la fila
// (`onSelect`), sin importar el estado.
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
              onDoubleClick={() => (f.estadoFacturacion === 'pendiente' ? onEditar(f) : onVerDetalle(f))}
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
              <td><EstadoFeIcon f={f} /></td>
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
