import './CatalogModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCheck, LuSearch, LuShoppingCart } from 'react-icons/lu';

// Catálogo de insumos (overlay por encima del modal de Pedido a farmacia):
// búsqueda + filtro Todos/Disponibles, tabla de artículos con cantidad y botón
// de agregar, y un carrito lateral. Al confirmar, legacy-app.js vuelca la
// selección al resumen de insumos del modal de Pedido.
export default function CatalogModal() {
  return (
    <div className="catalog-overlay" id="catalog-overlay" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
      <div className="catalog-card">
        <ModalHeader
          title="Seleccionar insumos"
          titleId="catalog-title"
          closeId="catalog-close-btn"
          closeLabel="Cerrar catálogo"
        />

        <div className="catalog-body">
          <div className="catalog-main">
            <div className="catalog-search-bar">
              <div className="search-field" style={{flex: 1}}>
                <LuSearch className="icon" aria-hidden="true" />
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
                <LuShoppingCart className="icon" aria-hidden="true" />
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
            <LuCheck className="icon" aria-hidden="true" />
            Agregar insumos
          </button>
        </div>
      </div>
    </div>
  );
}
