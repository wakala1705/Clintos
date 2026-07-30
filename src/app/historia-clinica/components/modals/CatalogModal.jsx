// Catálogo de insumos (overlay por encima del modal de Pedido a farmacia):
// búsqueda + filtro Todos/Disponibles, tabla de artículos con cantidad y botón
// de agregar, y un carrito lateral. Al confirmar, legacy-app.js vuelca la
// selección al resumen de insumos del modal de Pedido.
export default function CatalogModal() {
  return (
    <div className="catalog-overlay" id="catalog-overlay" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
      <div className="catalog-card">
        <div className="catalog-header">
          <h3 id="catalog-title">Seleccionar insumos</h3>
          <button type="button" className="modal-close-btn" id="catalog-close-btn" aria-label="Cerrar catálogo">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="catalog-body">
          <div className="catalog-main">
            <div className="catalog-search-bar">
              <div className="search-field" style={{flex: 1}}>
                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                <input type="text" id="catalog-search" placeholder="Buscar por código o descripción..."/>
              </div>
              <div className="catalog-filter-chips">
                <button type="button" className="catalog-chip active" id="catalog-chip-todos" data-cat-filter="todos">
                  Todos <span className="c-count" id="catalog-count-todos">0</span>
                </button>
                <button type="button" className="catalog-chip" id="catalog-chip-disponibles" data-cat-filter="disponibles">
                  Disponibles <span className="c-count" id="catalog-count-disponibles">0</span>
                </button>
              </div>
            </div>

            <div className="catalog-table-wrap">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{width: '110px'}}>ID artículo</th>
                    <th className="center" style={{width: '90px'}}>Disponibles</th>
                    <th className="center" style={{width: '95px'}}>Por vencer</th>
                    <th className="center" style={{width: '90px'}}>Cantidad</th>
                    <th style={{width: '44px'}}></th>
                  </tr>
                </thead>
                <tbody id="catalog-tbody">{/* filas generadas por legacy-app.js */}</tbody>
              </table>
            </div>
          </div>

          <aside className="catalog-side">
            <div className="catalog-side-header">
              <span>Artículos del pedido</span>
              <span className="catalog-side-count" id="catalog-cart-count">0</span>
            </div>
            <div className="catalog-cart-list" id="catalog-cart-list">
              <div className="catalog-cart-empty" id="catalog-cart-empty">
                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                Aún no has agregado artículos a este pedido.
              </div>
            </div>
            <div className="catalog-side-footer">
              <span>Artículos: <b id="catalog-footer-items">0</b></span>
              <span>Unidades totales: <b id="catalog-footer-units">0</b></span>
            </div>
          </aside>
        </div>

        <div className="modal-footer">
          <div style={{flex: 1}}></div>
          <button type="button" className="btn btn-primary" id="catalog-confirm-btn" disabled>
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Agregar insumos
          </button>
        </div>
      </div>
    </div>
  );
}
