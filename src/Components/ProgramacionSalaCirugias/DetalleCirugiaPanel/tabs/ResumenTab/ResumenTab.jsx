'use client';

import './ResumenTab.css';

export default function ResumenTab({ cirugia, onNavigateTab, salaLabel }) {
  const {
    procedimientoPrincipal, personal, equipos, canasta, farmacia,
  } = cirugia;
  const canastaCompleta = canasta.items.every((item) => item.estado === 'disponible');

  return (
    <div className="rt-tab">
      <section className="rt-card">
        <h4 className="rt-card-title">Procedimiento</h4>
        <div className="rt-card-value">{procedimientoPrincipal}</div>
        {/* Antes vivía como campo propio en .dcp-info-grid -- se movió acá al
            reestructurar ese bloque para calzar 1:1 con los campos del
            formulario legacy de referencia (ver DetalleCirugiaPanel.jsx),
            que no incluye Sala. */}
        <ul className="rt-list">
          <li><span className="rt-list-label">Sala</span><span className="rt-list-value">{salaLabel}</span></li>
        </ul>
      </section>

      <section className="rt-card">
        <h4 className="rt-card-title">Personal asignado</h4>
        <ul className="rt-list">
          {personal.map((p) => (
            <li key={p.rol}>
              <span className="rt-list-label">{p.rol}</span>
              <span className="rt-list-value">{p.nombre}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="rt-link" onClick={() => onNavigateTab('personal')}>
          Ver todo el personal ({personal.length})
        </button>
      </section>

      <div className="rt-grid-2">
        <section className="rt-card">
          <h4 className="rt-card-title">Equipos</h4>
          <ul className="rt-list">
            {equipos.slice(0, 2).map((e) => (
              <li key={e.nombre}>
                <span className="rt-list-label">{e.nombre}</span>
                <span className={`rt-tag rt-tag-${e.estado}`}>
                  {e.estado === 'disponible' ? 'Disponible' : (e.estado === 'en-uso' ? 'En uso' : 'Mantenimiento')}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="rt-link" onClick={() => onNavigateTab('equipos')}>
            Ver todos ({equipos.length})
          </button>
        </section>

        <section className="rt-card">
          <h4 className="rt-card-title">Insumos</h4>
          <div className="rt-card-value">Canasta: {canasta.nombre}</div>
          <div className="rt-insumos-meta">
            <span>{canasta.items.length} insumos</span>
            <span className={`rt-tag rt-tag-${canastaCompleta ? 'disponible' : 'faltante'}`}>
              {canastaCompleta ? 'Completa' : 'Incompleta'}
            </span>
          </div>
          <button type="button" className="rt-link" onClick={() => onNavigateTab('insumos')}>Ver canasta</button>
        </section>
      </div>

      <section className="rt-card">
        <h4 className="rt-card-title">Farmacia</h4>
        <div className="rt-card-value">Pedido #{farmacia.numeroPedido}</div>
        <div className="rt-farmacia-estado">
          {farmacia.estado === 'en-preparacion' ? 'En preparación' : (farmacia.estado === 'listo' ? 'Listo' : 'Entregado')}
        </div>
        <button type="button" className="rt-link" onClick={() => onNavigateTab('farmacia')}>Ver pedido</button>
      </section>
    </div>
  );
}
