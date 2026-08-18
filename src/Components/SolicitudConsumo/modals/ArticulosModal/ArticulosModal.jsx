'use client';

import { useEffect, useState } from 'react';
import './ArticulosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import DescarteModal from '../DescarteModal/DescarteModal';
import { DEFAULT_BODEGA_DESPACHA, DEFAULT_BODEGA_PIDE } from '../CabeceraModal/CabeceraModal';
import { CATALOGO_ARTICULOS, TIPOS_ARTICULO } from '@/hooks/SolicitudConsumo/mockSolicitudConsumoData';
import {
  LuArrowLeft,
  LuArrowRight,
  LuBoxes,
  LuCheck,
  LuCircleHelp,
  LuPackagePlus,
  LuSave,
  LuSearch,
  LuShoppingCart,
  LuTrash2,
  LuTriangleAlert,
  LuWarehouse,
  LuX,
} from 'react-icons/lu';

// Cabecera de los items de un carrito, según el modo: vacía para una
// solicitud nueva, precargada desde la reposición para edición.
function initialPedido(mode, rep) {
  if (mode === 'editar' && rep) {
    return rep.articulos.map((a) => {
      const art = CATALOGO_ARTICULOS.find((x) => x.id === a.id);
      return { ...a, excedeStock: art ? a.cantidad > art.disp : false };
    });
  }
  return [];
}

