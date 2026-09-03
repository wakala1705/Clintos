'use client';

import { useEffect, useState } from 'react';
import './Facturacion.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { fetchFacturas } from '@/hooks/Facturacion/mockFacturasData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import FiltrosFacturasPopover from './FiltrosFacturasPopover/FiltrosFacturasPopover';
import FiltrosActivosChips from './FiltrosActivosChips/FiltrosActivosChips';
import FacturaListPane from './FacturaListPane/FacturaListPane';
import FacturaDetallePanel from './FacturaDetallePanel/FacturaDetallePanel';
import FacturaVistaClasica from './FacturaVistaClasica/FacturaVistaClasica';
import { LuPlus, LuSearch } from 'react-icons/lu';

const PAGE_SIZE = 15;
const FILTROS_INICIALES = { clase: 'todas', tipo: 'todas', desde: '', hasta: '' };

export default function Facturacion() {
  // Toggle "Vista nueva / Vista clásica" (encargo explícito) -- FacturaVistaClasica
  // es una réplica visual del formulario legacy de referencia, con su propio
  // estado interno (no comparte query/filtros/selección con esta vista).
  const [vista, setVista] = useState('nueva');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [sortBy, setSortBy] = useState('recientes');
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState('loading'); // loading | ready
  const [facturas, setFacturas] = useState([]);
  const [total, setTotal] = useState(0);

  const [selectedId, setSelectedId] = useState(null);
  // Solo importa en el layout mobile apilado (<=768px, ver Facturacion.css /
  // FacturaDetallePanel.css) -- en desktop ambas columnas están siempre
  // visibles. Seleccionar una fila abre el detalle a pantalla completa;
  // "Volver al listado" solo lo oculta, no pierde la selección de escritorio.
  const [detailOpenMobile, setDetailOpenMobile] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('loading');
      setPage(1);
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchFacturas({
      query: debouncedQuery, filtros, sortBy, page, pageSize: PAGE_SIZE,
    }).then(({ items, total: totalCount }) => {
      if (cancelled) return;
      setFacturas(items);
      setTotal(totalCount);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [debouncedQuery, filtros, sortBy, page]);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  function handleApplyFiltros(next) {
    setStatus('loading');
    setPage(1);
    setFiltros(next);
  }
  function handleRemoveFiltro(key) {
    setStatus('loading');
    setPage(1);
    setFiltros((prev) => {
      if (key === 'fechas') return { ...prev, desde: '', hasta: '' };
      return { ...prev, [key]: 'todas' };
    });
  }
  function handleChangeSortBy(value) {
    setStatus('loading');
    setPage(1);
    setSortBy(value);
  }
  function handleChangePage(newPage) {
    setStatus('loading');
    setPage(newPage);
  }
  function handleClearFilters() {
    setStatus('loading');
    setPage(1);
    setQuery('');
    setDebouncedQuery('');
    setFiltros(FILTROS_INICIALES);
  }
  function handleSelect(id) {
    setSelectedId(id);
    setDetailOpenMobile(true);
  }

  const activeFiltrosCount = (filtros.clase !== 'todas' ? 1 : 0)
    + (filtros.tipo !== 'todas' ? 1 : 0)
    + (filtros.desde || filtros.hasta ? 1 : 0);
  const selectedFactura = facturas.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Facturación"
          page="Facturas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="fact-page-header">
            <div>
              <h1>Facturas</h1>
              <p>Consulta, filtra y gestiona las facturas emitidas.</p>
            </div>
            <div className="fact-page-header-actions">
              <div className="segmented-control" role="tablist" aria-label="Vista de la pantalla de facturas">
                <button type="button" role="tab" aria-selected={vista === 'nueva'} className={`segmented-btn${vista === 'nueva' ? ' active' : ''}`} onClick={() => setVista('nueva')}>
                  Vista nueva
                </button>
                <button type="button" role="tab" aria-selected={vista === 'clasica'} className={`segmented-btn${vista === 'clasica' ? ' active' : ''}`} onClick={() => setVista('clasica')}>
                  Vista clásica
                </button>
              </div>
              <Button icon={LuPlus} onClick={() => {}}>Nueva factura</Button>
            </div>
          </div>

          {vista === 'clasica' ? (
            <div className="card fact-card-shell">
              <FacturaVistaClasica />
            </div>
          ) : (
            <div className="card fact-card-shell">
              <div className="filter-bar">
                <div className="search-field fact-search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar por No. factura, tercero o afiliado"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar por número de factura, tercero o afiliado"
                  />
                </div>

                <div className="filter-spacer" />

                <FiltrosActivosChips filtros={filtros} onRemove={handleRemoveFiltro} />

                <FiltrosFacturasPopover filtros={filtros} onApply={handleApplyFiltros} activeCount={activeFiltrosCount} />
              </div>

              <div className="fact-split">
                <FacturaListPane
                  status={status}
                  facturas={facturas}
                  total={total}
                  page={page}
                  pageSize={PAGE_SIZE}
                  sortBy={sortBy}
                  onChangeSortBy={handleChangeSortBy}
                  onChangePage={handleChangePage}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onClearFilters={handleClearFilters}
                />

                <FacturaDetallePanel
                  factura={selectedFactura}
                  onVolver={() => setDetailOpenMobile(false)}
                  mobileOpen={detailOpenMobile}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
