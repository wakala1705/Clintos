'use client';

import './ArticulosItemsTable.css';

// Réplica de la grilla superior "Artículos Genéricos" de la referencia
// legacy (catálogo Movimiento De Inventario -> Alistar pedido), reducida a
// 2 columnas (encargo explícito "reorganicemos el contenido, ganemos
// espacio"): la columna "#" se eliminó y Descripción/Id.Artículo se
// fusionaron en una sola columna (descripción arriba en semibold, código
// abajo en regular) en vez de 2 columnas angostas separadas. La selección
// de fila la comunica solo `.mig-grid tbody tr.selected` (shared.css --
// fondo azul suave + barra izquierda), sin un indicador propio de radio
// (encargo explícito, se sacó). Cant. Entregada/Estado/Costo Neto ya se
// habían sacado antes (layout de 2 columnas, ver comentario viejo en git
// log) -- siempre 0/$0/"Pendiente" en un movimiento "Sin Confirmar", sin
// info real que aportar en este paso.
export default function ArticulosItemsTable({ articulos, selectedItem, onSelect }) {
  function handleKeyDown(e, item) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(item);
  }

  return (
    <div className="mig-items-table-scroll">
      <table className="mig-grid mig-items-table">
        <thead>
          <tr>
            <th>Artículo</th>
            <th className="mig-num">Cnt. Esperada</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((a) => (
            <tr
              key={a.item}
              className={a.item === selectedItem ? 'selected' : ''}
              onClick={() => onSelect(a.item)}
              onKeyDown={(e) => handleKeyDown(e, a.item)}
              tabIndex={0}
              aria-selected={a.item === selectedItem}
            >
              <td className="mig-items-info">
                <div className="mig-items-info-text">
                  <span className="mig-items-descripcion mig-strong" title={a.descripcion}>{a.descripcion}</span>
                  <span className="mig-items-codigo">{a.codigo}</span>
                </div>
              </td>
              <td className="mig-num">{a.cantidadSolicitada}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {articulos.length === 0 && (
        <div className="mig-grid-empty">No hay artículos que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}