// Paso 2 de "Nueva solicitud de consumo" (mode="nuevo") y también la pantalla
// de edición de una reposición existente (mode="editar", sin la barra de
// progreso — se entra directo desde "Editar" en la fila). El carrito
// (pedido) es estado local: solo sale de este componente al confirmar
// (onSubmit) — igual que el resto del flujo, la reposición real no se toca
// hasta ese punto. El padre solo monta este componente mientras está
// abierto (ver solicitud-consumo.jsx): cada apertura es un mount nuevo, así
// que el carrito arranca limpio (vacío o precargado) sin necesitar un efecto
// de "reset" — evita el antipatrón de setState síncrono dentro de un efecto.
export default function ArticulosModal({ mode, rep, tipoArticuloNuevo, onBack, onClose, onSubmit }) {
  const [pedido, setPedido] = useState(() => initialPedido(mode, rep));
  const [original] = useState(() => initialPedido(mode, rep));
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [catalogQty, setCatalogQty] = useState({});
  const [alertMsg, setAlertMsg] = useState(null);
  const [showDescarte, setShowDescarte] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !showDescarte) pedirCerrar();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDescarte, pedido, original]);

  const tipoActual = mode === 'editar' ? (rep?.tipoArticulo || null) : tipoArticuloNuevo;
  const tipoLabel = mode === 'editar' ? (tipoActual || 'No especificado') : tipoActual;
  const tipoFiltro = tipoActual || TIPOS_ARTICULO[0];
  const bodegaPide = mode === 'editar' ? rep?.bodega : DEFAULT_BODEGA_PIDE;
  const bodegaDespacha = mode === 'editar' ? rep?.bodegaDespacha : DEFAULT_BODEGA_DESPACHA;

  const term = search.trim().toLowerCase();
  const enTipo = CATALOGO_ARTICULOS.filter((a) => a.tipo === tipoFiltro);
  const porTermino = term
    ? enTipo.filter((a) => a.id.toLowerCase().includes(term) || a.desc.toLowerCase().includes(term))
    : enTipo;
  const disponiblesCount = porTermino.filter((a) => a.disp > 0).length;
  const filtrados = filtro === 'disponibles' ? porTermino.filter((a) => a.disp > 0) : porTermino;

  function pedidoFueCambiado() {
    if (mode === 'editar') {
      if (pedido.length !== original.length) return true;
      return pedido.some((p, i) => !original[i] || p.id !== original[i].id || p.cantidad !== original[i].cantidad);
    }
    return pedido.length > 0;
  }

  function pedirCerrar() {
    if (pedidoFueCambiado()) setShowDescarte(true);
    else onClose();
  }

  function agregarArticulo(art) {
    if (pedido.some((p) => p.id === art.id)) return;
    const n = Math.max(1, parseInt(catalogQty[art.id], 10) || 1);
    setPedido((prev) => [...prev, { id: art.id, desc: art.desc, cantidad: n, excedeStock: n > art.disp }]);
  }

  function quitarArticulo(id) {
    setPedido((prev) => prev.filter((p) => p.id !== id));
  }

  function actualizarCantidad(id, valor) {
    const art = CATALOGO_ARTICULOS.find((a) => a.id === id);
    const n = parseInt(valor, 10);
    const cantidad = !n || n < 1 ? 1 : n;
    setPedido((prev) => prev.map((p) => (p.id === id ? { ...p, cantidad, excedeStock: art ? cantidad > art.disp : false } : p)));
  }

  function handleConfirmar() {
    if (pedido.length === 0) {
      setAlertMsg('Agrega al menos un artículo antes de continuar.');
      return;
    }
    if (pedido.some((p) => p.excedeStock)) {
      setAlertMsg('Hay artículos con cantidad mayor a la disponible. Ajusta la cantidad antes de continuar.');
      return;
    }
    if (mode === 'editar') onSubmit({ mode, repId: rep.id, items: pedido });
    else onSubmit({ mode, tipoArticulo: tipoArticuloNuevo, items: pedido });
  }

  const totalUnidades = pedido.reduce((s, p) => s + p.cantidad, 0);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal modal-xl" role="dialog" aria-modal="true" aria-labelledby="articulos-modal-title">
          <ModalHeader
            icon={LuBoxes}
            tone="primary"
            title={mode === 'editar' ? `Editar solicitud ${rep.id}` : 'Nueva solicitud de consumo'}
            titleId="articulos-modal-title"
            onClose={pedirCerrar}
          />

          {mode === 'nuevo' ? (
            <div className="modal-progress-bar">
              <div className="progress-step done"><span className="dot"><LuCheck className="icon" aria-hidden="true" /></span><span className="label">Datos de la solicitud</span></div>
              <div className="progress-sep"></div>
              <div className="progress-step active"><span className="dot">2</span><span className="label">Artículos</span></div>
              <div style={{ flex: 1 }}></div>
              <div className="modal-context-line">
                <LuWarehouse className="icon" aria-hidden="true" />
                <span>{bodegaPide}</span>
                <LuArrowRight className="icon" aria-hidden="true" />
                <span>{bodegaDespacha}</span>
                <span>·</span>
                <b>{tipoLabel}</b>
              </div>
            </div>
          ) : (
            <div className="modal-context-edit">
              <LuWarehouse className="icon" aria-hidden="true" />
              <span>{bodegaPide}</span>
              <LuArrowRight className="icon" aria-hidden="true" />
              <span>{bodegaDespacha}</span>
              <span>·</span>
              <b>{tipoLabel}</b>
            </div>
          )}

          {alertMsg && (
            <div className="inline-alert show">
              <LuTriangleAlert className="icon" aria-hidden="true" />
              <span>{alertMsg}</span>
            </div>
          )}

          <div className="modal-body-split">
            <div className="modal-main-col">
              <div className="section-divider" style={{ marginTop: 0 }}>
                <h4>Seleccionar artículos por bodega</h4>
                <div className="line"></div>
              </div>

              <div className="search-toolbar-row">
                <div className="search-field" style={{ maxWidth: '100%', flex: 1 }}>
                  <LuSearch className="icon" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Buscar por código o descripción..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="filter-chips">
                  <button type="button" className={`filter-chip${filtro === 'todos' ? ' active' : ''}`} onClick={() => setFiltro('todos')}>
                    Todos <span className="count">{porTermino.length}</span>
                  </button>
                  <button type="button" className={`filter-chip${filtro === 'disponibles' ? ' active' : ''}`} onClick={() => setFiltro('disponibles')}>
                    Disponibles <span className="count">{disponiblesCount}</span>
                  </button>
                </div>
              </div>

              <div className="search-results-wrap compact">
                <table>
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th style={{ width: 120 }}>ID artículo</th>
                      <th className="center" style={{ width: 100 }}>Disponibles</th>
                      <th className="center" style={{ width: 110 }}>
                        <span className="tooltip-wrap" tabIndex={0}>
                          Por vencer
                          <LuCircleHelp className="icon tooltip-icon" aria-hidden="true" />
                          <span className="tooltip-bubble">Unidades con vencimiento en los próximos 30 días — se recomienda priorizar su uso.</span>
                        </span>
                      </th>
                      <th className="center" style={{ width: 110 }}>Cantidad</th>
                      <th style={{ width: 48 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="small-empty">
                            <LuSearch className="icon" aria-hidden="true" />
                            <span>No se encontraron artículos para tu búsqueda.</span>
                          </div>
                        </td>
                      </tr>
                    ) : filtrados.map((a) => {
                      const yaAgregado = pedido.some((p) => p.id === a.id);
                      const qty = catalogQty[a.id] ?? '1';
                      const qtyInvalid = (parseInt(qty, 10) || 1) > a.disp;
                      return (
                        <tr key={a.id}>
                          <td className="strong">{a.desc}</td>
                          <td className="muted-code">{a.id}</td>
                          <td className={`center avail ${a.disp > 0 ? 'pos' : 'zero'}`}>{a.disp}</td>
                          <td className={`center avail ${a.porVencer > 0 ? 'pos' : 'zero'}`}>{a.porVencer}</td>
                          <td className="center">
                            <input
                              type="number"
                              min={1}
                              max={a.disp > 0 ? a.disp : 1}
                              className={`catalog-qty${qtyInvalid ? ' invalid' : ''}`}
                              title={yaAgregado ? 'Ya agregado' : qtyInvalid ? (a.disp === 0 ? 'Sin stock disponible' : `Solo hay ${a.disp} disponibles`) : 'Cantidad a solicitar'}
                              value={qty}
                              disabled={yaAgregado}
                              onChange={(e) => setCatalogQty((prev) => ({ ...prev, [a.id]: e.target.value }))}
                            />
                          </td>
                          <td className="center">
                            <span
                              className={`btn-add-row${yaAgregado ? ' added' : ''}`}
                              title={yaAgregado ? 'Ya agregado' : 'Agregar al pedido'}
                              role="button"
                              tabIndex={0}
                              onClick={() => agregarArticulo(a)}
                            >
                              {yaAgregado ? <LuCheck className="icon" aria-hidden="true" /> : <LuPackagePlus className="icon" aria-hidden="true" />}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="modal-side-col">
              <div className="side-col-header">
                <h4>Artículos del pedido</h4>
                <span className="footer-note">{pedido.length}</span>
              </div>

              <div className="pedido-side-list">
                {pedido.length === 0 ? (
                  <div className="small-empty">
                    <LuShoppingCart className="icon" aria-hidden="true" />
                    <span>Aún no has agregado artículos a este pedido.</span>
                  </div>
                ) : pedido.map((p) => {
                  const art = CATALOGO_ARTICULOS.find((a) => a.id === p.id);
                  const disp = art ? art.disp : 0;
                  return (
                    <div className="pedido-side-item" key={p.id}>
                      <div className="row-top">
                        <div>
                          <div className="art-name">{p.desc}</div>
                          <div className="art-code">{p.id}</div>
                        </div>
                        <span className="btn-remove-row" title="Quitar" role="button" tabIndex={0} onClick={() => quitarArticulo(p.id)}>
                          <LuTrash2 className="icon" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="row-bottom">
                        <span className="stock-hint">Disponible: <b>{disp}</b></span>
                        <input
                          type="number"
                          min={1}
                          className={`qty-input${p.excedeStock ? ' invalid' : ''}`}
                          value={p.cantidad}
                          onChange={(e) => actualizarCantidad(p.id, e.target.value)}
                        />
                      </div>
                      {p.excedeStock && (
                        <div className="qty-error show">
                          <LuTriangleAlert className="icon" aria-hidden="true" />
                          Solo hay {disp} disponibles
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pedido-summary vertical">
                <span>Artículos: <b>{pedido.length}</b></span>
                <span>Unidades totales: <b>{totalUnidades}</b></span>
              </div>
            </aside>
          </div>

          <div className="modal-footer">
            {mode === 'nuevo' && (
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                <LuArrowLeft className="icon" aria-hidden="true" />
                Atrás
              </button>
            )}
            <div style={{ flex: 1 }}></div>
            <button type="button" className="btn btn-secondary" onClick={pedirCerrar}>
              <LuX className="icon" aria-hidden="true" />
              {mode === 'editar' ? 'Cerrar' : 'Descartar'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pedido.length === 0 || pedido.some((p) => p.excedeStock)}
              onClick={handleConfirmar}
            >
              {mode === 'editar' ? <LuSave className="icon" aria-hidden="true" /> : <LuCheck className="icon" aria-hidden="true" />}
              {mode === 'editar' ? 'Guardar cambios' : 'Crear solicitud'}
            </button>
          </div>
        </div>
      </div>

      <DescarteModal
        open={showDescarte}
        mode={mode}
        onKeepEditing={() => setShowDescarte(false)}
        onConfirm={() => { setShowDescarte(false); onClose(); }}
      />
    </>
  );
}
