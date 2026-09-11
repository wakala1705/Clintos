'use client';

import './LotesDisponiblesTable.css';

// Semáforo rojo/ámbar/verde para "Vence" -- mismos 3 tonos que el resto del
// proyecto usa para vigencias, sin umbral fijo todavía (60/180 días es un
// primer corte visual; a ajustar cuando el negocio defina la regla real de
// próximo-a-vencer para insumos de farmacia).
function colorVencimiento(diasVence) {
  if (diasVence <= 60) return 'var(--red)';
  if (diasVence <= 180) return 'var(--amber)';
  return 'var(--green)';
}

// Réplica de la grilla inferior "Artículos disponibles para el código" de la
// referencia legacy -- lotes/existencias del artículo seleccionado en
// ArticulosItemsTable (ver AlistarPedidoModal.jsx, que pasa `lotes` desde
// mockSolicitudesData.js). "Item" es la posición del lote dentro de esta
// lista (no un id global) -- Id Sede/Id.Bdg vienen de CONTEXTO_BODEGA (fijos
// para toda la página, no varían por lote); "Id. Artículo" repite el mismo
// código que "Genérico" al final (mismo criterio que la referencia, que
// también lo duplica en ambos extremos de la tabla). Fila seleccionable
// (encargo explícito, mismo patrón clic/Enter-Espacio que ArticulosItemsTable)
// -- alimenta "Resumen de lote" en AlistarPedidoModal.jsx, mismo criterio que
// FacturaItemsTable/"Resumen de factura" en FacturaDetalleModalClasico.
export default function LotesDisponiblesTable({ lotes, selectedIndex, onSelect }) {
  function handleKeyDown(e, index) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(index);
  }

  return (
    <div className="mig-lotes-table-scroll">
      <table className="mig-grid mig-lotes-grid">
        <thead>
          <tr>
            <th>Item</th>
            <th>Id Sede</th>
            <th>Id.Bdg</th>
            <th>Ubicación</th>
            <th>Id. Artículo</th>
            <th className="mig-num">Stock</th>
            <th className="mig-num">Esperada</th>
            <th className="mig-num">Cantidad</th>
            <th>Descripción</th>
            <th>Vence</th>
            <th>Lote Serie</th>
            <th className="mig-num">Días Vence</th>
            <th>Trans.</th>
            <th>No.Documento</th>
            <th>Genérico</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((l, i) => (
            <tr
              key={`${l.loteSerie}-${i}`}
              className={i === selectedIndex ? 'selected' : ''}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              tabIndex={0}
              aria-selected={i === selectedIndex}
            >
              <td>{i + 1}</td>
              <td>{l.idSede}</td>
              <td>{l.bdg}</td>
              <td className="mig-ellipsis" title={l.ubicacion}>{l.ubicacion}</td>
              <td className="mig-strong">{l.generico}</td>
              <td className="mig-num">{l.stock.toFixed(2)}</td>
              <td className="mig-num">{l.esperada.toFixed(2)}</td>
              <td className="mig-num">{l.cantidad.toFixed(2)}</td>
              <td className="mig-ellipsis" title={l.descripcion}>{l.descripcion}</td>
              <td>
                <span className="mig-vence-dot" style={{ background: colorVencimiento(l.diasVence) }} aria-hidden="true" />
                {l.vence.replaceAll('-', '/')}
              </td>
              <td>{l.loteSerie}</td>
              <td className="mig-num">{l.diasVence}</td>
              <td>{l.trans}</td>
              <td>{l.noDocumento}</td>
              <td>{l.generico}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {lotes.length === 0 && (
        <div className="mig-grid-empty">No hay lotes disponibles para este artículo.</div>
      )}
    </div>
  );
}
